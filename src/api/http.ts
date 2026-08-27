/**
 * Thin fetch wrapper for the Balanti backend (see ../../FRONTEND_API_GUIDE.md).
 *
 * The backend's #1 gotcha: HTTP status is frequently 200 even when the call
 * failed — the real result lives in `body.code`. This client normalizes that
 * away so the rest of the app can just `await` a call and `catch (ApiError)`.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://192.168.68.100:8080/api").replace(/\/+$/, "");

export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  /** Real HTTP transport status. */
  status: number;
  /** Envelope `code`, when the response used the standard envelope. */
  code?: number;
  /** Present when the backend skipped the envelope and returned a raw DRF field-error dict (see guide §2.3). */
  fieldErrors?: FieldErrors;

  constructor(message: string, opts: { status: number; code?: number; fieldErrors?: FieldErrors }) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status;
    this.code = opts.code;
    this.fieldErrors = opts.fieldErrors;
  }
}

/** Standard envelope shape (guide §2), loosely typed since not every field is always present. */
export type Envelope<T> = {
  code: number;
  message?: string;
  response?: string;
  data?: T;
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T;
};

let accessToken: string | null = null;

/** Called by the auth store on hydrate/login/logout — keeps this module token-aware without importing the store (would be circular). */
export function setAuthToken(token: string | null) {
  accessToken = token;
}

export function getAuthToken() {
  return accessToken;
}

function fieldErrorsToMessage(errors: FieldErrors): string {
  const first = Object.entries(errors)[0];
  if (!first) return "Request failed.";
  const [field, messages] = first;
  return `${field}: ${messages?.[0] ?? "Invalid value"}`;
}

function buildQuery(query?: Record<string, string | number | boolean | undefined | null>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

type RequestOptions = {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Attach the Bearer token if one is available. Default true — harmless on Public endpoints. */
  auth?: boolean;
};

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<Envelope<T>> {
  const { body, query, auth = true } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(`${BASE_URL}${path}${buildQuery(query)}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError("The server returned a response that wasn't valid JSON.", { status: response.status });
    }
  }

  // DRF's own permission/auth layer raises real HTTP statuses before view code
  // runs (guide §2.1) — these never get wrapped in the envelope.
  if (response.status === 401 || response.status === 403) {
    const detail =
      data && typeof data === "object" && "detail" in (data as Record<string, unknown>)
        ? String((data as Record<string, unknown>).detail)
        : "You need to be signed in to do that.";
    throw new ApiError(detail, { status: response.status });
  }

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const envelope = data as Envelope<T>;
    if (typeof envelope.code === "number") {
      if (envelope.code !== 200) {
        throw new ApiError(envelope.message ?? envelope.response ?? "Request failed.", {
          status: response.status,
          code: envelope.code,
        });
      }
      return envelope;
    }

    // No `code` key at all => raw DRF serializer error dict (guide §2.3).
    if (!response.ok || Object.values(envelope as Record<string, unknown>).every((v) => Array.isArray(v))) {
      const fieldErrors = envelope as unknown as FieldErrors;
      throw new ApiError(fieldErrorsToMessage(fieldErrors), { status: response.status, fieldErrors });
    }
  }

  if (!response.ok) {
    throw new ApiError(`Request failed (${response.status}).`, { status: response.status });
  }

  // Endpoint returned a bare, un-enveloped payload (e.g. a plain array) on success.
  return { code: response.status, data: data as T };
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, options),
  post: <T>(path: string, options?: RequestOptions) => request<T>("POST", path, options),
  patch: <T>(path: string, options?: RequestOptions) => request<T>("PATCH", path, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, options),
};

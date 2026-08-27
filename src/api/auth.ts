import { http } from "./http";
import type { LoginResult } from "./types";

export type RegisterPayload = {
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  password: string;
  confirm_password: string;
  billing_address?: unknown;
  shipping_address?: unknown;
};

export const authApi = {
  register: (payload: RegisterPayload) =>
    http.post<LoginResult>("/site-api/customer/registration", { body: payload, auth: false }).then((e) => e.data!),

  loginByPhone: (phone_number: string, password: string) =>
    http
      .post<LoginResult>("/site-api/customer/login", { body: { phone_number, password }, auth: false })
      .then((e) => e.data!),

  loginByEmail: (email_address: string, password: string) =>
    http
      .post<LoginResult>("/site-api/customer/email/login", { body: { email_address, password }, auth: false })
      .then((e) => e.data!),

  forgotPassword: (phone_number: string, new_password1: string, new_password2: string) =>
    http.post("/site-api/forget-password", { body: { phone_number, new_password1, new_password2 }, auth: false }),

  changePassword: (old_password: string, new_password1: string, new_password2: string) =>
    http.post("/site-api/change-password", { body: { old_password, new_password1, new_password2 } }),

  /**
   * Storefront has no dedicated refresh endpoint yet (guide §3.1) — the back-office one
   * accepts any valid refresh token. The guide's own docs disagree on the body key
   * (§3.2 table says `refresh`, §8 table says `refresh_token`) — send both.
   */
  refresh: (refresh: string) =>
    http
      .post<{ access: string; access_token?: string }>("/authentication/token/refresh", {
        body: { refresh, refresh_token: refresh },
        auth: false,
      })
      .then((e) => e.data!),
};

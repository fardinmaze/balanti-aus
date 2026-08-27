import type { Module } from "vuex";
import { authApi, type RegisterPayload } from "@/api/auth";
import { setAuthToken } from "@/api/http";
import type { BackendCustomer, LoginResult } from "@/api/types";
import type { RootState } from "../types";

const STORAGE_KEY = "balanti-auth";

export type AuthState = {
  user: BackendCustomer | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: "idle" | "loading";
  error: string | null;
};

type Persisted = Pick<AuthState, "user" | "accessToken" | "refreshToken">;

function loadInitial(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, accessToken: null, refreshToken: null };
    return JSON.parse(raw) as Persisted;
  } catch {
    return { user: null, accessToken: null, refreshToken: null };
  }
}

function initialState(): AuthState {
  const persisted = loadInitial();
  setAuthToken(persisted.accessToken);
  return { ...persisted, status: "idle", error: null };
}

export const auth: Module<AuthState, RootState> = {
  namespaced: true,
  state: initialState,
  mutations: {
    setSession(state, result: LoginResult) {
      state.user = result.user_object;
      state.accessToken = result.access_token;
      state.refreshToken = result.refresh_token;
      setAuthToken(result.access_token);
    },
    setUser(state, user: BackendCustomer) {
      state.user = user;
    },
    clearSession(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      setAuthToken(null);
    },
    setStatus(state, status: AuthState["status"]) {
      state.status = status;
    },
    setError(state, error: string | null) {
      state.error = error;
    },
  },
  actions: {
    async register({ commit }, payload: RegisterPayload) {
      commit("setStatus", "loading");
      commit("setError", null);
      try {
        const result = await authApi.register(payload);
        commit("setSession", result);
        return result;
      } catch (e) {
        commit("setError", e instanceof Error ? e.message : "Registration failed.");
        throw e;
      } finally {
        commit("setStatus", "idle");
      }
    },

    async loginByEmail({ commit }, { email_address, password }: { email_address: string; password: string }) {
      commit("setStatus", "loading");
      commit("setError", null);
      try {
        const result = await authApi.loginByEmail(email_address, password);
        commit("setSession", result);
        return result;
      } catch (e) {
        commit("setError", e instanceof Error ? e.message : "Login failed.");
        throw e;
      } finally {
        commit("setStatus", "idle");
      }
    },

    async loginByPhone({ commit }, { phone_number, password }: { phone_number: string; password: string }) {
      commit("setStatus", "loading");
      commit("setError", null);
      try {
        const result = await authApi.loginByPhone(phone_number, password);
        commit("setSession", result);
        return result;
      } catch (e) {
        commit("setError", e instanceof Error ? e.message : "Login failed.");
        throw e;
      } finally {
        commit("setStatus", "idle");
      }
    },

    logout({ commit }) {
      commit("clearSession");
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    user: (state) => state.user,
  },
};

export { STORAGE_KEY as AUTH_STORAGE_KEY };

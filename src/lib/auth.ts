import { computed } from "vue";
import type { RegisterPayload } from "@/api/auth";
import { useStore } from "@/store";
import type { BackendCustomer } from "@/api/types";

/** Thin composable over the `auth` Vuex module. */
export function useAuth() {
  const store = useStore();

  async function afterAuthChange() {
    await Promise.allSettled([store.dispatch("wishlist/fetchWishlist")]);
  }

  return {
    user: computed(() => store.state.auth.user as BackendCustomer | null),
    isAuthenticated: computed(() => store.getters["auth/isAuthenticated"] as boolean),
    status: computed(() => store.state.auth.status),
    error: computed(() => store.state.auth.error),

    async loginByEmail(email_address: string, password: string) {
      await store.dispatch("auth/loginByEmail", { email_address, password });
      await afterAuthChange();
    },
    async loginByPhone(phone_number: string, password: string) {
      await store.dispatch("auth/loginByPhone", { phone_number, password });
      await afterAuthChange();
    },
    async register(payload: RegisterPayload) {
      await store.dispatch("auth/register", payload);
      await afterAuthChange();
    },
    logout() {
      store.dispatch("auth/logout");
      store.commit("wishlist/reset");
    },
  };
}

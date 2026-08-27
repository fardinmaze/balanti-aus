import type { InjectionKey } from "vue";
import { createStore, useStore as useVuexStore, type Store } from "vuex";
import { account } from "./modules/account";
import { address } from "./modules/address";
import { auth, AUTH_STORAGE_KEY } from "./modules/auth";
import { cart, CART_STORAGE_KEY } from "./modules/cart";
import { catalogue } from "./modules/catalogue";
import { checkout } from "./modules/checkout";
import { returns } from "./modules/returns";
import { reviews } from "./modules/reviews";
import { wishlist } from "./modules/wishlist";
import type { RootState } from "./types";

export const storeKey: InjectionKey<Store<RootState>> = Symbol("store");

function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — state just won't persist across reloads */
  }
}

export const store = createStore<RootState>({
  modules: { catalogue, cart, wishlist, auth, checkout, account, address, reviews, returns },
  plugins: [
    (store) => {
      store.subscribe((mutation, state) => {
        if (mutation.type.startsWith("cart/")) persist(CART_STORAGE_KEY, state.cart.lines);
        if (mutation.type.startsWith("auth/")) {
          persist(AUTH_STORAGE_KEY, {
            user: state.auth.user,
            accessToken: state.auth.accessToken,
            refreshToken: state.auth.refreshToken,
          });
        }
      });
    },
  ],
});

export function useStore() {
  return useVuexStore(storeKey);
}

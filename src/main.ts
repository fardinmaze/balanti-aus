import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { store, storeKey } from "./store";
import "./styles/globals.css";
import { vReveal } from "./directives/reveal";

const app = createApp(App);
app.use(store, storeKey);
app.use(router);
app.directive("reveal", vReveal);
app.mount("#app");

store.dispatch("catalogue/fetchInitial");
store.dispatch("checkout/fetchFreeDelivery");
if (store.getters["auth/isAuthenticated"]) {
  store.dispatch("wishlist/fetchWishlist");
}

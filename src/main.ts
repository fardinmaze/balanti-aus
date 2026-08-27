import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { store, storeKey } from "./store";
import "./styles/globals.css";

const app = createApp(App);
app.use(store, storeKey);
app.use(router);
app.mount("#app");

store.dispatch("catalogue/fetchInitial");
if (store.getters["auth/isAuthenticated"]) {
  store.dispatch("wishlist/fetchWishlist");
}

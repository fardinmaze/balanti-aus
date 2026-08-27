import { createRouter, createWebHistory } from "vue-router";
import { store } from "@/store";

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    return { top: 0 };
  },
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/HomeView.vue"),
    },
    {
      path: "/products/:handle",
      name: "product",
      component: () => import("@/views/ProductView.vue"),
    },
    {
      path: "/about",
      name: "about",
      component: () => import("@/views/AboutView.vue"),
    },
    {
      path: "/support",
      name: "support",
      component: () => import("@/views/SupportView.vue"),
    },
    {
      path: "/cart",
      name: "cart",
      component: () => import("@/views/CartView.vue"),
    },
    {
      path: "/wishlist",
      name: "wishlist",
      component: () => import("@/views/WishlistView.vue"),
    },
    {
      path: "/catalogue",
      name: "catalogue",
      component: () => import("@/views/CatalogueView.vue"),
    },
    {
      path: "/checkout",
      name: "checkout",
      component: () => import("@/views/CheckoutView.vue"),
    },
    {
      path: "/account/login",
      name: "login",
      component: () => import("@/views/account/LoginView.vue"),
    },
    {
      path: "/account/register",
      name: "register",
      component: () => import("@/views/account/RegisterView.vue"),
    },
    {
      path: "/account",
      name: "account",
      component: () => import("@/views/account/AccountView.vue"),
      beforeEnter: (to) => {
        if (!store.getters["auth/isAuthenticated"]) {
          return { name: "login", query: { redirect: to.fullPath } };
        }
        return true;
      },
    },
    {
      path: "/checkout/confirmation",
      name: "checkout-confirmation",
      component: () => import("@/views/ConfirmationView.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundView.vue"),
    },
  ],
});

export default router;

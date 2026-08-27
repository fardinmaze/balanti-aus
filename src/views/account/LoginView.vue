<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/api/http";
import BaseButton from "@/components/ui/BaseButton.vue";

const auth = useAuth();
const router = useRouter();
const route = useRoute();

const form = reactive({ email: "", password: "" });
const error = ref("");
const submitting = ref(false);

async function submit() {
  error.value = "";
  submitting.value = true;
  try {
    await auth.loginByEmail(form.email, form.password);
    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/account";
    router.push(redirect);
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : "Couldn't sign you in.";
  } finally {
    submitting.value = false;
  }
}

const fieldClass = "min-h-[52px] w-full rounded-md border border-line bg-surface px-4 text-sm placeholder:text-muted";
</script>

<template>
  <section class="!pt-12 sm:!pt-20">
    <div class="container">
      <div class="mx-auto w-full max-w-sm rounded-lg border border-line bg-paper p-8 shadow-[var(--shadow-card)]">
        <h1 class="text-center text-2xl">Sign in</h1>

        <form class="mt-8 space-y-4" @submit.prevent="submit">
          <div>
            <label for="login-email" class="sr-only">Email</label>
            <input id="login-email" v-model="form.email" type="email" required placeholder="Email*" :class="fieldClass" />
          </div>
          <div>
            <label for="login-password" class="sr-only">Password</label>
            <input
              id="login-password"
              v-model="form.password"
              type="password"
              required
              placeholder="Password*"
              :class="fieldClass"
            />
          </div>

          <p v-if="error" class="text-sm text-sale" role="alert">{{ error }}</p>

          <BaseButton type="submit" class="w-full" :disabled="submitting">
            {{ submitting ? "Signing in…" : "Sign in" }}
          </BaseButton>
        </form>

        <p class="mt-6 text-center text-sm text-muted">
          New here? <RouterLink to="/account/register" class="underline">Create an account</RouterLink>
        </p>
      </div>
    </div>
  </section>
</template>

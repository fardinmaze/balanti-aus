<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/api/http";
import BaseButton from "@/components/ui/BaseButton.vue";

const auth = useAuth();
const router = useRouter();

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
});
const error = ref("");
const submitting = ref(false);

async function submit() {
  error.value = "";
  if (form.password !== form.confirmPassword) {
    error.value = "Passwords don't match.";
    return;
  }
  submitting.value = true;
  try {
    await auth.register({
      first_name: form.firstName,
      last_name: form.lastName,
      email_address: form.email,
      phone_number: form.phone,
      password: form.password,
      confirm_password: form.confirmPassword,
      billing_address: {},
      shipping_address: {},
    });
    router.push("/account");
  } catch (e) {
    if (e instanceof ApiError && e.fieldErrors) {
      const [, messages] = Object.entries(e.fieldErrors)[0] ?? [];
      error.value = messages?.[0] ?? e.message;
    } else {
      error.value = e instanceof ApiError ? e.message : "Couldn't create your account.";
    }
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
        <h1 class="text-center text-2xl">Create an account</h1>

        <form class="mt-8 space-y-4" @submit.prevent="submit">
          <div class="grid grid-cols-2 gap-4">
            <input v-model="form.firstName" type="text" required placeholder="First Name*" :class="fieldClass" />
            <input v-model="form.lastName" type="text" required placeholder="Last Name*" :class="fieldClass" />
          </div>
          <input v-model="form.email" type="email" required placeholder="Email*" :class="fieldClass" />
          <input v-model="form.phone" type="tel" required placeholder="Phone Number*" :class="fieldClass" />
          <input v-model="form.password" type="password" required placeholder="Password*" :class="fieldClass" />
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            placeholder="Confirm Password*"
            :class="fieldClass"
          />

          <p v-if="error" class="text-sm text-sale" role="alert">{{ error }}</p>

          <BaseButton type="submit" class="w-full" :disabled="submitting">
            {{ submitting ? "Creating account…" : "Create account" }}
          </BaseButton>
        </form>

        <p class="mt-6 text-center text-sm text-muted">
          Already have an account? <RouterLink to="/account/login" class="underline">Sign in</RouterLink>
        </p>
      </div>
    </div>
  </section>
</template>

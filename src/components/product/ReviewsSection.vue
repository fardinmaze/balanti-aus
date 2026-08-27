<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useAuth } from "@/lib/auth";
import { useReviews } from "@/lib/reviews";
import BaseButton from "@/components/ui/BaseButton.vue";

const props = defineProps<{ productSlug: string; averageRating?: number }>();

const auth = useAuth();
const reviewsStore = useReviews();
const reviews = reviewsStore.forProduct(props.productSlug);

onMounted(() => reviewsStore.fetchForProduct(props.productSlug));

const showForm = ref(false);
const submitting = ref(false);
const submitError = ref("");
const submitted = ref(false);
const form = reactive({ rating: 5, title: "", comment: "" });

async function submit() {
  if (!form.title.trim() || !form.comment.trim()) {
    submitError.value = "Add a title and a comment.";
    return;
  }
  submitting.value = true;
  submitError.value = "";
  try {
    await reviewsStore.submitReview({
      product_slug: props.productSlug,
      rating: form.rating,
      title: form.title,
      comment: form.comment,
    });
    submitted.value = true;
    showForm.value = false;
    form.title = "";
    form.comment = "";
    form.rating = 5;
  } catch (e) {
    submitError.value = e instanceof Error ? e.message : "Couldn't submit your review.";
  } finally {
    submitting.value = false;
  }
}

const fieldClass = "min-h-[52px] w-full rounded-md border border-line bg-surface px-4 text-sm placeholder:text-muted";
const ratingLabel = computed(() => (props.averageRating ? props.averageRating.toFixed(1) : null));
</script>

<template>
  <div class="border-t border-line pt-10">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="font-display text-xl font-semibold">Reviews</h2>
        <p v-if="ratingLabel" class="mt-1 text-sm text-muted">{{ ratingLabel }} average rating</p>
      </div>
      <BaseButton v-if="auth.isAuthenticated.value && !showForm" variant="ghost" @click="showForm = true">
        Write a review
      </BaseButton>
    </div>

    <p v-if="!auth.isAuthenticated.value" class="mt-4 text-sm text-muted">
      <RouterLink to="/account/login" class="underline">Sign in</RouterLink> to write a review.
    </p>

    <p v-if="submitted" class="mt-4 rounded-md border border-line bg-surface p-4 text-sm text-muted">
      Thanks — your review is in and will appear once it's been approved.
    </p>

    <form v-if="showForm" class="mt-6 max-w-md space-y-4" @submit.prevent="submit">
      <div>
        <label for="rating" class="eyebrow mb-2 block">Rating</label>
        <select id="rating" v-model.number="form.rating" :class="fieldClass">
          <option v-for="n in [5, 4, 3, 2, 1]" :key="n" :value="n">{{ n }} star{{ n === 1 ? "" : "s" }}</option>
        </select>
      </div>
      <div>
        <label for="review-title" class="sr-only">Title</label>
        <input id="review-title" v-model="form.title" type="text" placeholder="Title*" :class="fieldClass" />
      </div>
      <div>
        <label for="review-comment" class="sr-only">Comment</label>
        <textarea
          id="review-comment"
          v-model="form.comment"
          rows="4"
          placeholder="What did you think?*"
          class="w-full rounded-md border border-line bg-surface px-4 py-3 text-sm placeholder:text-muted"
        />
      </div>
      <p v-if="submitError" class="text-sm text-sale" role="alert">{{ submitError }}</p>
      <div class="flex gap-3">
        <BaseButton type="submit" :disabled="submitting">{{ submitting ? "Submitting…" : "Submit review" }}</BaseButton>
        <BaseButton type="button" variant="ghost" @click="showForm = false">Cancel</BaseButton>
      </div>
    </form>

    <p v-if="reviews.length === 0" class="mt-6 text-sm text-muted">No reviews yet — be the first.</p>

    <ul v-else class="mt-6 space-y-6">
      <li v-for="review in reviews" :key="review.id" class="border-b border-line pb-6">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold">{{ review.title }}</p>
          <span class="eyebrow">{{ review.rating }}/5</span>
        </div>
        <p class="mt-2 text-sm text-muted">{{ review.comment }}</p>
        <p class="mt-2 text-xs text-muted">
          {{ review.customer_name ?? "Verified customer" }}
          <span v-if="review.is_verified_purchase"> · Verified purchase</span>
        </p>
      </li>
    </ul>
  </div>
</template>

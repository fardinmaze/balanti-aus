<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import GenderLanding from "@/components/category/GenderLanding.vue";

const route = useRoute();
// Router constrains this route's :slug to men|women|kids (see router/index.ts).
const gender = computed(() => route.params.slug as "men" | "women" | "kids");
</script>

<template>
  <GenderLanding :gender="gender" />
</template>

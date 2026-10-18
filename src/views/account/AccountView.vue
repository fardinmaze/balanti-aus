<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "@/store";
import { useAuth } from "@/lib/auth";
import { addressLines } from "@/lib/address";
import { ApiError } from "@/api/http";
import type { OrderSummary } from "@/api/types";
import BaseButton from "@/components/ui/BaseButton.vue";
import Price from "@/components/ui/Price.vue";
import ChevronIcon from "@/components/ui/icons/ChevronIcon.vue";
import LogoutIcon from "@/components/ui/icons/LogoutIcon.vue";
import PencilIcon from "@/components/ui/icons/PencilIcon.vue";
import MailIcon from "@/components/ui/icons/MailIcon.vue";
import PhoneIcon from "@/components/ui/icons/PhoneIcon.vue";
import HeartIcon from "@/components/ui/icons/HeartIcon.vue";
import ReturnIcon from "@/components/ui/icons/ReturnIcon.vue";
import MapPinIcon from "@/components/ui/icons/MapPinIcon.vue";
import { useWishlist } from "@/lib/wishlist";
import DeliveryIcon from "@/components/ui/icons/DeliveryIcon.vue";
import OrderItems from "@/components/account/OrderItems.vue";

const store = useStore();
const auth = useAuth();
const router = useRouter();

type Tab = "orders" | "addresses" | "returns";
const tab = ref<Tab>("orders");
const TABS: { key: Tab; label: string }[] = [
  { key: "orders", label: "Order history" },
  { key: "addresses", label: "Addresses" },
  { key: "returns", label: "Returns" },
];

const wishlist = useWishlist();
const tabsEl = ref<HTMLElement | null>(null);

/** Stat tiles in the profile card double as shortcuts into the tabs below. */
const profileStats = computed(() => [
  { key: "orders", label: "Orders", value: orders.value.length, icon: DeliveryIcon },
  { key: "returns", label: "Returns", value: returnRequests.value.length, icon: ReturnIcon },
  { key: "addresses", label: "Addresses", value: visibleAddresses.value.length, icon: MapPinIcon },
  { key: "wishlist", label: "Wishlist", value: wishlist.count.value, icon: HeartIcon },
] as const);

function openStat(key: Tab | "wishlist") {
  if (key === "wishlist") {
    router.push("/wishlist");
    return;
  }
  tab.value = key;
  tabsEl.value?.scrollIntoView({ behavior: "smooth", block: "start" });
}

onMounted(() => {
  store.dispatch("account/fetchOrders");
  store.dispatch("address/fetchAddresses");
  store.dispatch("returns/fetchMyRequests");
});

const orders = computed(() => store.state.account.orders);
const ordersLoading = computed(() => store.state.account.loading);
const addresses = computed(() => store.state.address.addresses);
const returnRequests = computed(() => store.state.returns.requests);

const fieldFocus = "!outline-none transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] focus:border-ink";
const fieldClass = `min-h-[52px] w-full rounded-md border border-line bg-surface px-4 text-sm placeholder:text-muted ${fieldFocus}`;
const btnSm = "!px-4 text-sm";
const fieldSm = `min-h-[var(--tap-min)] w-full rounded-md border border-line bg-surface px-3 text-sm ${fieldFocus}`;

// Profile
const fullName = computed(() => {
  const u = auth.user.value;
  return [u?.first_name, u?.last_name].filter(Boolean).join(" ") || "Your account";
});
const initials = computed(() => {
  const u = auth.user.value;
  const letters = `${u?.first_name?.[0] ?? ""}${u?.last_name?.[0] ?? ""}`;
  return (letters || u?.email_address?.[0] || "?").toUpperCase();
});

function profileFromUser() {
  return {
    first_name: auth.user.value?.first_name ?? "",
    last_name: auth.user.value?.last_name ?? "",
    email_address: auth.user.value?.email_address ?? "",
    phone_number: auth.user.value?.phone_number ?? "",
  };
}
const profileForm = reactive(profileFromUser());
const editingProfile = ref(false);
const profileSaving = ref(false);
const profileMessage = ref("");
const profileError = ref("");

function openProfileForm() {
  Object.assign(profileForm, profileFromUser());
  profileError.value = "";
  profileMessage.value = "";
  editingProfile.value = true;
}

async function saveProfile() {
  profileSaving.value = true;
  profileError.value = "";
  profileMessage.value = "";
  try {
    await store.dispatch("account/editProfile", profileForm);
    profileMessage.value = "Profile updated successfully.";
    editingProfile.value = false;
  } catch (e) {
    profileError.value = e instanceof ApiError ? e.message : "Couldn't update your profile.";
  } finally {
    profileSaving.value = false;
  }
}

// Orders
const ORDER_PREVIEW_COUNT = 2;
const showAllOrders = ref(false);
const visibleOrders = computed(() =>
  showAllOrders.value ? orders.value : orders.value.slice(0, ORDER_PREVIEW_COUNT)
);

function formatOrderDate(raw?: string | null, short = false) {
  if (!raw) return "";
  const d = new Date(raw);
  return Number.isNaN(d.getTime())
    ? raw
    : d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: short ? undefined : "numeric" });
}

function isCancelled(order: OrderSummary) {
  return /cancel|fail|refund|reject/i.test(order.status ?? "");
}

// Stripe-era statuses get friendly labels; anything else keeps the raw (lower-cased, capitalized) status.
const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  CONFIRMED: "Paid / Confirmed",
  CANCELLED: "Cancelled",
};

function statusLabel(order: OrderSummary) {
  return STATUS_LABELS[order.status ?? ""] ?? (order.status ?? "").toLowerCase();
}

function isAwaitingPayment(order: OrderSummary) {
  return order.status === "PENDING_PAYMENT";
}

function statusClass(order: OrderSummary) {
  if (isCancelled(order)) return "bg-sale/10 text-sale";
  if (order.received || /deliver|complete/i.test(order.status ?? "")) return "bg-success/10 text-success";
  return "bg-accent/10 text-ink";
}

// Addresses
const showAddressForm = ref(false);
function emptyAddressForm() {
  return {
    full_name: "",
    line1: "",
    line2: "",
    suburb: "",
    state: "",
    postcode: "",
    country: "Australia",
    phone: "",
  };
}
const addressForm = reactive(emptyAddressForm());
const addressSaving = ref(false);
const addressError = ref("");
const editingAddressId = ref<number | null>(null);

const visibleAddresses = computed(() => addresses.value.filter((a) => addressLines(a.address).length > 0));

const defaultSavingId = ref<number | null>(null);
const defaultError = ref("");
async function setDefaultAddress(addressId: number) {
  defaultSavingId.value = addressId;
  defaultError.value = "";
  try {
    await store.dispatch("address/setDefaultAddress", addressId);
  } catch (e) {
    defaultError.value = e instanceof ApiError ? e.message : "Couldn't set that address as default.";
  } finally {
    defaultSavingId.value = null;
  }
}

function openAddForm() {
  editingAddressId.value = null;
  Object.assign(addressForm, emptyAddressForm());
  showAddressForm.value = true;
}

function openEditForm(addr: { id: number; address: Record<string, unknown> }) {
  editingAddressId.value = addr.id;
  const a = addr.address ?? {};
  Object.assign(addressForm, {
    full_name: a.full_name ?? "",
    line1: a.line1 ?? "",
    line2: a.line2 ?? "",
    suburb: a.suburb ?? "",
    state: a.state ?? "",
    postcode: a.postcode ?? "",
    country: a.country ?? "Australia",
    phone: a.phone ?? "",
  });
  showAddressForm.value = true;
}

function closeAddressForm() {
  showAddressForm.value = false;
  editingAddressId.value = null;
}

async function saveAddress() {
  addressSaving.value = true;
  addressError.value = "";
  try {
    if (editingAddressId.value !== null) {
      await store.dispatch("address/updateAddress", { addressId: editingAddressId.value, payload: addressForm });
    } else {
      await store.dispatch("address/addAddress", addressForm);
    }
    Object.assign(addressForm, emptyAddressForm());
    showAddressForm.value = false;
    editingAddressId.value = null;
  } catch (e) {
    addressError.value = e instanceof ApiError ? e.message : "Couldn't save that address.";
  } finally {
    addressSaving.value = false;
  }
}

// Returns
const RETURN_REASONS = ["Wrong size", "Damaged or faulty", "Not as described", "Changed my mind", "Other"];

// The API wants the order *line* id (ordered_items[].id), not the SO number,
// so customers pick an order + item and we submit the line id for them.
const returnForm = reactive({ so_id: "", so_product_id: "", reason: "", details: "" });
const returnSaving = ref(false);
const returnError = ref("");
const returnSuccess = ref("");
const showReturnForm = ref(false);
// No requests yet → the form is the whole point of the tab, so show it up front.
const returnFormVisible = computed(() => showReturnForm.value || returnRequests.value.length === 0);

function openReturnForm() {
  returnError.value = "";
  returnSuccess.value = "";
  showReturnForm.value = true;
}

function closeReturnForm() {
  Object.assign(returnForm, { so_id: "", so_product_id: "", reason: "", details: "" });
  returnError.value = "";
  showReturnForm.value = false;
}

/** Order lines that already have a return request (open or resolved). */
const returnedLineIds = computed(() => new Set(returnRequests.value.map((r) => r.so_product)));

const returnableOrders = computed(() =>
  orders.value.filter(
    (o) => !isCancelled(o) && (o.ordered_items ?? []).some((item) => !returnedLineIds.value.has(item.id))
  )
);
const returnOrderItems = computed(
  () => returnableOrders.value.find((o) => (o.so_id ?? o.order_id) === returnForm.so_id)?.ordered_items ?? []
);


function onReturnOrderChange() {
  // Auto-pick the item when the order only has one returnable line.
  const items = returnOrderItems.value.filter((i) => !returnedLineIds.value.has(i.id));
  returnForm.so_product_id = items.length === 1 ? String(items[0].id) : "";
}

function returnStatusClass(status: string) {
  if (status === "REJECTED") return "bg-sale/10 text-sale";
  if (status === "APPROVED" || status === "REFUNDED") return "bg-success/10 text-success";
  return "bg-accent/10 text-ink";
}

async function requestReturn() {
  const id = Number(returnForm.so_product_id);
  if (!id || !returnForm.reason) {
    returnError.value = "Choose an order, the item to return and a reason.";
    return;
  }
  if (returnForm.reason === "Other" && !returnForm.details.trim()) {
    returnError.value = "Tell us a little about why you're returning it.";
    return;
  }
  const reason = returnForm.details.trim() ? `${returnForm.reason}: ${returnForm.details.trim()}` : returnForm.reason;
  returnSaving.value = true;
  returnError.value = "";
  returnSuccess.value = "";
  try {
    await store.dispatch("returns/requestReturn", { so_product_id: id, reason });
    closeReturnForm();
    returnSuccess.value = "Return requested. We'll email you once it's reviewed.";
  } catch (e) {
    returnError.value = e instanceof ApiError ? e.message : "Couldn't submit that return.";
  } finally {
    returnSaving.value = false;
  }
}

function logout() {
  auth.logout();
  router.push("/");
}
</script>

<template>
  <section class="!pt-8 sm:!pt-12">
    <div class="container max-w-3xl space-y-8">
      <!-- Profile header -->
      <div class="overflow-hidden rounded-lg border border-line bg-surface">
        <!-- Phone: identity on its own full-width row, actions as a two-up bar beneath it -->
        <div class="flex flex-col gap-4 bg-paper/60 p-4 sm:flex-row sm:items-center sm:p-6">
          <div class="flex min-w-0 flex-1 items-center gap-4">
            <div
              class="flex size-14 shrink-0 items-center justify-center rounded-pill bg-accent font-display text-lg font-semibold text-accent-contrast ring-4 ring-surface shadow-[var(--shadow-card)] sm:size-16 sm:text-xl"
              aria-hidden="true"
            >
              {{ initials }}
            </div>

            <div class="min-w-0 flex-1">
              <p class="eyebrow text-muted">Welcome back</p>
              <h1 class="mt-0.5 break-words !text-[length:var(--fs-h3)] sm:truncate">{{ fullName }}</h1>
              <ul class="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                <li v-if="auth.user.value?.email_address" class="flex min-w-0 items-center gap-1.5">
                  <MailIcon class="size-3.5 shrink-0" />
                  <span class="break-all sm:truncate">{{ auth.user.value.email_address }}</span>
                </li>
                <li v-if="auth.user.value?.phone_number" class="flex items-center gap-1.5">
                  <PhoneIcon class="size-3.5 shrink-0" />
                  <span>{{ auth.user.value.phone_number }}</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="grid shrink-0 grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-1">
            <button
              type="button"
              class="inline-flex min-h-[var(--tap-min)] items-center justify-center gap-1.5 rounded-md border border-line px-3 text-sm font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-ink/5 disabled:opacity-50 sm:rounded-pill sm:border-transparent"
              :disabled="editingProfile"
              @click="openProfileForm"
            >
              <PencilIcon class="size-4" />
              Edit profile
            </button>
            <button
              type="button"
              class="inline-flex min-h-[var(--tap-min)] items-center justify-center gap-1.5 rounded-md border border-line px-3 text-sm font-medium text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-sale/10 hover:text-sale sm:rounded-pill sm:border-transparent"
              @click="logout"
            >
              <LogoutIcon class="size-4" />
              Sign out
            </button>
          </div>
        </div>

        <!-- Stats: live counts that jump to the matching tab -->
        <div class="grid grid-cols-2 border-t border-line sm:grid-cols-4">
          <button
            v-for="(stat, i) in profileStats"
            :key="stat.key"
            type="button"
            class="group flex items-center gap-3 px-4 py-3 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-paper sm:px-6 sm:py-4"
            :class="[
              i % 2 === 1 ? 'border-l border-line' : '',
              i >= 2 ? 'border-t border-line sm:border-t-0' : '',
              i === 2 ? 'sm:border-l' : '',
            ]"
            :aria-label="`${stat.value} ${stat.label}`"
            @click="openStat(stat.key)"
          >
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-pill bg-paper text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:text-ink"
            >
              <component :is="stat.icon" class="size-4" />
            </span>
            <span class="min-w-0" aria-hidden="true">
              <span class="block font-display text-lg font-semibold leading-none">{{ stat.value }}</span>
              <span class="mt-1 block text-xs text-muted">{{ stat.label }}</span>
            </span>
          </button>
        </div>

        <p
          v-if="profileMessage && !editingProfile"
          class="border-t border-line bg-success/5 px-4 py-2 text-sm text-success sm:px-5"
          role="status"
        >
          {{ profileMessage }}
        </p>

        <!-- Edit profile form -->
        <Transition name="panel-fade">
        <form
          v-if="editingProfile"
          class="border-t border-line bg-paper p-4 sm:p-5"
          @submit.prevent="saveProfile"
        >
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="space-y-1.5 text-sm">
              <span class="font-medium">First name</span>
              <input v-model="profileForm.first_name" type="text" autocomplete="given-name" :class="fieldClass" />
            </label>
            <label class="space-y-1.5 text-sm">
              <span class="font-medium">Last name</span>
              <input v-model="profileForm.last_name" type="text" autocomplete="family-name" :class="fieldClass" />
            </label>
            <label class="space-y-1.5 text-sm">
              <span class="font-medium">Email</span>
              <input v-model="profileForm.email_address" type="email" autocomplete="email" :class="fieldClass" />
            </label>
            <label class="space-y-1.5 text-sm">
              <span class="font-medium">Phone number</span>
              <input v-model="profileForm.phone_number" type="tel" autocomplete="tel" :class="fieldClass" />
            </label>
          </div>
          <p v-if="profileError" class="mt-3 text-sm text-sale" role="alert">{{ profileError }}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <BaseButton :class="btnSm" type="submit" :disabled="profileSaving">
              {{ profileSaving ? "Saving…" : "Save changes" }}
            </BaseButton>
            <BaseButton :class="btnSm" variant="ghost" :disabled="profileSaving" @click="editingProfile = false">Cancel</BaseButton>
          </div>
        </form>
        </Transition>
      </div>

      <div>
      <div ref="tabsEl" class="flex scroll-mt-24 gap-6 border-b border-line" role="tablist">
        <button
          v-for="t in TABS"
          :key="t.key"
          type="button"
          role="tab"
          :aria-selected="tab === t.key"
          class="min-h-[var(--tap-min)] border-b-2 text-sm font-semibold"
          :class="tab === t.key ? 'border-ink text-ink' : 'border-transparent text-muted'"
          @click="tab = t.key"
        >
          {{ t.label }}
        </button>
      </div>

      <Transition name="panel-fade" mode="out-in">
      <!-- Orders -->
      <div v-if="tab === 'orders'" class="mt-6">
        <p v-if="ordersLoading" class="text-sm text-muted">Loading orders…</p>
        <div
          v-else-if="orders.length === 0"
          class="rounded-md border border-dashed border-line px-4 py-6 text-center"
        >
          <p class="text-sm text-muted">You haven't placed any orders yet.</p>
          <BaseButton to="/catalogue" :class="`mt-3 ${btnSm}`">Start shopping</BaseButton>
        </div>
        <div v-else class="overflow-hidden rounded-md border border-line bg-surface">
          <!-- Phone: stacked rows, so nothing is cut off or needs sideways scrolling -->
          <ul class="divide-y divide-line sm:hidden">
            <li v-for="order in visibleOrders" :key="String(order.so_id ?? order.order_id)" class="space-y-2 p-4 text-sm">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate font-mono font-semibold">{{ order.so_id ?? order.order_id }}</p>
                  <p class="text-xs text-muted">{{ formatOrderDate(order.so_date) }}</p>
                </div>
                <Price
                  v-if="order.total_amount != null"
                  :amount="Number(order.total_amount)"
                  class="shrink-0 font-semibold"
                />
              </div>

              <OrderItems :items="order.ordered_items ?? []" />

              <div class="flex flex-wrap items-center justify-between gap-2">
                <span
                  v-if="order.status"
                  class="inline-block rounded-pill px-2 py-0.5 text-xs font-semibold"
                  :class="[statusClass(order), { capitalize: !STATUS_LABELS[order.status] }]"
                >
                  {{ statusLabel(order) }}
                </span>
                <span
                  v-if="!order.received && !isCancelled(order) && !isAwaitingPayment(order) && order.expected_delivery"
                  class="flex items-center gap-1 text-xs text-muted"
                >
                  <DeliveryIcon class="size-3.5" />
                  Arriving {{ formatOrderDate(order.expected_delivery, true) }}
                </span>
              </div>
            </li>
          </ul>

          <table class="hidden w-full text-left text-sm sm:table">
            <thead class="border-b border-line bg-paper text-xs text-muted">
              <tr>
                <th scope="col" class="px-4 py-2.5 font-medium">Order</th>
                <th scope="col" class="hidden px-4 py-2.5 font-medium sm:table-cell">Date</th>
                <th scope="col" class="hidden px-4 py-2.5 font-medium md:table-cell">Items</th>
                <th scope="col" class="px-4 py-2.5 font-medium">Status</th>
                <th scope="col" class="px-4 py-2.5 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              <tr
                v-for="order in visibleOrders"
                :key="String(order.so_id ?? order.order_id)"
                class="transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-paper"
              >
                <td class="px-4 py-3 align-top">
                  <span class="font-mono font-semibold">{{ order.so_id ?? order.order_id }}</span>
                  <OrderItems :items="order.ordered_items ?? []" class="mt-1.5 md:hidden" />
                </td>
                <td class="hidden whitespace-nowrap px-4 py-3 align-top text-muted sm:table-cell">
                  {{ formatOrderDate(order.so_date) }}
                </td>
                <td class="hidden max-w-56 px-4 py-3 align-top md:table-cell">
                  <OrderItems :items="order.ordered_items ?? []" />
                </td>
                <td class="px-4 py-3 align-top">
                  <span
                    v-if="order.status"
                    class="inline-block rounded-pill px-2 py-0.5 text-xs font-semibold"
                    :class="[statusClass(order), { capitalize: !STATUS_LABELS[order.status] }]"
                  >
                    {{ statusLabel(order) }}
                  </span>
                  <span
                    v-if="!order.received && !isCancelled(order) && !isAwaitingPayment(order) && order.expected_delivery"
                    class="mt-1 flex items-center gap-1 whitespace-nowrap text-xs text-muted"
                  >
                    <DeliveryIcon class="size-3.5" />
                    {{ formatOrderDate(order.expected_delivery, true) }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-right align-top">
                  <Price
                    v-if="order.total_amount != null"
                    :amount="Number(order.total_amount)"
                    class="font-semibold"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div
            v-if="orders.length > ORDER_PREVIEW_COUNT"
            class="flex items-center justify-between gap-4 border-t border-line bg-paper px-4 text-xs text-muted"
          >
            <span>Showing {{ visibleOrders.length }} of {{ orders.length }} orders</span>
            <button
              type="button"
              class="inline-flex min-h-[var(--tap-min)] items-center gap-1 font-semibold text-ink hover:underline"
              :aria-expanded="showAllOrders"
              @click="showAllOrders = !showAllOrders"
            >
              {{ showAllOrders ? "Show less" : "View all" }}
              <ChevronIcon
                class="size-3.5 transition-transform duration-[var(--dur-fast)] ease-[var(--ease)]"
                :class="showAllOrders ? '-rotate-90' : 'rotate-90'"
              />
            </button>
          </div>
        </div>
      </div>


      <!-- Addresses -->
      <div v-else-if="tab === 'addresses'" class="mt-6">
        <ul v-if="visibleAddresses.length" class="space-y-3">
          <li v-for="addr in visibleAddresses" :key="addr.id" class="rounded-md border border-line p-4 text-sm">
            <form v-if="editingAddressId === addr.id" class="space-y-3" @submit.prevent="saveAddress">
              <input v-model="addressForm.full_name" type="text" required placeholder="Full Name*" :class="fieldClass" />
              <input v-model="addressForm.line1" type="text" required placeholder="Street Address*" :class="fieldClass" />
              <input v-model="addressForm.line2" type="text" placeholder="Apt / Suite" :class="fieldClass" />
              <div class="grid grid-cols-3 gap-3">
                <input v-model="addressForm.suburb" type="text" required placeholder="Suburb*" :class="fieldClass" />
                <input v-model="addressForm.state" type="text" required placeholder="State*" :class="fieldClass" />
                <input v-model="addressForm.postcode" type="text" required placeholder="Postcode*" :class="fieldClass" />
              </div>
              <input v-model="addressForm.phone" type="tel" required placeholder="Phone*" :class="fieldClass" />
              <p v-if="addressError" class="text-sm text-sale" role="alert">{{ addressError }}</p>
              <div class="flex gap-3">
                <BaseButton :class="btnSm" type="submit" :disabled="addressSaving">{{ addressSaving ? "Saving…" : "Update address" }}</BaseButton>
                <BaseButton :class="btnSm" type="button" variant="ghost" @click="closeAddressForm">Cancel</BaseButton>
              </div>
            </form>

            <div v-else class="flex items-start justify-between gap-4">
              <div>
                <p class="flex items-center gap-2 font-semibold">
                  <span>{{ addressLines(addr.address)[0] }}</span>
                  <span
                    v-if="addr.is_default"
                    class="rounded-full bg-ink px-2 py-0.5 text-xs font-medium text-white"
                  >
                    Default
                  </span>
                </p>
                <p
                  v-for="(line, i) in addressLines(addr.address).slice(1)"
                  :key="i"
                  class="text-muted"
                >
                  {{ line }}
                </p>
              </div>
              <div class="flex shrink-0 flex-col items-end gap-2">
                <button type="button" class="text-sm font-medium underline" @click="openEditForm(addr)">
                  Edit
                </button>
                <button
                  v-if="!addr.is_default"
                  type="button"
                  class="text-sm font-medium underline disabled:opacity-50"
                  :disabled="defaultSavingId === addr.id"
                  @click="setDefaultAddress(addr.id)"
                >
                  {{ defaultSavingId === addr.id ? "Setting…" : "Set as default" }}
                </button>
              </div>
            </div>
          </li>
        </ul>
        <p v-if="defaultError" class="mt-3 text-sm text-sale" role="alert">{{ defaultError }}</p>
        <p v-if="!visibleAddresses.length" class="text-sm text-muted">No saved addresses yet.</p>

        <button
          v-if="!(showAddressForm && editingAddressId === null)"
          type="button"
          class="mt-4 text-sm font-semibold underline"
          @click="openAddForm"
        >
          Add an address
        </button>

        <form v-else class="mt-4 max-w-sm space-y-3" @submit.prevent="saveAddress">
          <input v-model="addressForm.full_name" type="text" required placeholder="Full Name*" :class="fieldClass" />
          <input v-model="addressForm.line1" type="text" required placeholder="Street Address*" :class="fieldClass" />
          <input v-model="addressForm.line2" type="text" placeholder="Apt / Suite" :class="fieldClass" />
          <div class="grid grid-cols-3 gap-3">
            <input v-model="addressForm.suburb" type="text" required placeholder="Suburb*" :class="fieldClass" />
            <input v-model="addressForm.state" type="text" required placeholder="State*" :class="fieldClass" />
            <input v-model="addressForm.postcode" type="text" required placeholder="Postcode*" :class="fieldClass" />
          </div>
          <input v-model="addressForm.phone" type="tel" required placeholder="Phone*" :class="fieldClass" />
          <p v-if="addressError" class="text-sm text-sale" role="alert">{{ addressError }}</p>
          <div class="flex gap-3">
            <BaseButton :class="btnSm" type="submit" :disabled="addressSaving">{{ addressSaving ? "Saving…" : "Save address" }}</BaseButton>
            <BaseButton :class="btnSm" type="button" variant="ghost" @click="closeAddressForm">Cancel</BaseButton>
          </div>
        </form>
      </div>

      <!-- Returns -->
      <div v-else-if="tab === 'returns'" class="mt-6 space-y-4">
        <div v-if="!returnFormVisible" class="flex items-center justify-between gap-4">
          <p class="text-sm text-muted">
            {{ returnRequests.length }} return {{ returnRequests.length === 1 ? "request" : "requests" }}
          </p>
          <BaseButton
            :class="btnSm"
            :disabled="!returnableOrders.length"
            @click="openReturnForm"
          >
            Request a return
          </BaseButton>
        </div>

        <p v-if="returnSuccess && !returnFormVisible" class="rounded-md bg-success/5 px-4 py-2.5 text-sm text-success" role="status">
          {{ returnSuccess }}
        </p>

        <!-- Submitted requests -->
        <div v-if="!returnFormVisible" class="overflow-hidden rounded-md border border-line bg-surface">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-line bg-paper text-xs text-muted">
              <tr>
                <th scope="col" class="px-4 py-2.5 font-medium">Item</th>
                <th scope="col" class="hidden px-4 py-2.5 font-medium sm:table-cell">Requested</th>
                <th scope="col" class="hidden px-4 py-2.5 font-medium md:table-cell">Reason</th>
                <th scope="col" class="px-4 py-2.5 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              <tr
                v-for="req in returnRequests"
                :key="req.id"
                class="transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-paper"
              >
                <td class="px-4 py-3 align-top">
                  <p class="font-medium">{{ req.product_name }}</p>
                  <p class="font-mono text-xs text-muted">{{ req.so_id }}</p>
                  <p class="mt-0.5 text-xs text-muted sm:hidden">{{ formatOrderDate(req.requested_at) }}</p>
                  <p class="mt-0.5 text-xs text-muted md:hidden">{{ req.reason }}</p>
                </td>
                <td class="hidden whitespace-nowrap px-4 py-3 align-top text-muted sm:table-cell">
                  {{ formatOrderDate(req.requested_at) }}
                </td>
                <td class="hidden max-w-56 px-4 py-3 align-top text-muted md:table-cell">
                  <p class="line-clamp-2">{{ req.reason }}</p>
                </td>
                <td class="px-4 py-3 text-right align-top">
                  <span
                    class="inline-block rounded-pill px-2 py-0.5 text-xs font-semibold capitalize"
                    :class="returnStatusClass(req.status)"
                  >
                    {{ req.status.toLowerCase() }}
                  </span>
                  <p v-if="req.resolved_at" class="mt-1 whitespace-nowrap text-xs text-muted">
                    {{ formatOrderDate(req.resolved_at, true) }}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- New request: shown by default when there are no requests yet, otherwise on demand -->
        <div v-if="returnFormVisible" class="overflow-hidden rounded-md border border-line bg-surface">
          <div class="flex items-start justify-between gap-4 border-b border-line bg-paper px-4 py-3">
            <div>
              <h2 class="!text-[length:var(--fs-h3)]">Request a return</h2>
              <p class="text-xs text-muted">Choose the order and the item you'd like to send back.</p>
            </div>
            <button
              v-if="returnRequests.length"
              type="button"
              class="-mr-2 inline-flex size-[var(--tap-min)] shrink-0 items-center justify-center rounded-pill text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-ink/5 hover:text-ink"
              aria-label="Close return form"
              @click="closeReturnForm"
            >
              <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div v-if="!returnableOrders.length" class="px-4 py-6 text-center text-sm text-muted">
            You don't have any orders that can be returned yet.
          </div>

          <form v-else class="space-y-4 p-4" @submit.prevent="requestReturn">
            <p class="rounded-md bg-paper px-3 py-2.5 text-xs leading-relaxed text-muted">
              <span class="font-semibold text-ink">How it works:</span>
              select your order number (e.g. <span class="font-mono text-ink">SO-009025</span>, shown in
              Order history and your confirmation email), then the item. You don't need to type any IDs —
              we match it to the right order line for you.
            </p>

            <div class="grid gap-3 sm:grid-cols-2">
              <label class="space-y-1.5 text-sm">
                <span class="font-medium">Order number</span>
                <select v-model="returnForm.so_id" required :class="fieldSm" @change="onReturnOrderChange">
                  <option value="" disabled>Select an order</option>
                  <option
                    v-for="o in returnableOrders"
                    :key="String(o.so_id ?? o.order_id)"
                    :value="o.so_id ?? o.order_id"
                  >
                    {{ o.so_id ?? o.order_id }} · {{ formatOrderDate(o.so_date) }}
                  </option>
                </select>
              </label>
              <label class="space-y-1.5 text-sm">
                <span class="font-medium">Item</span>
                <select
                  v-model="returnForm.so_product_id"
                  required
                  :disabled="!returnForm.so_id"
                  :class="[fieldSm, 'disabled:opacity-50']"
                >
                  <option value="" disabled>{{ returnForm.so_id ? "Select an item" : "Choose an order first" }}</option>
                  <option
                    v-for="item in returnOrderItems"
                    :key="item.id"
                    :value="String(item.id)"
                    :disabled="returnedLineIds.has(item.id)"
                  >
                    {{ item.item_name }} ×{{ Number(item.quantity) }}{{ returnedLineIds.has(item.id) ? " — return requested" : "" }}
                  </option>
                </select>
              </label>
            </div>

            <fieldset class="space-y-1.5 text-sm">
              <legend class="mb-1.5 font-medium">Reason</legend>
              <div class="flex flex-wrap gap-2">
                <label
                  v-for="r in RETURN_REASONS"
                  :key="r"
                  class="cursor-pointer rounded-pill border border-line px-3 py-1.5 text-xs font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:border-ink/40 has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:border-ink"
                >
                  <input v-model="returnForm.reason" type="radio" name="return-reason" :value="r" class="sr-only" />
                  {{ r }}
                </label>
              </div>
            </fieldset>

            <label class="block space-y-1.5 text-sm">
              <span class="font-medium">
                Details
                <span class="font-normal text-muted">{{ returnForm.reason === "Other" ? "(required)" : "(optional)" }}</span>
              </span>
              <textarea
                v-model="returnForm.details"
                rows="3"
                placeholder="Anything that helps us sort it out faster"
                :class="`w-full rounded-md border border-line bg-surface px-3 py-2 text-sm placeholder:text-muted ${fieldFocus}`"
              />
            </label>

            <p v-if="returnError" class="text-sm text-sale" role="alert">{{ returnError }}</p>
            <p v-if="returnSuccess" class="text-sm text-success" role="status">{{ returnSuccess }}</p>

            <div class="flex justify-end gap-2 border-t border-line pt-4">
              <BaseButton
                v-if="returnRequests.length"
                :class="btnSm"
                variant="ghost"
                :disabled="returnSaving"
                @click="closeReturnForm"
              >
                Cancel
              </BaseButton>
              <BaseButton :class="btnSm" type="submit" :disabled="returnSaving">
                {{ returnSaving ? "Submitting…" : "Submit request" }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
      </Transition>
      </div>
    </div>
  </section>
</template>

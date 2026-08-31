<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "@/store";
import { useAuth } from "@/lib/auth";
import { addressLines } from "@/lib/address";
import { ApiError } from "@/api/http";
import BaseButton from "@/components/ui/BaseButton.vue";

const store = useStore();
const auth = useAuth();
const router = useRouter();

type Tab = "profile" | "orders" | "addresses" | "returns";
const tab = ref<Tab>("profile");
const TABS: { key: Tab; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "orders", label: "Orders" },
  { key: "addresses", label: "Addresses" },
  { key: "returns", label: "Returns" },
];

onMounted(() => {
  store.dispatch("account/fetchOrders");
  store.dispatch("address/fetchAddresses");
  store.dispatch("returns/fetchMyRequests");
});

const orders = computed(() => store.state.account.orders);
const ordersLoading = computed(() => store.state.account.loading);
const addresses = computed(() => store.state.address.addresses);
const returnRequests = computed(() => store.state.returns.requests);

const fieldClass = "min-h-[52px] w-full rounded-md border border-line bg-surface px-4 text-sm placeholder:text-muted";

// Profile
const profileForm = reactive({
  first_name: auth.user.value?.first_name ?? "",
  last_name: auth.user.value?.last_name ?? "",
  email_address: auth.user.value?.email_address ?? "",
  phone_number: auth.user.value?.phone_number ?? "",
});
const profileSaving = ref(false);
const profileMessage = ref("");
async function saveProfile() {
  profileSaving.value = true;
  profileMessage.value = "";
  try {
    await store.dispatch("account/editProfile", profileForm);
    profileMessage.value = "Profile updated successfully.";
  } catch (e) {
    profileMessage.value = e instanceof ApiError ? e.message : "Couldn't update your profile.";
  } finally {
    profileSaving.value = false;
  }
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
const returnForm = reactive({ so_product_id: "", reason: "" });
const returnSaving = ref(false);
const returnError = ref("");
async function requestReturn() {
  const id = Number(returnForm.so_product_id);
  if (!id || !returnForm.reason.trim()) {
    returnError.value = "Enter the order line id and a reason.";
    return;
  }
  returnSaving.value = true;
  returnError.value = "";
  try {
    await store.dispatch("returns/requestReturn", { so_product_id: id, reason: returnForm.reason });
    returnForm.so_product_id = "";
    returnForm.reason = "";
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
    <div class="container max-w-3xl">
      <div class="flex items-center justify-between">
        <h1>My Account</h1>
        <button type="button" class="text-sm font-medium underline" @click="logout">Sign out</button>
      </div>

      <div class="mt-6 flex gap-6 border-b border-line" role="tablist">
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

      <!-- Profile -->
      <div v-if="tab === 'profile'" class="mt-8 max-w-sm space-y-4">
        <input v-model="profileForm.first_name" type="text" placeholder="First Name" :class="fieldClass" />
        <input v-model="profileForm.last_name" type="text" placeholder="Last Name" :class="fieldClass" />
        <input v-model="profileForm.email_address" type="email" placeholder="Email" :class="fieldClass" />
        <input v-model="profileForm.phone_number" type="tel" placeholder="Phone Number" :class="fieldClass" />
        <p v-if="profileMessage" class="text-sm text-muted">{{ profileMessage }}</p>
        <BaseButton :disabled="profileSaving" @click="saveProfile">
          {{ profileSaving ? "Updating…" : "Update Profile" }}
        </BaseButton>
      </div>

      <!-- Orders -->
      <div v-else-if="tab === 'orders'" class="mt-8">
        <p v-if="ordersLoading" class="text-sm text-muted">Loading orders…</p>
        <p v-else-if="orders.length === 0" class="text-sm text-muted">
          No orders yet. <RouterLink to="/" class="underline">Start shopping</RouterLink>
        </p>
        <ul v-else class="divide-y divide-line border-y border-line">
          <li v-for="order in orders" :key="String(order.so_id ?? order.order_id)" class="flex justify-between py-4 text-sm">
            <div>
              <p class="font-semibold">{{ order.so_id ?? order.order_id }}</p>
              <p class="text-muted">{{ order.so_date }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold">{{ order.status }}</p>
              <p v-if="order.total" class="text-muted">${{ order.total }}</p>
            </div>
          </li>
        </ul>
      </div>

      <!-- Addresses -->
      <div v-else-if="tab === 'addresses'" class="mt-8">
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
                <BaseButton type="submit" :disabled="addressSaving">{{ addressSaving ? "Saving…" : "Update address" }}</BaseButton>
                <BaseButton type="button" variant="ghost" @click="closeAddressForm">Cancel</BaseButton>
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
            <BaseButton type="submit" :disabled="addressSaving">{{ addressSaving ? "Saving…" : "Save address" }}</BaseButton>
            <BaseButton type="button" variant="ghost" @click="closeAddressForm">Cancel</BaseButton>
          </div>
        </form>
      </div>

      <!-- Returns -->
      <div v-else-if="tab === 'returns'" class="mt-8">
        <ul v-if="returnRequests.length" class="divide-y divide-line border-y border-line">
          <li v-for="req in returnRequests" :key="req.id" class="flex justify-between py-4 text-sm">
            <span>{{ req.reason }}</span>
            <span class="font-semibold">{{ req.status }}</span>
          </li>
        </ul>
        <!-- <p v-else class="text-sm text-muted">No return requests yet.</p> -->

        <form class="mt-6 max-w-sm space-y-3" @submit.prevent="requestReturn">
          <p class="eyebrow">Request a return</p>
          <input
            v-model="returnForm.so_product_id"
            type="text"
            inputmode="numeric"
            required
            placeholder="Order Id*"
            :class="fieldClass"
          />
          <textarea
            v-model="returnForm.reason"
            class="py-2"
            required
            placeholder="Reason*"
            rows="3"
            :class="fieldClass"
          />
          <p v-if="returnError" class="text-sm text-sale" role="alert">{{ returnError }}</p>
          <BaseButton type="submit" :disabled="returnSaving">{{ returnSaving ? "Submitting…" : "Submit" }}</BaseButton>
        </form>
      </div>
    </div>
  </section>
</template>

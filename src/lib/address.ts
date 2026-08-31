import { computed } from "vue";
import { useStore } from "@/store";
import type { AddressShape } from "@/api/address";
import type { CustomerAddress } from "@/api/types";

/** Renders the opaque `address` JSON (guide §5.5 shape) as display lines. */
export function addressLines(raw: unknown): string[] {
  if (!raw || typeof raw !== "object") return [];
  const a = raw as Record<string, unknown>;
  const lines: string[] = [];
  if (a.full_name) lines.push(String(a.full_name));
  const street = [a.line1, a.line2].filter(Boolean).join(", ");
  if (street) lines.push(street);
  const locality = [a.suburb, a.state, a.postcode].filter(Boolean).join(" ");
  if (locality) lines.push(locality);
  if (a.country) lines.push(String(a.country));
  if (a.phone) lines.push(String(a.phone));
  return lines;
}

/** Thin composable over the `address` Vuex module. */
export function useAddress() {
  const store = useStore();

  return {
    addresses: computed(() => store.state.address.addresses as CustomerAddress[]),
    loaded: computed(() => store.state.address.loaded as boolean),
    loading: computed(() => store.state.address.loading as boolean),

    fetchAddresses: () => store.dispatch("address/fetchAddresses"),
    addAddress: (payload: AddressShape) => store.dispatch("address/addAddress", payload) as Promise<CustomerAddress>,
    updateAddress: (addressId: number, payload: AddressShape) =>
      store.dispatch("address/updateAddress", { addressId, payload }),
    setDefaultAddress: (addressId: number) => store.dispatch("address/setDefaultAddress", addressId),
  };
}

import { http } from "./http";
import type { CustomerAddress } from "./types";

export type AddressShape = {
  full_name: string;
  line1: string;
  line2?: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
};

export const addressApi = {
  list: () => http.get<CustomerAddress[]>("/site-api/customer/get-address").then((e) => e.data ?? []),
  add: (address: AddressShape) =>
    http.post<CustomerAddress>("/site-api/customer/add-address", { body: { address } }).then((e) => e.data),
  /** `address_id: 0` means "update the customer's own default address" (guide §5.5) — not a real row id. */
  update: (addressId: number, address: AddressShape) =>
    http.post("/site-api/customer/update-address", { body: { address_id: addressId, address } }),
  updateDefault: (billing_address: AddressShape, shipping_address: AddressShape) =>
    http.patch("/site-api/update-address", { body: { billing_address, shipping_address } }),
  /** Marks one address book row as the customer's default (guide has no §5.5 entry for this yet — undocumented but live). */
  setDefault: (addressId: number) => http.get(`/site-api/customer/set-default-address/${addressId}`),
};

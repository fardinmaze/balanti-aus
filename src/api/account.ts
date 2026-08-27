import { http } from "./http";
import type { BackendCustomer, OrderSummary } from "./types";

export type EditAccountPayload = Partial<{
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
}>;

export const accountApi = {
  myAccount: () => http.get<BackendCustomer>("/site-api/my-account").then((e) => e.data!),
  editAccount: (payload: EditAccountPayload) =>
    http.patch<BackendCustomer>("/site-api/edit/my-account", { body: payload }).then((e) => e.data),

  myOrders: () => http.get<OrderSummary[]>("/site-api/my-orders").then((e) => e.data ?? []),
  /** Note: order detail is a POST despite reading a single resource — see guide §5.6. */
  orderDetail: (soId: string) => http.post<OrderSummary>(`/site-api/my-orders/${soId}`).then((e) => e.data!),
};

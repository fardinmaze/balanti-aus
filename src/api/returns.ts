import { http } from "./http";
import type { ReturnRequest } from "./types";

export const returnsApi = {
  request: (so_product_id: number, reason: string) =>
    http.post<ReturnRequest>("/returns/request", { body: { so_product_id, reason } }).then((e) => e.data),

  myRequests: () => http.get<ReturnRequest[]>("/returns/my-requests").then((e) => e.data ?? []),
};

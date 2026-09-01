import { http } from "./http";
import type { PaymentMethod, PlaceOrderResponse, ShippingMethod } from "./types";

export type VatStatus = { vat: number; inclusive: boolean };
export type FreeDelivery = { amount: number };
export type OfferStatus = { bmsm: boolean; super_sale: boolean };

export type CartItemPayload = {
  item_id: number;
  quantity: number;
  product_price: number;
  vat: number;
  vat_total: number;
  /** Matrix mechanism only (guide §5.1/§5.4) — omit entirely for a product with no variation on that axis. */
  color?: number;
  size?: number;
};

export type PlaceOrderPayload = {
  order_data: {
    reference?: string;
    so_date: string;
    shipment_date?: string;
    order_note?: string;
    order_tnc?: string;
  };
  order_cart: {
    shipping_type: number;
    payment_type: number;
    delivery_note?: string;
    discount_type: string | null;
    discount_value: number;
    discount_amount: number;
    shipping_value: number;
    shipping_amount: number;
    payment_value: number;
    payment_amount: number;
    adjustment: number;
    subtotal: number;
    total: number;
    cart_items: CartItemPayload[];
  };
  /** `0` = customer's default shipping_address; otherwise a CustomerAddress row id. */
  address: number;
  coupon_code?: string;
  /** Only consulted for guest checkout — omit entirely when logged in (guide §5.4). */
  customer_data?: {
    full_name: string;
    email: string;
    phone: string;
    line1: string;
    city: string;
    area: string;
  };
};

export const checkoutApi = {
  vatStatus: () => http.get<VatStatus>("/site-api/vat-status", { auth: false }).then((e) => e.data!),
  freeDelivery: () => http.get<FreeDelivery>("/site-api/free-delivery", { auth: false }).then((e) => e.data!),
  offerStatus: () => http.get<OfferStatus>("/site-api/offer-status", { auth: false }).then((e) => e.data!),
  shippingMethods: () => http.get<ShippingMethod[]>("/site-api/shipping-methods").then((e) => e.data ?? []),
  paymentMethods: () => http.get<PaymentMethod[]>("/site-api/payment-methods", { auth: false }).then((e) => e.data ?? []),

  validateCoupon: (coupon_code: string, cart_amount: number) =>
    http.post<Record<string, unknown>>("/site-api/validate-coupon", { body: { coupon_code, cart_amount } }).then((e) => e.data!),

  /** Guest + logged-in storefront checkout — use this one, not /place-order (guide §5.4). */
  placeOrder: (payload: PlaceOrderPayload) =>
    http.post<PlaceOrderResponse>("/site-api/place-order/web-front", { body: payload, auth: false }).then((e) => e.data!),
};

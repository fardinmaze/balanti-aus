/**
 * Order pricing — the one place the storefront works out prices and totals.
 *
 * `place-order/web-front` reprices the whole order from its own DB and rejects
 * it when our `order_cart.total` is more than 1 cent off (guide §5.4), so the
 * cart display, the checkout summary and the place-order payload all go
 * through these functions, which mirror the backend's rules exactly.
 */

/** Backend sale rule: `offer_price` only counts when `on_sale` and `0 < offer_price < sell_price`. */
export function isOnSale(onSale: boolean | undefined, sellPrice: number, offerPrice: number | null | undefined): boolean {
  return Boolean(onSale) && typeof offerPrice === "number" && offerPrice > 0 && offerPrice < sellPrice;
}

/** GST-inclusive unit price for an adapted product (see productAdapter.ts, which applies `isOnSale`). */
export function unitPrice(product: { price: number; onSale: boolean; offerPrice?: number }): number {
  return product.onSale && product.offerPrice != null ? product.offerPrice : product.price;
}

export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export type PricedLine = { price: number; qty: number };

/** Σ(unit price × quantity). */
export function subtotalOf(lines: PricedLine[]): number {
  return roundMoney(lines.reduce((sum, line) => sum + line.price * line.qty, 0));
}

export type CouponRule = { type: string; value: number };

/** Percentage = subtotal × value / 100; Fixed = value. Either way capped at the subtotal. */
export function couponDiscount(subtotal: number, coupon: CouponRule | null): number {
  if (!coupon) return 0;
  const amount = coupon.type.toLowerCase() === "percentage" ? subtotal * (coupon.value / 100) : coupon.value;
  return roundMoney(Math.min(Math.max(amount, 0), subtotal));
}

/** Free Delivery (`shipping_type: 0`) needs the subtotal *before* the coupon to reach the threshold. */
export function qualifiesForFreeDelivery(subtotal: number, threshold: number | null): boolean {
  if (threshold === null) return false;
  return subtotal >= threshold;
}

export type OrderTotalsInput = {
  lines: PricedLine[];
  coupon: CouponRule | null;
  /** GET /site-api/free-delivery `amount`; null until it has loaded. */
  freeDeliveryThreshold: number | null;
  /** Flat `charge` of the selected shipping method, used when the order doesn't qualify for free delivery. */
  shippingCharge: number;
  /** Flat `charge` of the selected payment method. */
  paymentCharge: number;
};

export type OrderTotals = {
  subtotal: number;
  discount: number;
  freeDelivery: boolean;
  shipping: number;
  paymentCharge: number;
  /** subtotal − discount + shipping + payment charge, rounded to 2 decimals. */
  total: number;
};

/**
 * The backend's own figures from a rejected place-order (`code: 400`,
 * "Order total does not match current prices...", `data.pricing`).
 */
export type PricingCorrection = {
  items: { itemId: number; price: number }[];
  subtotal?: number;
  discount?: number;
  shipping?: number;
  paymentCharge?: number;
  total?: number;
};

export const PRICE_MISMATCH_MESSAGE = "Order total does not match current prices";

function num(value: unknown): number | undefined {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
}

function pick(source: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = num(source[key]);
    if (value !== undefined) return value;
  }
  return undefined;
}

/**
 * [assumed] The guide documents `data.pricing` only as "per-item prices,
 * discount, shipping and total" without field names, so this accepts the
 * request's own names (`cart_items[].item_id`/`product_price`,
 * `discount_amount`, `shipping_amount`, `payment_amount`) plus the obvious
 * alternatives. Verify against a live rejection and tighten if they differ.
 */
export function parsePricingCorrection(data: unknown): PricingCorrection | null {
  if (!data || typeof data !== "object") return null;
  const pricing = (data as Record<string, unknown>).pricing;
  if (!pricing || typeof pricing !== "object") return null;
  const p = pricing as Record<string, unknown>;

  const rawItems = [p.cart_items, p.items, p.lines].find(Array.isArray) as unknown[] | undefined;
  const items = (rawItems ?? []).flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const row = raw as Record<string, unknown>;
    const itemId = pick(row, ["item_id", "product_id", "id"]);
    const price = pick(row, ["product_price", "unit_price", "price"]);
    return itemId !== undefined && price !== undefined ? [{ itemId, price }] : [];
  });

  return {
    items,
    subtotal: pick(p, ["subtotal"]),
    discount: pick(p, ["discount_amount", "discount"]),
    shipping: pick(p, ["shipping_amount", "shipping_charge", "shipping"]),
    paymentCharge: pick(p, ["payment_amount", "payment_charge", "payment"]),
    total: pick(p, ["total"]),
  };
}

export function computeOrderTotals(input: OrderTotalsInput): OrderTotals {
  const subtotal = subtotalOf(input.lines);
  const discount = couponDiscount(subtotal, input.coupon);
  const freeDelivery = subtotal === 0 || qualifiesForFreeDelivery(subtotal, input.freeDeliveryThreshold);
  const shipping = freeDelivery ? 0 : roundMoney(input.shippingCharge);
  const paymentCharge = roundMoney(input.paymentCharge);
  return {
    subtotal,
    discount,
    freeDelivery,
    shipping,
    paymentCharge,
    total: roundMoney(subtotal - discount + shipping + paymentCharge),
  };
}

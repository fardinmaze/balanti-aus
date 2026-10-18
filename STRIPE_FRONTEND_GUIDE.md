# Stripe Checkout — Frontend Integration Guide

The backend for Stripe card payments is done. The storefront needs the 5 tasks below so we can test
a full payment in Stripe **test mode** (no real money).

We use **Stripe Checkout** (Stripe-hosted payment page). The frontend never handles card details and
does not need Stripe.js.

## How the flow works

1. Customer picks a payment method with `gateway: "stripe"` and places the order as usual.
2. Backend creates the order as `PENDING_PAYMENT` and returns a `payment_url`.
3. Frontend redirects the browser to `payment_url`; the customer pays on Stripe's page.
4. Stripe sends the customer back to our confirmation page (`?session_id=cs_...`) or to the cancel URL.
5. Separately, Stripe notifies the backend via webhook. The confirmation page polls the backend until
   the status is final.

**Important:** landing on the confirmation page does NOT mean the payment succeeded. Only the status
returned by the backend does.

**API rule:** always check the `code` field in the response body, not the HTTP status — the API
returns HTTP 200 even for errors.

## Redirect URLs (local sandbox)

| Purpose | URL |
| --- | --- |
| Success | `http://localhost:5173/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}` |
| Cancel | `http://localhost:5173/checkout?cancelled=1` |

Stripe replaces `{CHECKOUT_SESSION_ID}` itself. If your dev server runs on a different port or route,
tell the backend team so we can change these.

---

## Task 1 — Show the card payment option

`GET /api/site-api/payment-methods` now returns a `gateway` field on each method.

```json
{ "id": 2, "name": "Card", "charge": 0, "logo": null, "status": true,
  "test_mode": true, "details": null, "account_number": null, "gateway": "stripe" }
```

- Show a method with `gateway: "stripe"` as a card option (e.g. "Pay by card").
- Decide by `gateway`, never by `name`.
- Cash on Delivery (`gateway: null`) works exactly as before.

## Task 2 — Place order and redirect to Stripe

Same call as today: `POST /api/site-api/place-order/web-front`, with `payment_type` = the Stripe
method's id. Request body is unchanged.

Success response for Stripe:

```json
{ "code": 200, "message": "Payment link generated",
  "data": { "order_id": "SO-009123",
            "payment_url": "https://checkout.stripe.com/c/pay/cs_test_...",
            "session_id": "cs_test_..." } }
```

Failure (order is rolled back automatically):

```json
{ "code": 400, "message": "Could not start payment: <reason>" }
```

- If `code == 200` and `data.payment_url` exists → save `order_id` / `session_id` (e.g.
  `sessionStorage`) and do `window.location.assign(payment_url)`.
- If there is no `payment_url` → it's a COD order, show the existing success screen.
- **Don't clear the cart yet** — only after Task 3 sees `PAID`.
- Disable the "Place order" button after the first click (double click = two orders).
- The backend recalculates the whole order from its own prices (sale price, coupon, shipping) and
  rejects it if `order_cart.total` differs by more than 1 cent. So `total` must equal what you show the
  customer, calculated the same way:
  `total = Σ(price × qty) − coupon discount + shipping charge + payment method charge`, where
  price = `offer_price` if `on_sale` and `offer_price` is lower than `sell_price`, else `sell_price`.
- On `code == 400`, show `message`, stay on checkout, re-enable the button.
- If `code == 400` with `"Order total does not match current prices..."`, the backend recalculated the
  order and got a different total. `data.pricing` has the correct per-item prices, discount,
  shipping and total — refresh the cart with these values and show them before the customer retries.

## Task 3 — Confirmation page (poll payment status)

Route: `/checkout/confirmation?session_id=cs_...`

Poll `GET /api/site-api/stripe/session-status?session_id=...` every 2 seconds:

```json
{ "code": 200, "message": "Session status",
  "data": { "status": "PAID", "order_id": "SO-009123", "total_amount": 189.0 } }
```

| `data.status` | Show | Stop polling? |
| --- | --- | --- |
| `CREATED` | "Confirming your payment…" + spinner | No |
| `PAID` | Success, order id + total. Clear the cart. | Yes |
| `FAILED` | "Payment did not go through" + button back to checkout | Yes |
| `EXPIRED` | Same as `FAILED` | Yes |

- Still `CREATED` after ~60 seconds → stop and show "Your payment is being processed. We'll email you
  once it's confirmed." (normal for bank-debit payments).
- `code == 400` ("Unknown session_id") or no `session_id` in URL → generic error + link to My Orders.
- Page refresh just re-checks the status; it's safe.

## Task 4 — Cancelled payment

If the customer clicks back on Stripe's page they land on `/checkout?cancelled=1`.

- Show "Payment cancelled. You have not been charged."
- Cart stays as it was; they can place the order again (this creates a new order — expected).

## Task 5 — New order statuses in My Orders

| Status | Label |
| --- | --- |
| `PENDING_PAYMENT` | Awaiting payment |
| `CONFIRMED` | Paid / Confirmed |
| `CANCELLED` | Cancelled (unpaid Stripe orders become this ~24h after checkout was abandoned) |

---

## Sandbox test checklist

On Stripe's page use any future expiry date, any 3-digit CVC, any name/postcode.

| # | Scenario | How | Expected |
| --- | --- | --- | --- |
| 1 | Successful payment | Card `4242 4242 4242 4242` | Success page, cart cleared, order `CONFIRMED` |
| 2 | 3D Secure card | Card `4000 0025 0000 3155`, approve the popup | Same as 1 |
| 3 | Declined card | Card `4000 0000 0000 9995` | Stripe shows the error on its page; order stays `PENDING_PAYMENT` |
| 4 | Customer cancels | Back arrow on Stripe's page | "Payment cancelled" notice, cart intact |
| 5 | Session expires | Backend runs `stripe checkout sessions expire cs_test_...` | Confirmation page shows failure; order `CANCELLED` |
| 6 | Coupon | Cancel once with a coupon, then pay with the same coupon | Coupon usage counted only once |
| 7 | COD still works | Place a Cash on Delivery order | Old success screen, no redirect |

If an order stays `PENDING_PAYMENT` after a successful payment, the webhook isn't reaching the backend
— ping the backend team.

## Known backend limitations (not for frontend to fix)

- Stock isn't reserved while the customer is on Stripe's page.
- Stripe's page shows one line item ("Balanti order SO-xxxxxx"), not individual products.

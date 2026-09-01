# Balanti Backend — API Guide for Frontend Integration

This is the integration reference for the Balanti e‑commerce backend (Django 3.2 + Django REST Framework). It covers the full API surface — the **storefront** endpoints your Next.js frontend calls directly, and the **back‑office** endpoints used by the internal admin/staff tools — plus the conventions, quirks, and gotchas you need to know before wiring anything up.

A companion Postman collection — `Balanti_Backend.postman_collection.json` — has all 347 endpoints pre-built with example bodies, path variables, and auth. Import it alongside this doc; the two are generated from the same source-code scan, so they stay in sync with each other.

---

## 1. Quick start

**Base URL:** every endpoint is mounted under `/api/`, e.g. `http://127.0.0.1:8000/api/site-api/products` locally, or `https://<your-domain>/api/site-api/products` in production. All example paths in this doc already include the `/api/` prefix.

**Content type:** send JSON. Every write endpoint expects `Content-Type: application/json` and a raw JSON body — there is no form-encoded variant. File uploads (product images, banners, avatars, review photos, etc.) are **not** multipart uploads; they're sent as base64 data-URI strings inside the JSON body (see §5).

**Auth header:** `Authorization: Bearer <access_token>` once you have a token (see §3).

---

## 2. The response envelope — and where it isn't one

Almost every endpoint returns JSON shaped like:

```json
{
  "code": 200,
  "message": "Products list received successfully!",
  "data": { }
}
```

Three things to know before you write a single API client function:

### 2.1 The HTTP status code is not reliable — check `code` in the body

This is the single most important gotcha in this API. The vast majority of hand-written view logic does `return Response({...})` **without** passing a DRF `status=` argument, which means the actual HTTP transport status is **200 OK even when the body says `"code": 400`**. A handful of endpoints are exceptions (unauthenticated requests, permission failures, and a few validation paths raised by DRF itself before your view code even runs — those come back as real 401/403/400 at the HTTP layer). But for the normal "something went wrong" case inside a try/except, expect HTTP 200 with an error `code` inside.

**Practical rule:** your API client should always inspect `response.data.code` (or `.data.status_code` where present) rather than trusting `response.status`. Treat any `code !== 200` as a failure regardless of the transport status.

### 2.2 The message key is inconsistent: `message` vs `response`

Storefront endpoints (`siteapi`, and the new `reviews`/`wishlist`/`returns` apps) mostly use `message` for the human-readable string. Back-office endpoints mostly use `response` for the same purpose. A few endpoints use both. Don't hardcode one key name in a shared response-unwrapping helper — check both:

```ts
const text = body.message ?? body.response ?? '';
```

### 2.3 Some validation failures skip the envelope entirely

A handful of `siteapi` endpoints (registration, login, coupon validation among them) return the raw DRF serializer error dict directly on validation failure, with no `code`/`message` wrapper at all:

```json
{ "email_address": ["This field is required."] }
```

Defensive client code: if `body.code` is `undefined`, treat the body as a field-name → error-list map instead of the standard envelope.

### 2.4 Pagination

List endpoints that accept a `count` query param (`/site-api/products`, `/site-api/featured-products`, `/site-api/hot-products`, `/site-api/related-products/:slug`, etc.) return Django REST Framework's standard page shape, merged into the envelope:

```json
{
  "code": 200,
  "message": "Products list received successfully!",
  "count": 132,
  "next": "http://.../api/site-api/products?count=20&page=2",
  "previous": null,
  "results": [ ]
}
```

`count` is **required** on these endpoints — omit it and the view throws a `KeyError` (which, per §2.1, comes back as HTTP 200 with `code: 400`). Always pass `?count=20` (or whatever page size you want).

---

## 3. Authentication — there are two separate login flows

There is exactly one JWT system in this backend (`djangorestframework-simplejwt`, issuing standard `access`/`refresh` tokens against Django's built-in `auth.User`). There is **no separate "customer" token type** at the technical level — a token is a token. The separation between "customer" and "staff" is enforced at the business-logic layer via Django permissions/groups checked per-endpoint (`@permission_required([...])`), not by the token itself. In practice, though, you should treat them as two separate flows because they're issued by different endpoints with different payloads and different downstream capabilities:

### 3.1 Customer auth (storefront)

| Action | Endpoint | Body |
|---|---|---|
| Register | `POST /api/site-api/customer/registration` | `first_name, last_name, email_address, phone_number, password, confirm_password, billing_address, shipping_address` |
| Login (phone) | `POST /api/site-api/customer/login` | `phone_number, password` |
| Login (email) | `POST /api/site-api/customer/email/login` | `email_address, password` |
| Forgot password | `POST /api/site-api/forget-password` | `phone_number, new_password1, new_password2` |
| Change password (logged in) | `POST /api/site-api/change-password` | `old_password, new_password1, new_password2` |

Login responses include `access_token`, `refresh_token`, `token_type`, `expiry`, and a `user_object`. Store `access_token` and send it as a Bearer token on every subsequent customer-scoped call (my-account, my-orders, cart sync, reviews, wishlist, returns).

Registration validates uniqueness by **email or phone**, not just email — a customer record can exist without a login (e.g. created by staff, or from a guest checkout) and registration will attach a real password to it rather than creating a duplicate. Passwords are validated to match (`password === confirm_password`) server-side; there's no dedicated password-strength rule beyond Django's defaults.

Access tokens are valid for **1 day**; refresh tokens for **1 year** (`SIMPLE_JWT` settings, not customer-specific — same lifetimes apply to staff tokens). There's no `POST /api/site-api/token/refresh` — the storefront refresh path isn't wired up yet; only the back-office `authentication` app exposes `/api/authentication/token/refresh`. **Known gap:** if you need silent token refresh on the storefront, either reuse `/api/authentication/token/refresh` (it just validates the refresh token against `auth.User`, so it will accept a customer's refresh token too) or add a thin `siteapi` alias before launch.

### 3.2 Staff/back-office auth

Not used by the customer-facing frontend, but included for completeness (e.g. if you're also building the internal ops dashboard against this same API):

| Action | Endpoint | Body |
|---|---|---|
| Staff login | `POST /api/authentication/token` | `email, password` |
| Verify token | `POST /api/authentication/token/verify` | `token` |
| Refresh token | `POST /api/authentication/token/refresh` | `refresh` |

Staff login returns `permissions`/`permission_list` alongside the token — the back-office UI uses these to show/hide menu items. Every back-office write endpoint additionally checks a specific permission codename (`product.edit`, `order.view`, etc. — see the reference tables below) via Django's group/permission system; a valid JWT alone isn't sufficient if the user's group lacks that permission — you'll get a 403 from DRF's own permission layer (a real HTTP status this time, not wrapped in the `code: 400` pattern).

### 3.3 Permission model at a glance

Staff users belong to Django `Group`s. Two default groups exist: **Admin** (all permissions) and **Staff** (view-only). There are two independent ways to seed them, and both are safe to call in any order relative to each other and to `GET /api/system/manager/seed`:

- `python manage.py seed_permissions` — management command, see `access_control/management/commands/seed_permissions.py`.
- `POST /api/access-control/seed-permissions` — the same seeding over HTTP (`Public`, no auth needed), plus it creates/reuses a `superadmin` staff account (`username: superadmin`) in the Admin group. It resolves that account by **username**, not email, specifically so it doesn't collide with the `superadmin` user `GET /api/system/manager/seed` already creates — calling both seeders against the same fresh database is fine and idempotent.

Assign/inspect permissions via the `access-control` endpoints (`/api/access-control/user-permissions/*`).

---

## 4. Currency, tax, and shipping — Balanti-specific config

Balanti is AUD-only, GST-registered. These are runtime settings (DB rows), not hardcoded — read them, don't hardcode `10%`/`$150` in the frontend:

- **GST:** `GET /api/site-api/vat-status` → `{ "vat": 10.0, "inclusive": true }`. Prices in `Product.sell_price` etc. are GST-inclusive display prices; the backend computes the GST component per line item at checkout time (see `placeOrder`/`placeOrderWebFront` — they split `product_price` into ex-GST `rate` + `vat_total` per unit using `Product.vat`).
- **Free delivery threshold:** `GET /api/site-api/free-delivery` → `{ "amount": 150.0 }`. There's no server-side "auto-apply free shipping" logic in the checkout endpoints themselves — the **frontend** is responsible for comparing cart subtotal against this threshold and choosing `shipping_type: 0` (which the backend resolves to the `ShippingMethod` row literally named `"Free Delivery"` — this exact string match is load-bearing, don't rename that row) vs. a paid `ShippingMethod` id from `GET /api/site-api/shipping-methods`. `GET /api/system/manager/seed` now creates that `"Free Delivery"` row itself (it didn't before — `shipping_type: 0` would 400 with "ShippingMethod matching query does not exist" on a freshly seeded database), so you no longer need to run `seed_storefront` first just to make guest/free-shipping checkout work.
- **Payment methods:** `GET /api/site-api/payment-methods` — currently seeded with a single **"Cash on Delivery"** method (`test_mode: true`). Balanti is running with the payment gateway bypassed for now (per the project's current phase) — there is no `/payment/webhook` or transaction-log endpoint yet. When a real gateway (Stripe etc.) is integrated, expect a new `PaymentTransaction`-style model/endpoint; until then, checkout always resolves to whatever `payment_type` id you pass, most realistically the seeded COD method.
- **Sale banners:** `GET /api/site-api/offer-status` → `{ "bmsm": false, "super_sale": false }` — drives whether "Buy More Save More" / "Super Sale" storefront banners show. Toggled from the back office via `PATCH /api/system/settings/offer-status/edit`. Like Free Delivery above, `GET /api/system/manager/seed` now creates this row too (it previously didn't exist until the first back-office edit, so this endpoint would 400 on a fresh database).
- **Category scope:** only **Men** is seeded today (with **Oxfords** and **Loafers** as subcategories). The category model supports Women/Kids identically — no code changes needed, just new seed rows — so don't build any "men's-store-only" assumptions into the frontend; drive category navigation entirely off `GET /api/site-api/all-categories` / `GET /api/site-api/top-categories`.

---

## 5. Storefront integration walkthrough

This section covers the actual customer journey, in order, with the exact endpoints and payload shapes you'll use. Everything here lives under `/api/site-api/`, `/api/reviews/`, `/api/wishlist/`, `/api/returns/`, `/api/coupon/` (validation only).

### 5.1 Browsing: categories → products → product detail

```
GET /api/site-api/all-categories          — flat list, all categories
GET /api/site-api/top-categories          — only parent==0 rows (Men, and later Women/Kids)
GET /api/site-api/category-products/:category_slug   — products in a category (grouped by variant parent)
GET /api/site-api/parent-category-products/:category_slug — products under a parent category incl. its subcategories
GET /api/site-api/products?count=20       — paginated full catalog
GET /api/site-api/featured-products?count=20
GET /api/site-api/hot-products?count=20
GET /api/site-api/related-products/:product_slug?count=8
GET /api/site-api/product/:product_slug   — full product detail
GET /api/site-api/search-product?keyword=oxford&count=20
```

**Category model quirk (intentional, inherited from Neer, kept as-is):** `Category.parent` is a plain integer, not a real self-referencing foreign key. `parent == 0` means "top-level" (e.g. Men); a non-zero `parent` is the id of another `Category` row (e.g. Oxfords → parent = Men's id). A product's `category` and `subcategory` fields are **two independent FKs** straight to `Category` — `subcategory` is not derived from `category.parent`, it's just set directly when the product is created. Don't assume subcategories are exclusively children of their product's own category; use `/category/by-parent` or `/category/tree` (back office) if you need the nested shape.

**Product variants (size/color) are sibling rows, not a nested array on write, but they are nested on read.** Each size/color combination is its own `Product` row sharing a `product_group` value (the parent's own `pid`). `GET /api/site-api/product/:slug` returns the requested variant plus a `variations` array assembled server-side from its siblings — that's what you use to render a size/color picker. There is no separate "variant" resource to call.

**Single-product color/size stock (new, a separate mechanism from the sibling-row one above).** Some products — typically shoe-style ones — carry their color/size options and per-combination stock directly on one `Product` row instead of as sibling rows. `GET /api/site-api/product/:slug` and the product list endpoints above also return:
- `colors`: `[{ "id": 4, "name": "Black", "hex_code": "#000000", "image": "http://host/media/..." }]` — `image` is `null` if that color has no photo.
- `sizes`: `[{ "id": 9, "name": "42" }]`
- `stock_variations`: `[{ "color": 4, "color_name": "Black", "color_image": "http://host/media/...", "size": 9, "size_name": "42", "quantity": 15.0 }]` — current stock per `(color, size)` combination. `color`/`size` are `null` when a product has no variation on that axis; a `{ "color": null, "size": null, "quantity": N }` entry is the product's plain default stock.

Use `colors`/`sizes` to render the picker and `stock_variations` to know what's actually purchasable for a given combination (disable/hide a combination with `quantity: 0` or no matching entry at all). All three arrays are empty on a product that doesn't use this mechanism — check `variations` (above) for whether it uses the sibling-row mechanism instead; a product can use either, both, or neither.

Whichever color/size the customer picks, carry its `id`s through to checkout as `cart_items[].color`/`cart_items[].size` (§5.4) — that's what checkout validates stock against and what ends up recorded on the order line.

### 5.2 Cart

There's no authoritative server-side cart resource that the frontend reads from on every render. The pattern is:

- **Guest and logged-in users alike:** the frontend owns the live cart entirely client-side (localStorage/state). You compute subtotal, discounts, shipping, and GST on the client for display, then send the whole cart as a payload blob at checkout time (`order_cart.cart_items`) — see §5.4.
- **Logged-in users, optionally:** `salesorder.CartItems` exists as a *persisted snapshot* you can sync to across devices/sessions, under `/api/sales-orders/cart-items*` — but note those routes require **staff-level** JWT/permissions (`order.view`) in the current wiring, i.e. they're back-office routes, not meant for direct customer use from the storefront today. If you want true server-persisted guest→login cart merge, treat this as a known gap to close before launch rather than something to wire up as-is.

### 5.3 Coupons

```
POST /api/site-api/validate-coupon
Auth: Customer JWT required
Body: { "coupon_code": "WELCOME10", "cart_amount": 249.00 }
```

Checks: coupon exists + active, within `start_date`/`end_date`, `cart_amount >= minimum_order_amount`, usage limit not exhausted, and (if `once_per_user`) not already used by this user. Returns the full `CouponCodes` row as `data` on success so you can read `coupon_type` (`Fixed`/`Percentage`) and `coupon_value` to compute the discount client-side. Coupon redemption itself is recorded when the order is actually placed (`CouponUsage` row created inside `placeOrder`), not at validation time — so validating twice doesn't burn a use.

### 5.4 Checkout

Two endpoints exist; use **Place Order Web Front**, not Place Order, for a Next.js storefront:

```
POST /api/site-api/place-order/web-front
Auth: none required (AllowAny) — but honors an Authorization header if present
```

This is the one built for a headless frontend: it supports **guest checkout** (matches an existing customer by email/phone, or creates a new `User`+`Customers` record on the fly with an unusable password) as well as logged-in checkout (reads the customer off the JWT). `POST /api/site-api/place-order` is the older, JWT-only variant — functionally similar but requires login and has no guest path.

Request shape:

```json
{
  "order_data": {
    "reference": "",
    "so_date": "2026-08-25",
    "shipment_date": "2026-08-30",
    "order_note": "",
    "order_tnc": ""
  },
  "order_cart": {
    "shipping_type": 0,
    "payment_type": 1,
    "discount_type": null,
    "discount_value": 0,
    "discount_amount": 0,
    "shipping_value": 0,
    "shipping_amount": 0,
    "payment_value": 0,
    "payment_amount": 0,
    "adjustment": 0,
    "subtotal": 249.00,
    "total": 249.00,
    "cart_items": [
      { "item_id": 1, "quantity": 1, "product_price": 249.00, "vat": 10, "vat_total": 22.63,
        "color": 4, "size": 9 }
    ]
  },
  "address": 0,
  "coupon_code": "",
  "customer_data": {
    "full_name": "Jane Doe", "email": "jane.doe@example.com", "phone": "+61400000000",
    "line1": "1 Example St", "city": "Sydney", "area": "NSW"
  }
}
```

Field notes:

- `shipping_type: 0` is a **sentinel**, not a real id — it means "use the shipping method literally named Free Delivery." Any other value must be a real `ShippingMethod` id from `/shipping-methods`.
- `payment_type` must be a real `PaymentMethods` id from `/payment-methods` (currently just Cash on Delivery).
- `cart_items[].item_id` is the **Product** row id (the specific variant, if the product has variants) — not the `pid` string.
- `cart_items[].color`/`cart_items[].size` are **optional** — only send them for a product that uses the color/size stock mechanism (§7.8/§9 of `ADMIN_API_GUIDE.md`), and only the axis/axes it actually has: numeric `ProductHasColor`/`ProductHasSize` ids scoped to that `item_id`'s product (from `GET /api/product/color/<pid>` / `.../size/<pid>` — the admin-side catalog endpoints; there's no site-api equivalent yet, read them off `colors`/`sizes` on the product detail, §5.1). Omit either (or both) for a product with no variation on that axis. These are stored on the order line and drive which stock lot gets decremented — see the stock-check note below.
- `vat`/`vat_total` per line: the backend trusts what you send here rather than recomputing from `Product.vat` — compute it client-side from the product's `vat` percentage so what the customer sees during checkout matches what lands on the order (`rate = product_price / (1 + vat/100)`, `vat_total = (product_price - rate) * quantity`).
- `address`: `0` means "use the customer's default `shipping_address`" (their profile JSON); any other integer is a `CustomerAddress` row id from the address book (§5.5).
- `customer_data` is **only consulted for guest checkout** (no `Authorization` header, or an anonymous request) — omit it for logged-in checkout.

Response on success:

```json
{ "code": 200, "message": "Sales order created successfully!",
  "data": { "order_id": "SO-009123", "items_created": 1, "failed_items": [] } }
```

Note `failed_items` — the endpoint is resilient per-line-item: if one cart line references a bad/deleted product id, that line is skipped and reported here rather than failing the whole order (unless *every* line fails, in which case the order is rolled back and you get a top-level `code: 400`). Always check `failed_items` even on a `code: 200` response.

Stock is decremented (`ps_on_hand`/`ps_committed`) synchronously as part of order creation — there's no separate "reserve stock" step.

**Insufficient stock is rejected before the order is created.** Both `place-order` and
`place-order/web-front` sum `quantity` per **`(item_id, color, size)`** across the whole cart (so
ordering the same product/variation twice in one cart is checked as one combined amount) and
compare it against the stock actually available for that exact combination:

- If the cart line sent **neither `color` nor `size`**, that's whole-product `Product.ps_on_hand`
  — the right check for a product that doesn't use the color/size mechanism at all.
- If it sent **either**, the check instead sums `remaining_stock` across the stock lots matching
  that exact `(product, color, size)` combination (the same number `stock_variations`, §5.1,
  exposes on reads) — so a sold-out color/size is rejected even while the product overall still
  shows stock in other combinations. A `color`/`size` id that doesn't belong to that product's own
  catalog is rejected too, before it ever reaches a stock comparison.

If any line fails either check, **no `SalesOrder` row is created at all** and you get:

```json
{
  "code": 400,
  "message": "One or more items exceed available stock.",
  "data": {
    "stock_errors": [
      {
        "item_id": 1,
        "product_name": "Balmoral Oxford",
        "color": 4,
        "size": 9,
        "requested": 5,
        "available": 3,
        "error": "Only 3.0 unit(s) of \"Balmoral Oxford\" left in stock."
      }
    ]
  }
}
```

`color`/`size` on an error entry are omitted (not present as keys) for a whole-product check;
present (possibly `null` if only one axis was sent) for a variation check. A `color`/`size`
ownership failure instead comes back as `{ "item_id": 1, "color": 99, "error": "Selected color
does not belong to this product." }` — no `available`/`requested` since no stock comparison
happened. Render `stock_errors` inline on the affected cart line(s) rather than a generic
checkout failure — it's actionable ("only 3 left, reduce quantity").

The `color`/`size` you send are also **stored on the resulting order line** and determine which
stock lot actually gets decremented (and, if the order is later cancelled via the back office,
which lot gets the stock given back) — so always send them when the product has variations, not
just for the stock check. Read them back via `color`/`color_name`/`size`/`size_name` on
`myOrderDetails`' `details` array (`SalesOrderProductsSerializer`).

### 5.5 Address book

```
GET  /api/site-api/customer/get-address        — Auth: Customer JWT
POST /api/site-api/customer/add-address        — Body: { "address": { ...see shape below } }
POST /api/site-api/customer/update-address      — Body: { "address_id": 0 or <id>, "address": {...} }
PATCH /api/site-api/update-address              — Body: { "billing_address": {...}, "shipping_address": {...} }
```

`address` is an **opaque JSON field** — there's no fixed schema enforced by the database, so the shape below is a documented contract between frontend and backend, not a hard constraint. Use this shape consistently:

```json
{
  "full_name": "Jane Doe",
  "line1": "1 Example St",
  "line2": "",
  "suburb": "Sydney",
  "state": "NSW",
  "postcode": "2000",
  "country": "Australia",
  "phone": "+61400000000"
}
```

`address_id: 0` is a sentinel meaning "update the customer's own default `shipping_address`/`billing_address`," not a real `CustomerAddress` row — same convention as checkout's `address` field.

### 5.6 Account & order history

```
GET   /api/site-api/my-account              — Auth: Customer JWT
PATCH /api/site-api/edit/my-account         — Body: first_name, last_name, email_address, phone_number
GET   /api/site-api/my-orders               — Auth: Customer JWT, this customer's orders
GET   /api/site-api/my-orders/:so_id        — order detail (note: this one is POST, not GET — see table)
```

### 5.7 Reviews (new — not in the original Neer codebase)

```
GET  /api/reviews/product/:product_slug     — public, approved reviews only
POST /api/reviews/create                    — Auth: Customer JWT
Body: { "product_slug": "balmoral-oxford", "rating": 5, "title": "Excellent", "comment": "..." }
```

Reviews are **not visible immediately** — `is_approved` defaults to `false` and reviews only appear in the public list once approved via Django admin. `is_verified_purchase` is set automatically (server checks whether this user has a completed sales-order line for the product) — you don't send it. `Product.average_rating` is recomputed automatically whenever a review is approved/edited in admin; you don't need to compute it client-side, just read it off the product detail response. One review per user per product is enforced server-side.

### 5.8 Wishlist (new)

```
GET    /api/wishlist/                        — Auth: Customer JWT
POST   /api/wishlist/add                     — Body: { "product_slug": "..." }
DELETE /api/wishlist/remove/:product_slug
```

Idempotent add (adding an already-wishlisted product returns success with a different message, doesn't error or duplicate).

### 5.9 Returns (new)

```
POST /api/returns/request       — Auth: Customer JWT — Body: { "so_product_id": 1, "reason": "Wrong size" }
GET  /api/returns/my-requests   — Auth: Customer JWT — this customer's own return requests
PATCH /api/returns/update-status — Auth: Staff JWT (back office) — Body: { "return_id": 1, "status": "APPROVED" }
```

`so_product_id` is a `SalesOrderProducts` line-item id (from an order's detail response), not the product id or order id. The 30-day return window is enforced server-side against the order's shipment date (falls back to the order's last-updated date if no shipment record exists yet) using the configurable `ThresholdSettings.expire_days` (defaults to 30) — there's no separate "return window" setting to manage. `status` transitions: `REQUESTED → APPROVED/REJECTED → RECEIVED → REFUNDED`; only staff can move it forward (there's no customer-facing cancel/update).

### 5.10 Mobile OTP — known limitation, don't wire this up as-is

`POST /api/site-api/send-otp` / `POST /api/site-api/verify-otp` exist, but the phone-number normalization logic is **hardcoded for Bangladeshi numbers** (it strips/prepends the `88` country code regardless of input). Sending an Australian `+61...` number through these will silently produce a garbled, non-functional "mobile" key. Until this is reworked for AU numbers (or swapped for email-based verification / a proper AU SMS provider like Twilio), don't build OTP-based signup/verification into the storefront flow — the original scoping doc flagged this exact decision as open. Registration itself (§3.1) does not require OTP verification today, so it's safe to ship without it.

---

## 6. File / image uploads

There's no multipart upload endpoint anywhere in the storefront API surface. Every image field (product images, review photos if you add them, avatar, etc.) is sent as a **base64 data URI string** inside the normal JSON body:

```json
{ "product_image": ["data:image/jpeg;base64,/9j/4AAQSkZJRg..."] }
```

The backend splits on `;base64,`, decodes, and writes it as a `ContentFile`. Keep this in mind for upload size — there's no chunking/streaming, so very large images should be resized/compressed client-side before encoding.

Optional image/logo fields (category image, CMS impact/partner/story images, table image, `app_logo`/`app_logo_text`/`app_favicon`, Facebook meta image) tolerate an omitted key, `null`, or `""` — send whichever is convenient for "no image yet" and the field is simply left untouched/unset. Only send a real `data:image/...;base64,...` string when you actually have image data; sending anything else (including the literal string `"example"`) will fail with a "not a valid file" or unpacking error.

---

## 7. Known issues & gaps (read before you build against these)

- **HTTP status codes are frequently 200 even on business-logic failure** — see §2.1. This is the #1 integration trap.
- **`message` vs `response` key inconsistency** — see §2.2.
- **No storefront token-refresh endpoint** — see §3.1. Reuse `/api/authentication/token/refresh` or add one before launch.
- **Payment gateway is bypassed** — only Cash on Delivery is seeded; no transaction-log model exists yet. Don't build a "payment confirmation" screen expecting a gateway callback — orders are simply created with `payment_amount`/`payment_type` recorded at face value.
- **`salesorder.CartItems` sync endpoints are wired as staff-only** (`order.view` permission) in the current routing, not customer-facing, despite existing in the model layer for exactly this purpose. Either loosen the permission on those specific routes or leave cart entirely client-side, per §5.2.
- **Mobile OTP is Bangladesh-specific** — see §5.10. Don't ship it as-is for AU numbers.
- **A few Access Control endpoints are unauthenticated by design in the current code:** `POST /api/access-control/user-accounts/employee/create`, `POST /api/access-control/user-accounts/employee/onboard`, and `POST /api/access-control/seed-permissions` all have `AllowAny` + no auth classes. This is inherited as-is from the source codebase; if the back-office admin tool is ever exposed beyond a trusted internal network, lock these down before that happens.
- **A couple of duplicate route registrations still exist** in `system_settings` (`offer-banner`, `offer-banner/upload`, `offer-banner/delete/:id` are each registered twice) — harmless (Django just uses the first match), listed here so you don't think it's a documentation error when you see it twice in the table below. (`system_settings/` and `system_settings/business-slug` used to be a broken duplicate of this same kind — see the fix list below — they now both correctly resolve to the same view, so calling either works identically.)
- **"Source" endpoints** (`*-source`, `place-order/source`, `validate-coupon/source`, `shipping-methods/source`, `payment-methods/source`, `my-orders/source/*`) are a parallel, unauthenticated (`AllowAny`) family of the same operations, used for a separate "source order" flow (walk-in/manual/reseller-originated orders — see `salesorder.SourceOrders`) rather than the main customer storefront. Don't call these from the customer-facing frontend; use the non-`source` counterparts.

### 7.1 Recently fixed (worth knowing if you hit an old workaround in your own notes)

A full pass through every endpoint (fresh-DB migration, live exercise of every flow, Postman collection repair) turned up and fixed the following. None of these need a workaround anymore — listed here only so you don't go looking for one:

- **`GET /api/system/manager/permission/definitions/seed` has been removed.** It was redundant with `POST /api/access-control/seed-permissions` (§3.3), which is the one endpoint to use going forward.
- **PATCH endpoints now do real partial updates.** Product edit, coupon edit, category edit, story update, your-own-profile edit (`/system/settings/my-profile/edit`), and staff user-account edit (`/access-control/user-accounts/edit/:id`) previously required you to resend every field (or, for CMS "get involved" update, could never succeed at all if the email stayed the same) — send only the fields you're changing now, as the docs below already assume.
- **Recording a bill/invoice payment without `proof_image` no longer errors out after already recording the payment.** `proof_image` is genuinely optional on both `/purchase-orders/bills/record-payment` and `/sales-orders/invoice/record-payment` now — omit it freely.
- **Bad data on employee/user account creation returns a normal `code: 400` now**, not an HTTP 500.
- **`GET /api/site-api/why-choose-us` and `GET /api/sales-orders/so-receipts/:so_id` no longer 500** on a non-empty result set.
- **The table/POS endpoints** (`table/set-order`, `table/clear-table`, `table/change-table`) **return a clean 400 instead of a 500** when the referenced table/order doesn't exist.
- **`shipping_type: 0` and `GET /api/site-api/offer-status` work right after the base seed** — see §4.
- **`POST /api/access-control/seed-permissions` no longer collides with `GET /api/system/manager/seed`'s `superadmin` account** — call either or both, in any order.
- **Optional image/logo fields no longer crash on `""`** — see §6.

---

## 8. Full endpoint reference

Every route in the project, grouped by app, generated directly from the URL configuration and view decorators. **Auth** column: `Public` = no token needed; `Customer JWT` / `Staff JWT` = bearer token required (see §3 for what that distinction actually means technically); `+ permission.codename` = additionally requires that Django permission. **Body fields** lists the JSON keys the view actually reads (via `request.data` / its serializer) — GET/DELETE requests take no body and use path params instead (shown inline in the path as `:param`, matching the Postman collection).

### Storefront &mdash; Site API

| Method | Path | Name | Auth | Body fields |
|---|---|---|---|---|
| GET | `/api/site-api/site-info` | Site Info | Public | &mdash; |
| GET | `/api/site-api/social-links` | Social Links | Public | &mdash; |
| GET | `/api/site-api/site-banner` | Site Banner | Public | &mdash; |
| GET | `/api/site-api/sub-banner` | Sub Banner | Public | &mdash; |
| GET | `/api/site-api/all-categories` | All Categories | Public | &mdash; |
| GET | `/api/site-api/top-categories` | Top Categories | Public | &mdash; |
| GET | `/api/site-api/category-products/<slug:category_slug>` | Products By Category Group | Public | &mdash; |
| GET | `/api/site-api/category-products/gnone/<slug:category_slug>` | Products By Category | Public | &mdash; |
| GET | `/api/site-api/parent-category-products/<slug:category_slug>` | Products By Parent Category Group | Public | &mdash; |
| GET | `/api/site-api/parent-category-products/gnone/<slug:category_slug>` | Products By Parent Category | Public | &mdash; |
| POST | `/api/site-api/category/by-parent` | Get Category By Parent | Public | `parent` |
| GET | `/api/site-api/products` | Product List | Public | &mdash; |
| GET | `/api/site-api/featured-products` | Featured Product List | Public | &mdash; |
| GET | `/api/site-api/hot-products` | Hot Product List | Public | &mdash; |
| GET | `/api/site-api/buy-save-products` | Bmsm Product List | Public | &mdash; |
| GET | `/api/site-api/super-sale-products` | Super Sale Product List | Public | &mdash; |
| GET | `/api/site-api/featured-products` | Featured Product List | Public | &mdash; |
| GET | `/api/site-api/related-products/<slug:product_slug>` | Related Product List | Public | &mdash; |
| GET | `/api/site-api/product/<slug:product_slug>` | Product Details | Public | &mdash; |
| GET | `/api/site-api/search-product` | Search Product | Public | &mdash; |
| GET | `/api/site-api/my-account` | My Account | Customer JWT | &mdash; |
| PATCH | `/api/site-api/edit/my-account` | Edit My Account | Customer JWT | `billing_address`, `email_address`, `first_name`, `last_name`, `phone_number`, `shipping_address` |
| GET | `/api/site-api/my-orders` | My Orders | Customer JWT | &mdash; |
| POST | `/api/site-api/my-orders/source/<str:customer_id>` | My Orders Source | Public | &mdash; |
| POST | `/api/site-api/my-orders/<str:so_id>` | My Order Details | Customer JWT | &mdash; |
| GET | `/api/site-api/my-orders/source/details/<str:so_id>` | My Order Details Source | Public | &mdash; |
| POST | `/api/site-api/change-password` | Change Password | Customer JWT | `new_password1`, `new_password2`, `old_password` |
| POST | `/api/site-api/forget-password` | Forget Password | Public | `new_password1`, `new_password2`, `phone_number` |
| PATCH | `/api/site-api/update-address` | Update Address | Customer JWT | `billing_address`, `shipping_address` |
| POST | `/api/site-api/customer/validate-registration` | Customer Registration Validation | Public | `billing_address`, `confirm_password`, `email_address`, `first_name`, `last_name`, `password`, `phone_number`, `shipping_address` |
| POST | `/api/site-api/customer/check-mobile-number` | Check Mobile Number | Public | `phone_number` |
| GET | `/api/site-api/customer/get-address` | Get Customer Address | Customer JWT | &mdash; |
| POST | `/api/site-api/customer/add-address` | Add Customer Address | Customer JWT | `address` |
| POST | `/api/site-api/customer/update-address` | Update Customer Address | Customer JWT | `address`, `address_id` |
| POST | `/api/site-api/customer/registration` | Customer Registration | Public | `billing_address`, `confirm_password`, `email_address`, `first_name`, `last_name`, `password`, `phone_number`, `shipping_address` |
| POST | `/api/site-api/source-customer/registration` | Source Customer Registration | Public | `billing_address`, `email_address`, `first_name`, `phone_number`, `shipping_address` |
| POST | `/api/site-api/customer/login` | Customer Login | Public | `password`, `phone_number` |
| POST | `/api/site-api/customer/email/login` | Customer Email Login | Public | `email_address`, `password` |
| GET | `/api/site-api/shipping-methods` | Shipping Methods | Customer JWT | &mdash; |
| GET | `/api/site-api/shipping-methods/source` | Shipping Method Source | Public | &mdash; |
| GET | `/api/site-api/payment-methods` | Payment Methods | Public | &mdash; |
| GET | `/api/site-api/payment-methods/source` | Payment Method Source | Public | &mdash; |
| GET | `/api/site-api/threshold-settings` | Threshold Settings | Public | &mdash; |
| POST | `/api/site-api/validate-coupon` | Validate Coupon | Customer JWT | `cart_amount`, `coupon_code` |
| POST | `/api/site-api/validate-coupon/source` | Validate Coupon Source | Public | `cart_amount`, `coupon_code`, `name` |
| GET | `/api/site-api/free-delivery` | Free Delivery | Public | &mdash; |
| GET | `/api/site-api/offer-status` | Offer Status | Public | &mdash; |
| GET | `/api/site-api/vat-status` | Vat Settings | Public | &mdash; |
| POST | `/api/site-api/place-order` | Place Order | Customer JWT | `address`, `coupon_code`, `order_cart`, `order_data`, `order_note`, `order_tnc`, `reference`, `shipment_date`, +1 more |
| POST | `/api/site-api/place-order/web-front` | Place Order Web Front | Public | `address`, `coupon_code`, `customer_data`, `order_cart`, `order_data`, `order_note`, `order_tnc`, `reference`, +2 more |
| POST | `/api/site-api/place-order/source` | Place Order Source | Public | `coupon_code`, `customer_id`, `order_cart`, `order_data`, `order_note`, `order_tnc`, `reference`, `shipment_date`, +1 more |
| GET | `/api/site-api/why-choose-us` | Why Choose Us | Public | &mdash; |
| POST | `/api/site-api/send-otp` | Send OTP | Public | `mobile` |
| POST | `/api/site-api/verify-otp` | Verify OTP | Public | `mobile`, `otp` |

### Storefront &mdash; Reviews

| Method | Path | Name | Auth | Body fields |
|---|---|---|---|---|
| GET | `/api/reviews/product/<slug:product_slug>` | Product Reviews | Public | &mdash; |
| POST | `/api/reviews/create` | Create Review | Customer JWT | `comment`, `product_slug`, `rating`, `title` |

### Storefront &mdash; Wishlist

| Method | Path | Name | Auth | Body fields |
|---|---|---|---|---|
| GET | `/api/wishlist/` | Wishlist View | Customer JWT | &mdash; |
| POST | `/api/wishlist/add` | Wishlist Add | Customer JWT | `product_slug` |
| DELETE | `/api/wishlist/remove/<slug:product_slug>` | Wishlist Remove | Customer JWT | &mdash; |

### Storefront &mdash; Returns

| Method | Path | Name | Auth | Body fields |
|---|---|---|---|---|
| POST | `/api/returns/request` | Request Return | Customer JWT | `reason`, `so_product_id` |
| GET | `/api/returns/my-requests` | My Return Requests | Customer JWT | &mdash; |
| PATCH | `/api/returns/update-status` | Update Return Status | Staff JWT | `return_id`, `status` |

### Back Office &mdash; Authentication

| Method | Path | Name | Auth | Body fields |
|---|---|---|---|---|
| POST | `/api/authentication/register` | Registration View | Public | `email`, `first_name`, `last_name`, `password`, `password2`, `username` |
| POST | `/api/authentication/register/subscriber` | Subscriber Registration View | Public | `email`, `first_name`, `last_name`, `password`, `password2`, `username` |
| POST | `/api/authentication/token` | Token Obtain Pair | Public | `email`, `password` |
| POST | `/api/authentication/change-password` | Change Password | Public | `email`, `password` |
| POST | `/api/authentication/token/admin` | Token Obtain Pair Admin | Public | `email`, `password` |
| POST | `/api/authentication/token/verify` | Token Verify | Public | `access_token` |
| POST | `/api/authentication/token/refresh` | Token Refresh | Public | `refresh_token` |
| GET | `/api/authentication/token/subscriber/get-api-key` | Get Subscriber API Key | Staff JWT | &mdash; |

### Back Office &mdash; System Manager

| Method | Path | Name | Auth | Body fields |
|---|---|---|---|---|
| GET | `/api/system/manager/seed` | Seeder | Public | &mdash; |
| POST | `/api/system/manager/subscriber/permission/seed` | Permission Seeder | Public | &mdash; |
| POST | `/api/system/manager/subscriber/permission/remove` | Permission Remover | Public | &mdash; |
| GET | `/api/system/manager/admin/permission/seed` | Admin Permission Seed | Public | &mdash; |
| GET | `/api/system/stats` | Operation Stats | Staff JWT | &mdash; |

### Back Office &mdash; Site Settings

| Method | Path | Name | Auth | Body fields |
|---|---|---|---|---|
| PATCH | `/api/system/settings/my-profile/edit` | Edit My Profile | Staff JWT | `email`, `first_name`, `id`, `last_name`, `photo`, `user`, `user_photo`, `username` |
| GET | `/api/system/settings/my-profile` | Get My Profile | Staff JWT | &mdash; |
| PATCH | `/api/system/settings/change-password` | Change Password | Staff JWT | `new_password1`, `new_password2`, `old_password` |
| GET | `/api/system/settings/business-slug` | System Settings | Staff JWT + `setting.manage` | &mdash; |
| GET | `/api/system/settings/` | System Settings | Staff JWT + `setting.manage` | &mdash; |
| PATCH | `/api/system/settings/edit` | System Settings Update | Staff JWT + `setting.manage` | `app_favicon`, `app_logo`, `app_logo_text`, `app_name` |
| GET | `/api/system/settings/seo-settings` | Seo Settings | Staff JWT + `setting.manage` | &mdash; |
| PATCH | `/api/system/settings/seo-settings/edit` | Seo Settings Edit | Staff JWT + `setting.manage` | `author`, `charset`, `description`, `keywords` |
| GET | `/api/system/settings/analytics-settings` | Google Analytics | Staff JWT + `setting.manage` | &mdash; |
| PATCH | `/api/system/settings/analytics-settings/edit` | Google Analytics Edit | Staff JWT + `setting.manage` | `global_site_tag` |
| GET | `/api/system/settings/facebook-meta-settings` | Facebook Meta | Staff JWT + `setting.manage` | &mdash; |
| PATCH | `/api/system/settings/facebook-meta-settings/edit` | Facebook Meta Edit | Staff JWT + `setting.manage` | `image` |
| GET | `/api/system/settings/social-settings` | Social Links | Staff JWT + `setting.manage` | &mdash; |
| PATCH | `/api/system/settings/social-settings/edit` | Social Links Edit | Staff JWT + `setting.manage` | `facebook`, `instagram`, `linkedin`, `twitter` |
| GET | `/api/system/settings/free-delivery` | Free Delivery | Staff JWT + `setting.manage` | &mdash; |
| PATCH | `/api/system/settings/free-delivery/edit` | Free Delivery Edit | Staff JWT + `setting.manage` | `amount` |
| GET | `/api/system/settings/why-choose-us` | Why Choose Us Get | Staff JWT + `setting.manage` | &mdash; |
| PATCH | `/api/system/settings/why-choose-us/edit/<int:w_id>` | Why Choose Us Edit | Staff JWT + `setting.manage` | `subtitle`, `title` |
| GET | `/api/system/settings/threshold-settings` | Threshold Settings | Staff JWT + `setting.manage` | &mdash; |
| PATCH | `/api/system/settings/threshold-settings/edit` | Threshold Settings Edit | Staff JWT + `setting.manage` | `expire_days`, `low_stock`, `minimum_order` |
| GET | `/api/system/settings/vat-settings` | Vat Settings | Staff JWT + `setting.manage` | &mdash; |
| PATCH | `/api/system/settings/vat-settings/edit` | Vat Settings Edit | Staff JWT + `setting.manage` | `inclusive`, `vat` |
| GET | `/api/system/settings/site-banner` | Site Banner Settings | Staff JWT + `setting.manage` | &mdash; |
| POST | `/api/system/settings/site-banner/upload` | Site Banner Upload | Staff JWT + `setting.manage` | `image` |
| DELETE | `/api/system/settings/site-banner/delete/<int:banner_id>` | Site Banner Delete | Staff JWT + `setting.manage` | &mdash; |
| GET | `/api/system/settings/sub-banner` | Sub Banner Settings | Staff JWT + `setting.manage` | &mdash; |
| POST | `/api/system/settings/sub-banner/upload` | Sub Banner Upload | Staff JWT + `setting.manage` | `image`, `redirect_url` |
| DELETE | `/api/system/settings/sub-banner/delete/<int:banner_id>` | Sub Banner Delete | Staff JWT | &mdash; |
| GET | `/api/system/settings/offer-status` | Get Offer Banner Status | Staff JWT | &mdash; |
| PATCH | `/api/system/settings/offer-status/edit` | Offer Banner Status | Staff JWT | `bmsm`, `super_sale` |
| GET | `/api/system/settings/shop-contact-info` | Get Shop Info | Staff JWT + `setting.manage` | &mdash; |
| PATCH | `/api/system/settings/shop-contact-info/edit` | Get Shop Info Edit | Staff JWT + `setting.manage` | `billing_address`, `email_address`, `phone_number`, `shipping_address` |
| GET | `/api/system/settings/offer-banner` | Get Offer Banner Settings | Staff JWT | &mdash; |
| POST | `/api/system/settings/offer-banner/upload` | Offer Banner Upload | Staff JWT | `image`, `offer_name` |
| DELETE | `/api/system/settings/offer-banner/delete/<int:banner_id>` | Offer Banner Delete | Staff JWT | &mdash; |
| GET | `/api/system/settings/offer-banner` | Get Offer Banner Settings | Staff JWT | &mdash; |
| POST | `/api/system/settings/offer-banner/upload` | Offer Banner Upload | Staff JWT | `image`, `offer_name` |
| DELETE | `/api/system/settings/offer-banner/delete/<int:banner_id>` | Offer Banner Delete | Staff JWT | &mdash; |

### Back Office &mdash; Products & Inventory

| Method | Path | Name | Auth | Body fields |
|---|---|---|---|---|
| GET | `/api/product/` | Product View | Staff JWT + `product.view` | &mdash; |
| GET | `/api/product/shorted` | Product View Shorted | Staff JWT + `product.view` | &mdash; |
| GET | `/api/product/all` | Product View All | Staff JWT + `product.view` | &mdash; |
| GET | `/api/product/all/parent-category-products/<slug:category_slug>` | Products By Parent Category All | Staff JWT + `product.view` | &mdash; |
| GET | `/api/product/all/category-products/<slug:category_slug>` | Products By Category All | Staff JWT + `product.view` | &mdash; |
| POST | `/api/product/create` | Product Create | Staff JWT + `product.create` | **required:** `name`, `sell_price`. All others optional — incl. `vendor`, `unit`, `brand`, `distributor`, `category`, `subcategory` |
| POST | `/api/product/create/single/token` | Product Create Token | Staff JWT | Same body/optionality as `/api/product/create` |
| PATCH | `/api/product/edit/<str:product_id>` | Product Edit | Staff JWT + `product.edit` | `as_committed`, `as_for_sale`, `as_on_hand`, `attributes`, `average_rating`, `bmsm`, `brand`, `cost_price`, +32 more |
| GET | `/api/product/details/<str:product_id>` | Product Details | Staff JWT + `product.view` | &mdash; |
| DELETE | `/api/product/delete/<str:product_id>` | Product Delete | Staff JWT + `product.edit` | &mdash; |
| DELETE | `/api/product/image/delete/<int:img_id>` | Product Image Delete | Staff JWT + `product.edit` | &mdash; |
| GET | `/api/product/info/<str:product_id>` | Product Info | Staff JWT + `product.view` | &mdash; |
| GET | `/api/product/featured/<str:product_id>` | Product Featured | Staff JWT + `product.edit` | &mdash; |
| GET | `/api/product/pre-order/<str:product_id>` | Product Pre Order | Staff JWT + `product.edit` | &mdash; |
| GET | `/api/product/hot-item/<str:product_id>` | Product Hot Item | Staff JWT + `product.edit` | &mdash; |
| GET | `/api/product/bmsm/<str:product_id>` | Product BMSM | Staff JWT + `product.edit` | &mdash; |
| GET | `/api/product/super-sale/<str:product_id>` | Product SS | Staff JWT + `product.edit` | &mdash; |
| GET | `/api/product/status/<str:product_id>` | Product Status Toggle | Staff JWT + `product.edit` | &mdash; |
| GET | `/api/product/stats` | Product Stats | Staff JWT + `product.view` | &mdash; |
| GET | `/api/product/search/<str:keyword>` | Product Search | Staff JWT + `product.view` | &mdash; |
| POST | `/api/product/adjust-stock/manual-entry` | Adjust Stock Manual Entry | Staff JWT + `product.edit` | `color`, `expiry_date`, `lot_total_cost`, `lot_unit_cost`, `product_id`, `quantity`, `received_on`, `reference`, `size` (`color`/`size` optional; at most one lot per product+color+size combination — a duplicate is rejected, use Adjust Stock to restock it instead) |
| POST | `/api/product/adjust-stock/<str:product_id>` | Adjust Stock | Staff JWT + `product.edit` | `adjustment_note`, `lot_number`, `quantity` |
| GET | `/api/product/stock-lot/list/<str:product_id>` | Stocklots By Pid | Staff JWT + `inventory.view` | &mdash; |
| GET | `/api/product/stock-lot/history/<str:product_id>` | Stocklot History By Pid | Staff JWT + `inventory.view` | &mdash; |
| GET | `/api/product/stock-lot/search/<str:keyword>` | Stock Lot Search | Staff JWT + `inventory.view` | &mdash; |
| GET | `/api/product/stock-lot/list` | Stock Lot List | Staff JWT + `inventory.view` | &mdash; |
| GET | `/api/product/bulk-import` | Importcsv | Staff JWT | &mdash; |
| POST | `/api/product/bulk-import/base64` | Import Csv Base64 | Staff JWT | `billing_address`, `company_name`, `contact_persons`, `email_address`, `file`, `first_name`, `last_name`, `phone_number`, +5 more |
| GET | `/api/product/unit` | Get Product Unit | Staff JWT + `unit.view` | &mdash; |
| POST | `/api/product/unit/create` | Create Product Unit | Staff JWT + `unit.create` | `name` |
| DELETE | `/api/product/unit/delete/<int:unit_id>` | Product Unit Delete | Staff JWT + `unit.edit` | &mdash; |
| GET | `/api/product/brand` | Get Product Brand | Staff JWT + `brand.view` | &mdash; |
| POST | `/api/product/brand/create` | Create Product Brand | Staff JWT + `brand.create` | `name` |
| DELETE | `/api/product/brand/delete/<int:brand_id>` | Product Brand Delete | Staff JWT + `brand.edit` | &mdash; |
| GET | `/api/product/distributor` | Get Product Distributor | Staff JWT + `product.view` | &mdash; |
| POST | `/api/product/distributor/create` | Create Product Distributor | Staff JWT + `product.create` | `name` |
| DELETE | `/api/product/distributor/delete/<int:distributor_id>` | Product Distirbutor Delete | Staff JWT + `product.edit` | &mdash; |
| GET | `/api/product/color/<str:product_id>` | Get Product Colors | Staff JWT + `product.view` | &mdash; (response items now include `remaining_stock`, the color's total stock summed across all sizes — see note below) |
| POST | `/api/product/color/create/<str:product_id>` | Create Product Color | Staff JWT + `product.edit` | `hex_code`, `image`, `name` |
| PATCH | `/api/product/color/edit/<int:color_id>` | Product Color Edit | Staff JWT + `product.edit` | Partial: any of `hex_code`, `image`, `name` |
| DELETE | `/api/product/color/delete/<int:color_id>` | Product Color Delete | Staff JWT + `product.edit` | &mdash; |
| GET | `/api/product/size/<str:product_id>` | Get Product Sizes | Staff JWT + `product.view` | &mdash; (response items now include `remaining_stock`, the size's total stock summed across all colors) |
| POST | `/api/product/size/create/<str:product_id>` | Create Product Size | Staff JWT + `product.edit` | `name` |
| PATCH | `/api/product/size/edit/<int:size_id>` | Product Size Edit | Staff JWT + `product.edit` | Partial: `name` |
| DELETE | `/api/product/size/delete/<int:size_id>` | Product Size Delete | Staff JWT + `product.edit` | &mdash; |
| POST | `/api/product/price-updater/<str:product_id>` | Price Updater | Staff JWT + `product.edit` | `cost_price`, `offer_price`, `on_sale`, `sell_price` |
| GET | `/api/product/low-stock` | Low Stock Products | Staff JWT + `inventory.view` | &mdash; |
| GET | `/api/product/expiring-soon` | Expiring Soon Products | Staff JWT + `inventory.view` | &mdash; |
| GET | `/api/product/expired` | Expired Products | Staff JWT + `inventory.view` | &mdash; |
| GET | `/api/product/category` | Get Category | Staff JWT + `category.view` | &mdash; |
| GET | `/api/product/category/sub` | Get Sub Category | Staff JWT + `category.view` | &mdash; |
| POST | `/api/product/category/new/token` | Category Create Token | Staff JWT | `description`, `featured`, `image`, `name`, `parent`, `product_count`, `slug`, `status` |
| POST | `/api/product/category/new` | Category Create | Staff JWT + `category.create` | `description`, `featured`, `image`, `name`, `parent`, `product_count`, `slug`, `status` |
| PATCH | `/api/product/category/edit/<slug:category_id>` | Category Edit | Staff JWT + `category.edit` | `description`, `featured`, `image`, `name`, `parent`, `product_count`, `slug`, `status` |
| DELETE | `/api/product/category/delete/<int:category_id>` | Category Delete | Staff JWT + `category.edit` | &mdash; |
| GET | `/api/product/category/featured/<int:category_id>` | Category Feature Toggle | Staff JWT + `category.edit` | &mdash; |
| GET | `/api/product/category/status/<int:category_id>` | Category Status Toggle | Staff JWT + `category.edit` | &mdash; |
| POST | `/api/product/category/by-parent` | Get Category By Parent | Staff JWT + `category.view` | `parent` |
| GET | `/api/product/category/tree` | Get Category Tree | Staff JWT + `category.view` | &mdash; |
| GET | `/api/product/parent-category-products/<slug:category_slug>` | Products By Parent Category Group | Staff JWT + `product.view` | &mdash; |
| GET | `/api/product/category-products/<slug:category_slug>` | Products By Category Group | Staff JWT + `product.view` | &mdash; |

**Color/size/stock flow — do you need Adjust Stock after adding a color or size? Yes, always.**
Creating a color/size (`color/create`, `size/create`) only adds the option to the product's
catalog — it never creates a stock lot. A color/size you just added shows `remaining_stock: 0`
until you call `POST /api/product/adjust-stock/manual-entry` with its id in `color`/`size`, which
is what actually creates the `ProductStockLot` behind it.

- **Creating a product with the full color/size/stock matrix known up front:** send `colors`,
  `sizes` and `stock` inline on `Product Create` — this creates the options *and* their stock in
  one request, equivalent to calling Adjust Stock Manual Entry once per `stock[]` entry.
- **Adding a color/size to an existing product:** `color/create` or `size/create` → then
  `adjust-stock/manual-entry` with that new id to actually stock it. Skipping the second call
  leaves the option listed with zero stock everywhere (`color`/`size` list, the stock-lot list,
  and `stock_variations` on the product detail).
- **Restocking a combination that already has a lot:** `adjust-stock/<product_id>` by
  `lot_number`, not another Manual Entry call (a duplicate `(color, size)` manual entry is
  rejected with `code: 400`).
- **Editing a color's/size's `name`/`hex_code`/`image`** via the new `edit` endpoints above never
  touches stock — the lot(s) already stocked against that color/size keep their quantity.
- **Where to read "quantity left":** `Get Product Colors`/`Get Product Sizes` now return a
  `remaining_stock` total per color/per size (summed across the other axis); for the exact
  quantity of one specific `(color, size)` pair, use `Stocklots By Pid` or `stock_variations` on
  the product detail (§5.1) instead.

### Back Office &mdash; Vendors

| Method | Path | Name | Auth | Body fields |
|---|---|---|---|---|
| GET | `/api/vendor/` | Vendors | Staff JWT | &mdash; |
| GET | `/api/vendor/shorted` | Vendors Shorted | Staff JWT | &mdash; |
| POST | `/api/vendor/new` | Vendors New | Staff JWT + `product.create` | `billing_address`, `company_name`, `contact_persons`, `email_address`, `first_name`, `last_name`, `phone_number`, `remarks`, +4 more |
| PATCH | `/api/vendor/edit/<str:vendor_id>` | Vendor Edit | Staff JWT + `product.edit` | `billing_address`, `company_name`, `contact_persons`, `email_address`, `first_name`, `last_name`, `phone_number`, `remarks`, +4 more |
| GET | `/api/vendor/status/<str:vendor_id>` | Vendor Status Update | Staff JWT + `product.edit` | &mdash; |
| DELETE | `/api/vendor/delete/<str:vendor_id>` | Vendor Delete | Staff JWT + `product.edit` | &mdash; |
| GET | `/api/vendor/details/<str:vendor_id>` | Vendor Details | Staff JWT + `product.view` | &mdash; |
| GET | `/api/vendor/details/shorted/<str:vendor_id>` | Vendor Shorted Details | Staff JWT + `product.view` | &mdash; |
| GET | `/api/vendor/overview` | Vendor Over View List | Staff JWT + `product.view` | &mdash; |
| GET | `/api/vendor/stats` | Vendor Stats | Staff JWT | &mdash; |

### Back Office &mdash; Shipping Methods

| Method | Path | Name | Auth | Body fields |
|---|---|---|---|---|
| GET | `/api/shipping/methods/` | Shipping View | Staff JWT + `setting.manage` | &mdash; |
| POST | `/api/shipping/methods/create` | Shipping Create | Staff JWT + `setting.manage` | `charge`, `name` |
| PATCH | `/api/shipping/methods/edit/<int:shipping_id>` | Shipping Edit | Staff JWT + `setting.manage` | `charge`, `name`, `status` |
| GET | `/api/shipping/methods/status/<int:shipping_id>` | Shipping Status Toggle | Staff JWT + `setting.manage` | &mdash; |
| DELETE | `/api/shipping/methods/delete/<int:shipping_id>` | Shipping Delete | Staff JWT + `setting.manage` | &mdash; |

### Back Office &mdash; Payment Methods

| Method | Path | Name | Auth | Body fields |
|---|---|---|---|---|
| GET | `/api/payment/methods/` | Payment Method View | Staff JWT + `payment.view` | &mdash; |
| POST | `/api/payment/methods/create` | Payment Method Create | Staff JWT + `payment.view` | &mdash; |
| PATCH | `/api/payment/methods/edit/<int:payment_id>` | Payment Method Edit | Staff JWT + `payment.view` | `account_number`, `charge`, `details`, `logo`, `name`, `status`, `test_mode` |
| GET | `/api/payment/methods/status/<int:payment_id>` | Payment Method Status Toggle | Staff JWT + `payment.view` | &mdash; |
| GET | `/api/payment/methods/test-mode/<int:payment_id>` | Payment Method Test Mode Toggle | Staff JWT + `payment.view` | &mdash; |
| DELETE | `/api/payment/methods/delete/<int:payment_id>` | Payment Method Delete | Staff JWT + `payment.view` | &mdash; |

### Back Office &mdash; Customers (CRM)

| Method | Path | Name | Auth | Body fields |
|---|---|---|---|---|
| GET | `/api/customers/` | Customers | Staff JWT | &mdash; |
| GET | `/api/customers/shorted` | Customers Shorted | Staff JWT | &mdash; |
| POST | `/api/customers/new` | Customers New | Staff JWT + `customer.create` | `billing_address`, `contact_persons`, `display_name`, `email_address`, `first_name`, `last_name`, `phone_number`, `remarks`, +2 more |
| GET | `/api/customers/info/<str:customer_id>` | Customer Info | Staff JWT + `customer.view` | &mdash; |
| POST | `/api/customers/add-address` | Customer Address Add | Staff JWT + `customer.edit` | `address`, `customer_id`, `type` |
| POST | `/api/customers/get-address` | Get Customer Address | Staff JWT + `customer.edit` | `customer_id`, `type` |
| GET | `/api/customers/details/<str:customer_id>` | Customer Details | Staff JWT + `customer.view` | &mdash; |
| GET | `/api/customers/details/shorted/<str:customer_id>` | Customer Shorted Details | Staff JWT + `customer.view` | &mdash; |
| PATCH | `/api/customers/edit/<str:customer_id>` | Customer Edit | Staff JWT + `customer.edit` | `billing_address`, `contact_persons`, `customer_id`, `display_name`, `email_address`, `first_name`, `last_name`, `phone_number`, +4 more |
| GET | `/api/customers/status/<str:customer_id>` | Customer Status Update | Staff JWT + `customer.edit` | &mdash; |
| DELETE | `/api/customers/delete/<str:customer_id>` | Customer Delete | Staff JWT + `customer.edit` | &mdash; |
| GET | `/api/customers/info-json` | Customer Info Json | Staff JWT + `customer.view` | &mdash; |
| GET | `/api/customers/overview-json` | Customer Over View List | Staff JWT + `customer.view` | &mdash; |
| GET | `/api/customers/stats` | Customer Stats | Staff JWT | &mdash; |

### Back Office &mdash; Sales Orders

| Method | Path | Name | Auth | Body fields |
|---|---|---|---|---|
| GET | `/api/sales-orders/` | Sales Order View | Staff JWT + `order.view` | &mdash; |
| GET | `/api/sales-orders/shorted` | Sales Order Shorted View | Staff JWT + `order.view` | &mdash; |
| GET | `/api/sales-orders/by-status/<str:order_status>` | Sales Order View By Status | Staff JWT + `order.view` | &mdash; |
| GET | `/api/sales-orders/by-agent/<str:agent_name>` | Get Sales Order By Shipping Agent | Staff JWT + `unit.view` | &mdash; |
| POST | `/api/sales-orders/create` | Sales Order Create | Staff JWT + `order.create` | `billing_address`, `customer_id`, `order_cart`, `order_data`, `order_note`, `order_tnc`, `reference`, `sales_person`, +3 more |
| POST | `/api/sales-orders/filter` | Sales Order Filter | Staff JWT + `order.view` | `sales_order_date`, `shipment_date` |
| GET | `/api/sales-orders/search/<str:keyword>` | Sales Order Search | Staff JWT + `order.view` | &mdash; |
| POST | `/api/sales-orders/by-salesperson` | Sales Orders By Sales Person | Staff JWT + `order.view` | `from_date`, `order_status`, `to_date` |
| POST | `/api/sales-orders/by-salesperson/<int:user_id>` | Sales Orders By Sales Person In Depth | Staff JWT + `order.view` | `from_date`, `order_status`, `to_date` |
| POST | `/api/sales-orders/filter/in-depth` | Sales Order Filter In Depth | Staff JWT + `order.view` | `from_date`, `order_status`, `to_date` |
| PATCH | `/api/sales-orders/edit/<str:so_id>` | Edit Sales Order | Staff JWT + `order.view` | `customer_id`, `order_cart`, `order_data`, `order_note`, `order_tnc`, `reference`, `sales_person`, `shipment_date`, +1 more |
| GET | `/api/sales-orders/details/<str:so_id>` | Sales Order Details | Staff JWT + `order.view` | &mdash; |
| DELETE | `/api/sales-orders/delete/<str:so_id>` | Sales Order Delete | Staff JWT + `order.view` | &mdash; |
| GET | `/api/sales-orders/stats` | Sales Order Stats | Staff JWT + `order.view` | &mdash; |
| GET | `/api/sales-orders/so-products/<str:so_id>` | Get Sales Order Products | Staff JWT + `order.view` | &mdash; |
| PATCH | `/api/sales-orders/update-status` | Update Sales Order Status | Staff JWT + `order.view` | `new_status`, `sales_order_id` |
| PATCH | `/api/sales-orders/update-status/invoice` | Update Invoice Status | Staff JWT + `order.view` | `invoice_id`, `new_status` |
| POST | `/api/sales-orders/generate-invoice` | Generate Invoice | Staff JWT + `invoice.view` | `due_date`, `invoice_date`, `reference`, `so_id` |
| GET | `/api/sales-orders/so-invoice/<str:so_id>` | Get Sales Order Invoice | Staff JWT + `invoice.view` | &mdash; |
| GET | `/api/sales-orders/invoice` | Invoice View | Staff JWT + `invoice.view` | &mdash; |
| POST | `/api/sales-orders/invoice/filter/in-depth` | Invoice Filter In Depth | Staff JWT + `invoice.view` | `from_date`, `order_status`, `to_date` |
| GET | `/api/sales-orders/invoice/search/<str:keyword>` | Invoice Search | Staff JWT + `invoice.view` | &mdash; |
| GET | `/api/sales-orders/invoice/shorted` | Invoice Shorted View | Staff JWT + `invoice.view` | &mdash; |
| GET | `/api/sales-orders/invoice/payment` | Invoice Payment List | Staff JWT + `invoice.view` | &mdash; |
| GET | `/api/sales-orders/invoice/status/<str:inv_status>` | Invoice View By Status | Staff JWT + `invoice.view` | &mdash; |
| GET | `/api/sales-orders/invoice/details/<str:invoice_id>` | Invoice Details | Staff JWT + `invoice.view` | &mdash; |
| DELETE | `/api/sales-orders/delete-invoice/<str:invoice_id>` | Delete Invoice | Staff JWT + `invoice.view` | &mdash; |
| POST | `/api/sales-orders/invoice/record-payment` | Record Invoice Payment | Staff JWT + `payment.view` | `invoice_id`, `paid_amount`, `payment_date`, `payment_mode`, `proof_image`, `reference`, `trx_id` |
| GET | `/api/sales-orders/so-receipts/<str:so_id>` | Get Sales Order Receipts | Staff JWT | &mdash; |
| GET | `/api/sales-orders/payments-received` | Payments Received View | Staff JWT + `payment.view` | &mdash; |
| POST | `/api/sales-orders/payments-received/filter/in-depth` | Payments Received Filter In Depth | Staff JWT + `payment.view` | `from_date`, `to_date` |
| GET | `/api/sales-orders/payments-received/search/<str:keyword>` | Invoice Payment Search | Staff JWT + `payment.view` | &mdash; |
| GET | `/api/sales-orders/payments-received/shorted` | Payments Received Shorted View | Staff JWT + `payment.view` | &mdash; |
| GET | `/api/sales-orders/invoice/invoice-payments/<str:invoice_id>` | Get Invoice Payments By ID | Staff JWT + `payment.view` | &mdash; |
| POST | `/api/sales-orders/create-so-package` | Create So Package | Staff JWT + `order.create` | `package_product`, `package_remarks`, `so_id` |
| DELETE | `/api/sales-orders/delete-so-package/<int:so_id>` | Delete So Package | Staff JWT + `order.view` | &mdash; |
| POST | `/api/sales-orders/mark-shipped` | Mark So Shipped | Staff JWT + `order.view` | `shipment_date`, `shipped_by`, `shipping_charge`, `so_id` |
| GET | `/api/sales-orders/mark-received/<str:so_id>` | Mark So Received | Staff JWT | &mdash; |
| GET | `/api/sales-orders/mark-completed/<str:so_id>` | Mark So Completed | Staff JWT + `order.view` | &mdash; |
| GET | `/api/sales-orders/mark-cancelled/<str:so_id>` | Mark So Cancelled | Staff JWT + `order.view` | &mdash; |
| GET | `/api/sales-orders/check-backorder` | Check Back Order | Staff JWT + `order.view` | &mdash; |
| GET | `/api/sales-orders/package/details/<str:package_id>` | Package Details | Staff JWT + `order.view` | &mdash; |
| GET | `/api/sales-orders/package/list` | Package List | Staff JWT + `order.view` | &mdash; |
| GET | `/api/sales-orders/cart-items` | Get Cart Items | Staff JWT + `order.view` | &mdash; |
| DELETE | `/api/sales-orders/cart-items/delete/<int:id>` | Remove From Cart | Staff JWT + `payment.view` | &mdash; |
| DELETE | `/api/sales-orders/cart-items/clear` | Clear Cart | Staff JWT + `payment.view` | &mdash; |
| PATCH | `/api/sales-orders/cart-items/add/<str:product_id>` | Add To Cart | Staff JWT + `order.view` | `price`, `quantity` |
| GET | `/api/sales-orders/shipping-agent` | Get Shipping Agent | Staff JWT + `unit.view` | &mdash; |
| POST | `/api/sales-orders/shipping-agent/create` | Create Shipping Agent | Staff JWT + `unit.create` | `name` |
| DELETE | `/api/sales-orders/shipping-agent/delete/<int:agent_id>` | Shipping Agent Delete | Staff JWT + `unit.edit` | &mdash; |
| GET | `/api/sales-orders/source-orders/<str:type>` | Get Source Order | Staff JWT | &mdash; |
| POST | `/api/sales-orders/source-order/create` | Create Source Order Entry | Staff JWT | `name`, `type`, `type_id` |
| POST | `/api/sales-orders/source-order/receive` | Mark Source Order Received | Staff JWT | `as_committed`, `as_for_sale`, `as_on_hand`, `attributes`, `average_rating`, `billing_address`, `bmsm`, `brand`, +44 more |
| GET | `/api/sales-orders/table` | Get Table | Staff JWT + `order.view` | &mdash; |
| POST | `/api/sales-orders/table/create` | Table Create | Staff JWT + `order.create` | `description`, `image`, `name`, `slug`, `so_id`, `status` |
| PATCH | `/api/sales-orders/table/edit/<int:table_id>` | Table Edit | Staff JWT + `order.create` | `description`, `image`, `name`, `slug`, `so_id`, `status` |
| DELETE | `/api/sales-orders/table/delete/<int:table_id>` | Table Delete | Staff JWT + `order.create` | &mdash; |
| POST | `/api/sales-orders/table/set-order` | Set Order | Staff JWT + `order.create` | `slug`, `so_id` |
| POST | `/api/sales-orders/table/clear-table` | Clear Order | Staff JWT + `order.create` | `so_id` |
| POST | `/api/sales-orders/table/change-table` | Change Table | Staff JWT + `order.create` | `so_id`, `table` |

### Back Office &mdash; Purchase Orders

| Method | Path | Name | Auth | Body fields |
|---|---|---|---|---|
| GET | `/api/purchase-orders/` | Purchase Order View | Staff JWT + `order.view` | &mdash; |
| GET | `/api/purchase-orders/shorted` | Purchase Order Shorted View | Staff JWT + `order.view` | &mdash; |
| POST | `/api/purchase-orders/create` | Purchase Order Create | Staff JWT + `order.create` | `backorder`, `order_cart`, `order_data`, `order_note`, `order_tnc`, `payment_type`, `po_date`, `product_list`, +5 more |
| POST | `/api/purchase-orders/filter` | Purchase Order Filter | Staff JWT + `order.view` | `purchase_order_date`, `shipment_date` |
| PATCH | `/api/purchase-orders/edit/<str:po_id>` | Edit Purchase Order | Staff JWT + `order.view` | `order_cart`, `order_data`, `order_note`, `order_tnc`, `payment_method`, `po_date`, `reference`, `shipment_date`, +2 more |
| GET | `/api/purchase-orders/search/<str:keyword>` | Purchase Order Search | Staff JWT + `order.view` | &mdash; |
| GET | `/api/purchase-orders/details/<str:po_id>` | View Purchase Order | Staff JWT + `order.view` | &mdash; |
| DELETE | `/api/purchase-orders/delete-po/<str:po_id>` | Delete PO | Staff JWT + `invoice.view` | &mdash; |
| GET | `/api/purchase-orders/po-products/<str:po_id>` | Get Purchase Order Products | Staff JWT + `order.view` | &mdash; |
| PATCH | `/api/purchase-orders/update-status` | Update Purchase Order Status | Staff JWT + `order.view` | `new_status`, `purchase_order_id` |
| POST | `/api/purchase-orders/convert-to-bill` | Convert Poto Bill | Staff JWT + `invoice.view` | `bill_date`, `due_date`, `po_id`, `reference` |
| GET | `/api/purchase-orders/po-bill/<str:po_id>` | Get Purchase Order Bill | Staff JWT + `order.view` | &mdash; |
| GET | `/api/purchase-orders/bills` | Bills View | Staff JWT + `invoice.view` | &mdash; |
| GET | `/api/purchase-orders/bills/payment` | Bills Payment List | Staff JWT + `invoice.view` | &mdash; |
| GET | `/api/purchase-orders/bills/status/<str:bill_status>` | Bills View By Status | Staff JWT + `invoice.view` | &mdash; |
| POST | `/api/purchase-orders/bills/create` | Bills Create | Staff JWT + `invoice.view` | `bill_date`, `po_list` |
| GET | `/api/purchase-orders/bills/details/<str:bill_id>` | Bill Details View | Staff JWT + `invoice.view` | &mdash; |
| GET | `/api/purchase-orders/bill/search/<str:keyword>` | Bill Search | Staff JWT + `invoice.view` | &mdash; |
| POST | `/api/purchase-orders/bills/record-payment` | Record Bill Payment | Staff JWT + `payment.view` | `bill_id`, `paid_amount`, `payment_date`, `payment_mode`, `proof_image`, `reference`, `trx_id` |
| GET | `/api/purchase-orders/bills/bill-attachments/<str:bill_id>` | Get Bill Attachments | Staff JWT + `payment.view` | &mdash; |
| GET | `/api/purchase-orders/bills/bill-payments/<str:bill_id>` | Get Bill Payments By ID | Staff JWT + `payment.view` | &mdash; |
| GET | `/api/purchase-orders/bills/pending-bills/<str:vendor_id>` | Get Pending Bills | Staff JWT + `payment.view` | &mdash; |
| DELETE | `/api/purchase-orders/bills/delete/<str:b_id>` | Delete Bill | Staff JWT + `payment.view` | &mdash; |
| DELETE | `/api/purchase-orders/bills/delete-from-po/<str:b_id>` | Delete Bill From PO | Staff JWT + `payment.view` | &mdash; |
| POST | `/api/purchase-orders/mark-received/<str:po_id>` | Mark Purchase Order Received | Staff JWT + `order.view` | `expiry_date`, `proof_image`, `received_on` |
| GET | `/api/purchase-orders/mark-cancelled/<str:po_id>` | Mark Purchase Order Cancelled | Staff JWT + `order.view` | &mdash; |
| DELETE | `/api/purchase-orders/delete-received/<str:po_id>` | Received PO Delete | Staff JWT + `order.view` | &mdash; |
| GET | `/api/purchase-orders/payments-made` | Payments Made View | Staff JWT + `payment.view` | &mdash; |
| GET | `/api/purchase-orders/po-receipts/<str:po_id>` | Get Purchase Order Receipts | Staff JWT + `order.view` | &mdash; |

### Back Office &mdash; Coupons

| Method | Path | Name | Auth | Body fields |
|---|---|---|---|---|
| GET | `/api/coupon/` | Coupon Code View | Staff JWT + `product.view` | &mdash; |
| POST | `/api/coupon/create` | Coupon Create | Staff JWT + `product.create` | `coupon_code`, `coupon_type`, `coupon_value`, `end_date`, `min_order`, `only_once`, `start_date`, `usage_limit` |
| PATCH | `/api/coupon/edit/<int:coupon_id>` | Coupon Edit | Staff JWT + `product.edit` | `coupon_type`, `coupon_value`, `end_date`, `min_order`, `only_once`, `start_date`, `usage_limit` |
| GET | `/api/coupon/status/<int:coupon_id>` | Coupon Status Toggle | Staff JWT + `product.edit` | &mdash; |
| DELETE | `/api/coupon/delete/<int:coupon_id>` | Coupon Delete | Staff JWT + `product.edit` | &mdash; |

### Back Office &mdash; Access Control (HR)

| Method | Path | Name | Auth | Body fields |
|---|---|---|---|---|
| GET | `/api/access-control/user-groups` | User Groups | Staff JWT | &mdash; |
| POST | `/api/access-control/user-groups/create` | User Group Create | Staff JWT | `name` |
| PATCH | `/api/access-control/user-groups/edit/<int:group_id>` | User Groups Edit | Staff JWT | `name` |
| DELETE | `/api/access-control/user-groups/delete/<int:group_id>` | User Groups Delete | Staff JWT | &mdash; |
| GET | `/api/access-control/user-accounts` | User Accounts | Staff JWT | &mdash; |
| POST | `/api/access-control/user-accounts/create` | User Account Create | Staff JWT | `additional_info`, `address`, `blood_group`, `date_of_birth`, `designation`, `email`, `first_name`, `joining_date`, +7 more |
| POST | `/api/access-control/user-accounts/employee/create` | Employee Account Create | Public | `additional_info`, `address`, `blood_group`, `date_of_birth`, `designation`, `email`, `first_name`, `joining_date`, +5 more |
| POST | `/api/access-control/user-accounts/employee/onboard` | Employee Account Onboard | Public | `additional_info`, `address`, `blood_group`, `date_of_birth`, `designation`, `email`, `first_name`, `joining_date`, +6 more |
| GET | `/api/access-control/user-accounts/employee-info/<str:user_id>` | Get User Info By ID | Staff JWT | &mdash; |
| PATCH | `/api/access-control/user-accounts/additional-info/edit` | My Employee Info Edit | Staff JWT | `address`, `blood_group`, `date_of_birth`, `designation`, `joining_date`, `personal_id_no`, `photo`, `user` |
| PATCH | `/api/access-control/user-accounts/additional-info/edit/<int:user_id>` | Employee Info Edit | Staff JWT | `address`, `blood_group`, `date_of_birth`, `designation`, `joining_date`, `personal_id_no`, `photo`, `user` |
| PATCH | `/api/access-control/user-accounts/edit/<int:user_id>` | User Accounts Edit | Staff JWT | `email`, `first_name`, `id`, `last_name`, `username` |
| POST | `/api/access-control/user-accounts/assign-group` | User Accounts Assign Group | Staff JWT | `user_group`, `user_id` |
| DELETE | `/api/access-control/user-accounts/delete/<int:user_id>` | User Account Delete | Staff JWT | &mdash; |
| GET | `/api/access-control/user-accounts/status-toggle/<int:user_id>` | User Status Toggle | Staff JWT | &mdash; |
| GET | `/api/access-control/user-accounts/punch` | Attendance Punch | Staff JWT | &mdash; |
| GET | `/api/access-control/user-accounts/time-sheet` | Get My Time Sheet | Staff JWT | &mdash; |
| GET | `/api/access-control/user-accounts/time-sheet/today` | Get My Time Sheet Today | Staff JWT | &mdash; |
| GET | `/api/access-control/user-accounts/time-sheet/summary` | Get All Time Sheet Summary | Staff JWT | &mdash; |
| GET | `/api/access-control/user-accounts/time-sheet/<int:user_id>` | Get Time Sheet By User ID | Staff JWT | &mdash; |
| GET | `/api/access-control/user-accounts/time-sheet/<int:user_id>/<str:date_entry>` | Get Time Sheet By User ID And Date | Staff JWT | &mdash; |
| GET | `/api/access-control/user-accounts/time-sheet/dates/<int:user_id>` | Get Time Sheet Dates By User ID | Staff JWT | &mdash; |
| GET | `/api/access-control/group-permissions/<str:group_id>` | Group Permission Listing | Staff JWT | &mdash; |
| GET | `/api/access-control/user-permissions` | User Permissions | Staff JWT | &mdash; |
| POST | `/api/access-control/user-permissions/toggle` | User Permissions Toggle | Staff JWT | `codename`, `group_name` |
| POST | `/api/access-control/user-permissions/bulk/toggle` | User Permissions Bulk Toggle | Staff JWT | `group`, `permissions` |
| GET | `/api/access-control/employee/stats` | Employee Stats | Staff JWT | &mdash; |
| POST | `/api/access-control/seed-permissions` | Seed Permissions | Public | &mdash; |

### Back Office &mdash; CMS

| Method | Path | Name | Auth | Body fields |
|---|---|---|---|---|
| GET | `/api/cms/aboutus/view` | About Us | Public | &mdash; |
| POST | `/api/cms/aboutus/create` | About Us Edit | Staff JWT | `about`, `mission`, `values` |
| GET | `/api/cms/impact` | Impact List | Public | &mdash; |
| GET | `/api/cms/impact/details/<int:pk>` | Impact Detail | Public | &mdash; |
| POST | `/api/cms/impact/create` | Impact Create Update | Staff JWT | `image`, `impact1`, `impact2`, `impact3`, `impact4`, `impact5` |
| DELETE | `/api/cms/impact/delete/<int:pk>` | Impact Delete | Staff JWT | &mdash; |
| POST | `/api/cms/seed/locations` | Seed Locations | Public | &mdash; |
| GET | `/api/cms/locations` | List Locations | Public | &mdash; |
| GET | `/api/cms/partner` | Partner List | Public | &mdash; |
| GET | `/api/cms/partner/details/<int:pk>` | Partner Detail | Public | &mdash; |
| POST | `/api/cms/partner/create` | Partner Create | Staff JWT | `logo` |
| PATCH | `/api/cms/partner/edit/<int:pk>` | Partner Edit | Staff JWT | `logo` |
| DELETE | `/api/cms/partner/delete/<int:pk>` | Partner Delete | Staff JWT | &mdash; |
| GET | `/api/cms/stories/list` | Story List | Public | &mdash; |
| GET | `/api/cms/stories/dashboard/count` | Story List Count | Staff JWT | &mdash; |
| POST | `/api/cms/stories/create` | Story Create | Staff JWT | `image`, `location`, `name`, `short_desc`, `slug`, `story` |
| GET | `/api/cms/stories/getdetail/<str:slug>` | Story Detail | Public | &mdash; |
| PATCH | `/api/cms/stories/update/<int:pk>` | Story Update | Staff JWT | `image`, `location`, `name`, `short_desc`, `slug`, `story` |
| DELETE | `/api/cms/stories/delete/<int:pk>` | Story Delete | Staff JWT | &mdash; |
| GET | `/api/cms/getinvolved` | Get Involved List | Staff JWT | &mdash; |
| GET | `/api/cms/getinvolved/details/<int:pk>` | Get Involved Detail | Staff JWT | &mdash; |
| POST | `/api/cms/getinvolved/create` | Get Involved Create | Public | `email` |
| PATCH | `/api/cms/getinvolved/update/<int:pk>` | Get Involved Update | Staff JWT | `email` |
| DELETE | `/api/cms/getinvolved/delete/<int:pk>` | Get Involved Delete | Staff JWT | &mdash; |

---

## 9. Using the Postman collection

The collection is organized into 18 folders in the order you'd actually run them — bootstrap/auth first, master data next, then purchase orders → sales orders, then the storefront flow (browsing → register/login → place order → account/reviews/wishlist/returns), then CMS and site settings, with a **Cleanup (Delete Checks)** folder last for the handful of `Delete` requests on shared master data (vendor/category/product/customer/shipping method/payment method/coupon) that earlier folders still depend on existing.

1. Import `Balanti_Backend.postman_collection.json` into Postman.
2. Set the collection variable `base_url` (top-level collection → Variables tab) to your API host — defaults to `http://127.0.0.1:8000`.
3. **Run the collection top-to-bottom (Runner, or folder-by-folder in order) against a freshly migrated database** and it now works end-to-end without manual edits — this is new: back-office requests were previously wired to the wrong token variable, and almost nothing auto-populated the ids the next request needed. Both are fixed:
   - **Back Office → Authentication → Token Obtain Pair** logs in as staff and captures `staff_access_token` / `staff_refresh_token` / `staff_user_id`. Every back-office request's Bearer auth correctly references `{{staff_access_token}}` now (previously they all pointed at `{{access_token}}`, the customer variable, so nothing would have authenticated).
   - **Storefront → Site API → Customer Registration** then **Customer Login** capture `access_token` / `refresh_token` (the *customer* token) — every storefront/reviews/wishlist/returns request's Bearer auth references `{{access_token}}`. These two now run early in the Site API folder, before the account/order endpoints that need the token.
   - Every `Create` request across the collection has a test script that captures the id/slug it just created into a matching collection variable (`vendor_id`, `category_id`, `category_slug`, `product_id`/`product_numeric_id`, `coupon_id`, `customer_id`, `shipping_id`, `payment_id`, `po_id`, `bill_id`, `so_id`, `invoice_id`, `group_id`, `user_id`, `impact_pk`, `partner_pk`, `story_pk`/`story_slug`, `getinvolved_pk`, `web_so_id`, `so_product_id`, `return_id`), and every request downstream that needs that resource already references `{{that_variable}}` — in its path variable, or inline in its JSON body for the ones that take the id as a field (e.g. Purchase/Sales Order create's `cart_items[].item_id`, status-update bodies, payment-recording bodies).
4. Running the whole collection this way currently gets you **305/347 green** on a single pass against a fresh database. The rest fall into two buckets, both expected:
   - Endpoints that correctly refuse to do something destructive — e.g. **Vendor Delete**/**Customer Delete** in the Cleanup folder are *supposed* to fail once real orders reference them (protected FK) — that's the database doing its job, not a bug.
   - Endpoints that need genuinely manual, request-specific data the collection can't fabricate on its own — an uploaded banner image, a real OTP code, a seeded POS table, a source-order `type` matching your data. Fill those in by hand when you get to them; they're independent leaves, not part of the chain.
5. Endpoints with path variables not covered by the auto-chaining above (`:keyword`, `:date_entry`, banner ids, etc.) come pre-filled with plausible example values — replace them with real values from your database before running.
6. Every write request body is a best-effort example generated from the actual field names each view reads. A few back-office bodies (product create/edit especially) list every possible field the serializer accepts, including ones you'd normally leave to defaults (`ps_on_hand`, etc.) — trim what you don't need; nothing in this API requires every field to be present unless the view's `is_valid()` check says otherwise (partial updates use `partial=True` and only touch what you send — see §7.1).

---

## 10. Where things live in the codebase (for backend follow-up questions)

If something in this doc doesn't match what you're seeing, the source of truth is the code, organized as:

- `siteapi/` — everything under `/api/site-api/`, the primary storefront surface.
- `reviews/`, `wishlist/`, `returns/` — new apps built for Balanti (not present in the original Neer codebase this backend was adapted from).
- `product/`, `salesorder/`, `customers/`, `coupon_code/`, `shippingmethod/`, `paymentmethod/`, `vendor/`, `purchaseorder/`, `access_control/`, `cms/`, `system_settings/`, `system_manager/`, `authentication/` — back-office apps, reused largely as-is from the source system.
- `system_settings/management/commands/seed_storefront.py` — seeds GST, free-delivery threshold, the Free Delivery shipping method, Cash on Delivery payment method, and the Men/Oxfords/Loafers categories. Run `python manage.py seed_storefront` against a fresh database before testing.

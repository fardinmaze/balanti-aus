export type Size = { value: string; inStock: boolean };

export type Gender = "men" | "women";

export type Style = "formal" | "casual" | "boots";

// Matches CategoryIconName (ShopByType icon rail) so those homepage links
// can filter the catalogue page precisely. Only assigned where we actually
// stock that silhouette — sandals/socks/laces/bags correctly match nothing.
export type ShopType = "boots" | "loafers" | "sneakers";

export type Product = {
  handle: string;
  name: string;
  material: string;
  colorway: string;
  price: number; // AUD
  badge?: "New" | "Best Seller";
  gender: Gender; // demo grouping only, see note below
  style: Style; // powers the "Shop by style" banners on the gender landing pages
  shopType?: ShopType; // powers the homepage "Shop by Type" catalogue filter
  targetCustomer: string;
  description: string;
  details: string[];
  sizes: Size[];
  tone: string; // placeholder-image tone (hex), until real photography lands
  image?: string; // stock reference photo — closest visual match, not actual product photography
};

const IN_STOCK_SIZES: Size[] = [
  { value: "UK 6", inStock: true },
  { value: "UK 7", inStock: true },
  { value: "UK 8", inStock: true },
  { value: "UK 9", inStock: true },
  { value: "UK 10", inStock: false },
  { value: "UK 11", inStock: true },
  { value: "UK 12", inStock: true },
];

/**
 * MVP data: hard-coded until the commerce backend (Shopify or otherwise —
 * see WORKPLAN.md Flag C) is chosen and wired up. Swap this module for a
 * typed Storefront API client behind the same shape.
 *
 * Only Oxford and Loafer are the client's confirmed hero SKUs (see
 * WORKPLAN.md). Every other style below is demo catalog filler added so
 * the homepage sliders/rails read like a real range instead of two lonely
 * cards — treat them as placeholders to replace or remove once real
 * product decisions are made, not as confirmed inventory. `gender` is a
 * demo grouping for the homepage tabs, not a claim about how the brand
 * will actually segment its range.
 */
export const products: Product[] = [
  {
    handle: "balanti-oxford",
    name: "Balanti Oxford",
    material: "Full-Grain Leather",
    colorway: "Espresso",
    price: 189,
    badge: "Best Seller",
    gender: "men",
    style: "formal",
    targetCustomer: "Professionals seeking formal business footwear.",
    description:
      "A closed-lace Oxford built for the office and everything after it. Full-grain leather upper, cushioned footbed, and a construction meant for daily wear rather than one meeting a week.",
    details: [
      "Full-grain leather upper",
      "Cushioned, all-day comfort footbed",
      "Leather lining, breathable",
      "Durable rubber-leather hybrid outsole",
      "Resoleable construction",
    ],
    sizes: IN_STOCK_SIZES,
    tone: "#3d2b1f",
    image: "/card-images/product-photos/pexels-collab-media-173741945-15059774.jpg",
  },
  {
    handle: "balanti-loafer",
    name: "Balanti Loafer",
    material: "Full-Grain Leather",
    colorway: "Cognac",
    price: 169,
    badge: "New",
    gender: "women",
    style: "formal",
    shopType: "loafers",
    targetCustomer: "Professionals seeking versatile smart-casual footwear.",
    description:
      "A slip-on loafer that moves between smart-casual and business without changing its mind. Full-grain leather, a low broken-in feel from day one, and a sole built for pavement, not just carpet.",
    details: [
      "Full-grain leather upper",
      "Slip-on, low break-in period",
      "Cushioned, all-day comfort footbed",
      "Durable rubber-leather hybrid outsole",
      "Resoleable construction",
    ],
    sizes: [
      { value: "UK 6", inStock: true },
      { value: "UK 7", inStock: true },
      { value: "UK 8", inStock: true },
      { value: "UK 9", inStock: false },
      { value: "UK 10", inStock: true },
      { value: "UK 11", inStock: true },
      { value: "UK 12", inStock: false },
    ],
    tone: "#8b5a2b",
    image: "/card-images/product-photos/pexels-elnur-memmednebiyev-125323681-9992899.jpg",
  },
  {
    handle: "balanti-derby",
    name: "Balanti Derby",
    material: "Full-Grain Leather",
    colorway: "Chestnut",
    price: 179,
    badge: "New",
    gender: "men",
    style: "casual",
    targetCustomer: "Professionals who want an open-lace alternative to the Oxford.",
    description:
      "An open-lace Derby with a slightly roomier fit than the Oxford — same full-grain leather and construction standard, easier on and off at the end of a long day.",
    details: [
      "Full-grain leather upper",
      "Open-lace, roomier instep",
      "Cushioned, all-day comfort footbed",
      "Durable rubber-leather hybrid outsole",
      "Resoleable construction",
    ],
    sizes: IN_STOCK_SIZES,
    tone: "#5a4130",
    image: "/card-images/product-photos/pexels-duncanoluwaseun-186035.jpg",
  },
  {
    handle: "balanti-monk-strap",
    name: "Balanti Monk Strap",
    material: "Full-Grain Leather",
    colorway: "Black",
    price: 195,
    gender: "men",
    style: "formal",
    targetCustomer: "Professionals who want a sharper alternative for formal occasions.",
    description:
      "A double monk strap for when the Oxford feels too plain and a full lace-up feels like too much. Full-grain leather, buckled not laced, built to the same daily-wear standard.",
    details: [
      "Full-grain leather upper",
      "Twin buckle closure",
      "Cushioned, all-day comfort footbed",
      "Durable rubber-leather hybrid outsole",
      "Resoleable construction",
    ],
    sizes: IN_STOCK_SIZES,
    tone: "#1f1c1a",
    // No unbranded monk-strap photo in the supplied image set — falls back
    // to the tone-swatch placeholder rather than forcing a bad match.
  },
  {
    handle: "balanti-chelsea-boot",
    name: "Balanti Chelsea Boot",
    material: "Suede",
    colorway: "Charcoal",
    price: 199,
    badge: "New",
    gender: "women",
    style: "boots",
    shopType: "boots",
    targetCustomer: "Professionals who want a boot that still works with a suit.",
    description:
      "An elastic-sided Chelsea boot in suede, low enough profile to sit under a trouser hem and cut clean enough for the office, not just the weekend.",
    details: [
      "Suede upper",
      "Elastic side panels, pull tab",
      "Cushioned, all-day comfort footbed",
      "Durable rubber-leather hybrid outsole",
      "Resoleable construction",
    ],
    sizes: IN_STOCK_SIZES,
    tone: "#4a4a4a",
    image: "/card-images/product-photos/pexels-arturoaez225-13823041.jpg",
  },
  {
    handle: "balanti-ballet-flat",
    name: "Balanti Ballet Flat",
    material: "Nubuck",
    colorway: "Camel",
    price: 159,
    gender: "women",
    style: "casual",
    targetCustomer: "Professionals who want a flat that still reads formal.",
    description:
      "A round-toe ballet flat in nubuck, built with the same full-day construction standard as the rest of the range rather than a soft-sided throwaway.",
    details: [
      "Nubuck upper",
      "Low-profile cushioned footbed",
      "Flexible rubber-leather hybrid outsole",
      "Resoleable construction",
    ],
    sizes: IN_STOCK_SIZES,
    tone: "#a67b4f",
    image: "/card-images/product-photos/pexels-angela-petrosyan-2149425377-31241090.jpg",
  },
  {
    handle: "balanti-wingtip-oxford",
    name: "Balanti Wingtip Oxford",
    material: "Full-Grain Leather",
    colorway: "Oxblood",
    price: 205,
    badge: "New",
    gender: "men",
    style: "formal",
    targetCustomer: "Professionals who want more detail than a plain-toe Oxford.",
    description:
      "The same daily-wear Oxford construction with a broguing detail across the toe cap — a little more character for the days a plain toe feels flat.",
    details: [
      "Full-grain leather upper",
      "Broguing detail, closed lace",
      "Cushioned, all-day comfort footbed",
      "Durable rubber-leather hybrid outsole",
      "Resoleable construction",
    ],
    sizes: IN_STOCK_SIZES,
    tone: "#5c1f1a",
    image: "/card-images/product-photos/pexels-star-photography-117690710-13611901.jpg",
  },
  {
    handle: "balanti-penny-loafer",
    name: "Balanti Penny Loafer",
    material: "Suede",
    colorway: "Navy",
    price: 175,
    badge: "New",
    gender: "women",
    style: "casual",
    shopType: "loafers",
    targetCustomer: "Professionals who want a softer alternative to the leather Loafer.",
    description:
      "A penny-strap loafer in suede — softer underfoot from the first wear, still built to the same all-day construction standard as the rest of the range.",
    details: [
      "Suede upper",
      "Penny strap detail",
      "Cushioned, all-day comfort footbed",
      "Durable rubber-leather hybrid outsole",
      "Resoleable construction",
    ],
    sizes: IN_STOCK_SIZES,
    tone: "#2b3a4a",
    image: "/card-images/product-photos/pexels-valentin-ivantsov-2154772556-36581188.jpg",
  },
  {
    handle: "balanti-ankle-boot",
    name: "Balanti Ankle Boot",
    material: "Full-Grain Leather",
    colorway: "Black",
    price: 209,
    badge: "New",
    gender: "women",
    style: "boots",
    shopType: "boots",
    targetCustomer: "Professionals who want a boot with a little more coverage than the Chelsea.",
    description:
      "A lace-up ankle boot, full-grain leather, built for the same desk-to-street day as the rest of the range — just with more coverage through the colder months.",
    details: [
      "Full-grain leather upper",
      "Lace-up, side zip for easy on/off",
      "Cushioned, all-day comfort footbed",
      "Durable rubber-leather hybrid outsole",
      "Resoleable construction",
    ],
    sizes: IN_STOCK_SIZES,
    tone: "#241f1c",
    image: "/card-images/product-photos/pexels-arturoaez225-13823041.jpg",
  },
  {
    handle: "balanti-slip-on-sneaker",
    name: "Balanti Slip-On Sneaker",
    material: "Nubuck",
    colorway: "Grey",
    price: 165,
    badge: "New",
    gender: "men",
    style: "casual",
    shopType: "sneakers",
    targetCustomer: "Professionals who want a casual pair for the days off from the office.",
    description:
      "A minimal slip-on sneaker in nubuck for the days that don't call for a lace-up — same leather-first material story, just off duty.",
    details: [
      "Nubuck upper",
      "Slip-on, elastic gussets",
      "Cushioned, all-day comfort footbed",
      "Flexible rubber-leather hybrid outsole",
      "Resoleable construction",
    ],
    sizes: IN_STOCK_SIZES,
    tone: "#6b6b6b",
    image: "/card-images/product-photos/pexels-kampus-7857501.jpg",
  },
  {
    handle: "balanti-cap-toe-oxford",
    name: "Balanti Cap-Toe Oxford",
    material: "Full-Grain Leather",
    colorway: "Black",
    price: 199,
    badge: "New",
    gender: "men",
    style: "formal",
    targetCustomer: "Professionals who want a sharper, more formal Oxford for the boardroom.",
    description:
      "A straight cap-toe Oxford in black full-grain leather — the most formal shoe in the range, built for board meetings and courtrooms but comfortable enough for the walk there.",
    details: [
      "Full-grain leather upper",
      "Straight cap-toe, closed lace",
      "Cushioned, all-day comfort footbed",
      "Durable rubber-leather hybrid outsole",
      "Resoleable construction",
    ],
    sizes: IN_STOCK_SIZES,
    tone: "#221f1d",
  },
  {
    handle: "balanti-block-heel-pump",
    name: "Balanti Block Heel Pump",
    material: "Full-Grain Leather",
    colorway: "Cognac",
    price: 185,
    badge: "New",
    gender: "women",
    style: "formal",
    targetCustomer: "Professionals who want a low block heel that still holds up to a full workday.",
    description:
      "A round-toe pump on a low block heel — enough lift for the office, stable enough for the commute. Full-grain leather, built to the same daily-wear standard as the rest of the range.",
    details: [
      "Full-grain leather upper",
      "Low block heel (35mm)",
      "Cushioned, all-day comfort footbed",
      "Durable rubber-leather hybrid outsole",
      "Resoleable construction",
    ],
    sizes: [
      { value: "UK 6", inStock: true },
      { value: "UK 7", inStock: true },
      { value: "UK 8", inStock: true },
      { value: "UK 9", inStock: true },
      { value: "UK 10", inStock: false },
      { value: "UK 11", inStock: true },
      { value: "UK 12", inStock: true },
    ],
    tone: "#7a4a26",
  },
];

export function getProduct(handle: string): Product | undefined {
  return products.find((p) => p.handle === handle);
}

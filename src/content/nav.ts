export type MegaMenuColumn = {
  heading: string;
  links: { label: string; href: string }[];
};

export type MegaMenuNavItem = {
  label: string;
  href: string;
  columns: MegaMenuColumn[];
};

/**
 * Column data for the hover accordion under Men/Women/Kids/Accessories
 * (see Inspiration/Top Navbar Accordion.png). "Shoes" links go straight to
 * the product page for precision. "Featured" anchors point into the
 * sections on that gender's landing page (GenderLanding.vue). "Shop By
 * Style" and "Accessories" links go to the universal catalogue page
 * (CatalogueView.vue) pre-filtered via query params so the relevant
 * checkbox/chip is already applied on arrival. Kids/Accessories have no
 * real inventory yet, so those routes correctly land on an honest empty
 * state rather than faking a full range.
 */
export const megaMenuNav: MegaMenuNavItem[] = [
  {
    label: "Men",
    href: "/category/men",
    columns: [
      {
        heading: "Featured",
        links: [
          { label: "Shop All Men's", href: "/category/men" },
          { label: "Most Popular", href: "/category/men#most-popular" },
          { label: "New Arrivals", href: "/category/men#new-arrivals" },
        ],
      },
      {
        heading: "Shoes",
        links: [
          { label: "Oxfords", href: "/products/balanti-oxford" },
          { label: "Wingtip Oxfords", href: "/products/balanti-wingtip-oxford" },
          { label: "Cap-Toe Oxfords", href: "/products/balanti-cap-toe-oxford" },
          { label: "Derby Shoes", href: "/products/balanti-derby" },
          { label: "Monk Straps", href: "/products/balanti-monk-strap" },
          { label: "Slip-On Sneakers", href: "/products/balanti-slip-on-sneaker" },
        ],
      },
      {
        heading: "Shop By Style",
        links: [
          { label: "Formal", href: "/catalogue?gender=men&style=formal" },
          { label: "Casual", href: "/catalogue?gender=men&style=casual" },
        ],
      },
      {
        heading: "Accessories",
        links: [
          { label: "Socks", href: "/catalogue?type=socks" },
          { label: "Shoe Laces", href: "/catalogue?type=laces" },
          { label: "Men's Bags", href: "/catalogue?type=mens-bag" },
        ],
      },
    ],
  },
  {
    label: "Women",
    href: "/category/women",
    columns: [
      {
        heading: "Featured",
        links: [
          { label: "Shop All Women's", href: "/category/women" },
          { label: "Most Popular", href: "/category/women#most-popular" },
          { label: "New Arrivals", href: "/category/women#new-arrivals" },
        ],
      },
      {
        heading: "Shoes",
        links: [
          { label: "Loafers", href: "/products/balanti-loafer" },
          { label: "Penny Loafers", href: "/products/balanti-penny-loafer" },
          { label: "Block Heel Pumps", href: "/products/balanti-block-heel-pump" },
          { label: "Chelsea Boots", href: "/products/balanti-chelsea-boot" },
          { label: "Ankle Boots", href: "/products/balanti-ankle-boot" },
          { label: "Ballet Flats", href: "/products/balanti-ballet-flat" },
        ],
      },
      {
        heading: "Shop By Style",
        links: [
          { label: "Formal", href: "/catalogue?gender=women&style=formal" },
          { label: "Casual", href: "/catalogue?gender=women&style=casual" },
          { label: "Boots", href: "/catalogue?gender=women&style=boots" },
        ],
      },
      {
        heading: "Accessories",
        links: [
          { label: "Socks", href: "/catalogue?type=socks" },
          { label: "Shoe Laces", href: "/catalogue?type=laces" },
          { label: "Women's Handbags", href: "/catalogue?type=womens-handbag" },
        ],
      },
    ],
  },
  {
    label: "Kids",
    href: "/category/kids",
    columns: [
      {
        heading: "Kids",
        links: [
          { label: "Shop All Kids'", href: "/catalogue?type=kids" },
          { label: "Kids Socks", href: "/catalogue?type=socks" },
        ],
      },
    ],
  },
  {
    label: "Accessories",
    href: "/catalogue?type=accessories",
    columns: [
      {
        heading: "Accessories",
        links: [
          { label: "Socks", href: "/catalogue?type=socks" },
          { label: "Shoe Laces", href: "/catalogue?type=laces" },
          { label: "Men's Bags", href: "/catalogue?type=mens-bag" },
          { label: "Women's Handbags", href: "/catalogue?type=womens-handbag" },
          { label: "Sandals", href: "/catalogue?type=sandals" },
        ],
      },
    ],
  },
];

export const footerLinks = {
  help: [
    { label: "Shipping", href: "/support#shipping" },
    { label: "Returns", href: "/support#returns" },
    { label: "Size Guide", href: "/support#size-guide" },
    { label: "FAQ", href: "/support#faq" },
    { label: "Contact", href: "/support#contact" },
  ],
  shop: [
    { label: "Balanti Oxford", href: "/products/balanti-oxford" },
    { label: "Balanti Loafer", href: "/products/balanti-loafer" },
  ],
  about: [{ label: "Our Story", href: "/about" }],
} as const;

export const utilityMessage =
  "Free shipping over $150 · Free returns within 30 days — Australia-wide";

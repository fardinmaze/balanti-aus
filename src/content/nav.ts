export const categoryNav = [
  { label: "Men", href: "/category/men" },
  { label: "Women", href: "/category/women" },
  { label: "Kids", href: "/category/kids" },
  { label: "Accessories", href: "/category/accessories" },
] as const;

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

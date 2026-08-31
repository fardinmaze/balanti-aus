export type MegaMenuColumn = {
  heading: string;
  links: { label: string; href: string }[];
};

export const footerLinks = {
  help: [
    { label: "Size Guide", href: "/support#size-guide" },
    { label: "FAQ", href: "/support#faq" },
    { label: "Policies", href: "/support#policies" },
    { label: "Our Story", href: "/about" },
    { label: "Contact", href: "/support#contact" },
  ]
} as const;

/** Static half of the utility bar/footer message — the free-shipping half comes from useFreeShippingLine() since it depends on GET /site-api/free-delivery. */
export const freeReturnsMessage = "— Australia-wide";

/**
 * Structured version of FAQ.docx (project root) for the Support page's FAQ.
 * Sections and questions follow the source document's order; wording is
 * lightly copy-edited for grammar only. Update both together if the FAQ
 * text changes.
 */

const SUPPORT_EMAIL = "info@balanti.com.au";

export type Faq = { q: string; a: string[] };

export type FaqSection = { id: string; title: string; faqs: Faq[] };

export const faqSections: FaqSection[] = [
  {
    id: "faq-ordering",
    title: "Ordering & Payment",
    faqs: [
      {
        q: "How do I pay for my order?",
        a: [
          "Balanti currently do NOT accepts Cash on Delivery (COD). Only accepted payment getaway policy (Online purchase). Payment methods (like credit/debit cards and digital wallets) is available and which is fully secured.",
        ],
      },
      {
        q: "Can I change or cancel my order after it has been placed?",
        a: [
          `If you need to change or cancel your order, please email us immediately at ${SUPPORT_EMAIL}. While we will do our best to assist, once an order has been packed or handed to the courier, we cannot change its contents or delivery address. You can use our returns process once the order arrives.`,
        ],
      },
      {
        q: "Can I place an order without creating an account?",
        a: [
          "Yes! You can choose guest checkout to place an order quickly without setting up an account. You will just need to provide your name, contact details and delivery address.",
        ],
      },
      {
        q: "What happens if an item I ordered is out of stock?",
        a: [
          "Stock levels on our site are indicative. If an item sells out between your order and our pick-and-pack process, we will contact you immediately to offer an alternative, supply it when available as a back order (terms as per your email confirmation), or issue a refund for that item.",
        ],
      },
    ],
  },
  {
    id: "faq-delivery",
    title: "Delivery & Tracking",
    faqs: [
      {
        q: "Where does Balanti deliver and do you ship to PO Boxes?",
        a: [
          "We currently deliver within Australia only. We do not deliver to PO Boxes or parcel lockers, as someone must be present to receive the parcel.",
        ],
      },
      {
        q: "How much does delivery cost?",
        a: [
          "Delivery is AUD $15 Australia-wide for parcels under 500 g. For orders under AUD $200, the exact delivery charge is calculated and displayed at checkout before you confirm your purchase.",
        ],
      },
      {
        q: "How long will it take for my shoes to arrive?",
        a: [
          "Orders are picked and packed within 1–2 business days.",
          "Metropolitan areas: approximately 2–5 business days from dispatch.",
          "Regional and remote areas: approximately 5–10 business days from dispatch, and this can vary due to weather or unforeseen circumstances.",
        ],
      },
      {
        q: "What happens if I am not home to receive my delivery?",
        a: [
          "Someone must be present at the delivery address to accept the parcel. If nobody is available, the courier will leave a card with instructions for redelivery or collection from a nearby depot within a set number of days. Uncollected parcels returned to us may incur a redelivery charge.",
        ],
      },
      {
        q: "How do I track my order?",
        a: [
          "Once your order leaves our warehouse, you will receive a dispatch email containing your tracking details and link. Registered customers can also view their order status and history directly within their Balanti account, with tracking provided through Australia Post.",
        ],
      },
    ],
  },
  {
    id: "faq-returns",
    title: "Returns & Exchanges",
    faqs: [
      {
        q: "What is Balanti's returns policy?",
        a: [
          "We offer a 30-day change-of-mind window from the date you receive your order. Items must be unworn, in their original condition with all tags attached, and in their original, undamaged shoe box (placed inside an outer carton or satchel — please do not tape the shoe box directly).",
        ],
      },
      {
        q: "How do I lodge a return?",
        a: [
          `Log in to your Balanti account, open the relevant order, and select the items you wish to return. If you checked out as a guest, please email ${SUPPORT_EMAIL} with your order number. Once approved, you will receive instructions and the return address.`,
        ],
      },
      {
        q: "Can I exchange an item for a different size or colour?",
        a: [
          "We do not process direct postal exchanges. The fastest way to secure your preferred size or colour is to place a new order for the desired item and lodge a return for your original purchase.",
        ],
      },
      {
        q: "Who pays for return postage?",
        a: [
          "For change-of-mind returns, return postage is at your cost, and original delivery fees are non-refundable. For faulty, damaged or incorrect items, Balanti covers the return postage cost and refunds your original delivery fee.",
        ],
      },
      {
        q: "How long do refunds take to process?",
        a: [
          "Once your return is inspected and approved (within 2 business days of receipt), we will process your refund. We will request your Australian bank details (account name, BSB and account number) to make an electronic bank transfer, which typically takes 3–7 business days to appear.",
        ],
      },
    ],
  },
  {
    id: "faq-account",
    title: "Account, Privacy & Security",
    faqs: [
      {
        q: "How do I update my account details or reset my password?",
        a: [
          "You can view and update your name, contact information and saved delivery addresses at any time by logging in to your Balanti account.",
        ],
      },
      {
        q: "Is my personal information secure with Balanti?",
        a: [
          "Yes. We take privacy seriously and handle data in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles. We use encrypted connections (HTTPS), hashed password storage and strict role-based access controls to protect your information. We never sell your personal data.",
        ],
      },
      {
        q: "What are cookies and can I turn them off?",
        a: [
          "Cookies are small text files stored on your device to help our website remember your preferences and keep items in your cart. You can manage non-essential cookies via our cookie banner on your first visit or through the cookie settings link in our site footer. Please note that blocking strictly necessary cookies may prevent you from logging in or completing checkout.",
        ],
      },
    ],
  },
  {
    id: "faq-cleaning",
    title: "Shoe Care: Cleaning & Maintenance",
    faqs: [
      {
        q: "How often should I clean my leather shoes?",
        a: [
          "With regular wear, give them a quick wipe-down with a dry cloth once a week to remove dust. Apply a quality wax polish or cream every two to three weeks to nourish the leather and maintain its shine, and do a deep clean every couple of months.",
        ],
      },
      {
        q: "What should I use to clean leather shoes at home?",
        a: [
          "Use a soft-bristled horsehair brush to remove surface dirt, and a damp cloth with a mild leather cleaner or saddle soap for stubborn marks. Avoid harsh household cleaners, as they strip natural oils and crack the leather.",
        ],
      },
    ],
  },
  {
    id: "faq-water",
    title: "Shoe Care: Water & Drying",
    faqs: [
      {
        q: "What should I do if my leather shoes get wet?",
        a: [
          "Pat them dry gently with a soft cloth and stuff them with newspaper or insert wooden shoe trees to draw out interior moisture. Let them air dry slowly at room temperature.",
        ],
      },
      {
        q: "Can I use a hairdryer or heater to dry my shoes quickly?",
        a: [
          "No. Direct heat sources like radiators, hairdryers or direct sunlight cause the leather to become brittle, shrink and crack.",
        ],
      },
    ],
  },
  {
    id: "faq-fit",
    title: "Shoe Care: Fit & Break-In",
    faqs: [
      {
        q: "Why are my new leather shoes giving me blisters or hot spots?",
        a: [
          "New leather is stiff and needs a break-in period as it moulds to your feet. Wear them for short intervals at first rather than a full day straight, and use blister plasters on vulnerable spots.",
        ],
      },
      {
        q: "Can tight leather shoes be stretched?",
        a: [
          "Yes. A professional cobbler (shoemaker) can use a specialised stretching machine and softening liquids to safely increase both the length and width of leather footwear.",
        ],
      },
    ],
  },
  {
    id: "faq-storage",
    title: "Shoe Care: Storage & Longevity",
    faqs: [
      {
        q: "How should I store my leather shoes when not in use?",
        a: [
          "Keep them in a cool, dry place away from direct sunlight. Insert cedar or untreated wooden shoe trees to absorb residual moisture and preserve their shape. Storing them in breathable cotton dust bags protects them from dust.",
        ],
      },
      {
        q: "How long should I wait between wears?",
        a: [
          "Fine leather shoes need about 24 hours to dry out completely from natural foot perspiration. Rotating between two or more pairs significantly extends their overall lifespan.",
        ],
      },
    ],
  },
  {
    id: "faq-repair",
    title: "Shoe Care: Repair",
    faqs: [
      {
        q: "How do I know when it's time to resole my leather shoes?",
        a: [
          "Check the soles regularly for thin spots, soft patches near the ball of your foot, or visible holes. If the stitching on the sole begins to fray or the shoes start letting in moisture on dry days, take them to a cobbler straight away.",
        ],
      },
      {
        q: "Can cracked leather be repaired?",
        a: [
          "Fine surface cracks can be minimised using deep-conditioning leather salves or specialised filler creams. However, deep or structural cracks that split completely through the leather cannot be fully reversed, which is why routine conditioning is vital.",
        ],
      },
      {
        q: "What is the difference between shoe cream and shoe wax?",
        a: [
          "Shoe cream contains high amounts of pigment and oils designed to soak deep into the leather, restore faded colours and rehydrate the material. Shoe wax sits on top of the surface, providing a high-gloss shine and a protective barrier against water and scuffs.",
        ],
      },
      {
        q: "How do I fix a deep scuff or scratch on my shoe?",
        a: [
          "Clean the area thoroughly, then apply a matching coloured shoe cream directly into the scratch to restore the pigment. For deep gouges, a professional cobbler can use leather filler, sand the area smooth and re-dye the leather.",
        ],
      },
      {
        q: "How can I protect the leather soles from wearing out too fast?",
        a: [
          "Ask a cobbler to fit thin, protective rubber sole guards (often called Topy or Vibram soles) over the leather. This layer protects the original leather from friction and moisture, and can be cheaply replaced when it wears down.",
        ],
      },
      {
        q: "My shoes squeak when I walk. How do I fix it?",
        a: [
          "Squeaking is usually caused by friction between the insole and the midsole. Lift the removable insole (if possible) and sprinkle a small amount of baby powder or baking soda inside the shoe to reduce the rubbing.",
        ],
      },
    ],
  },
];

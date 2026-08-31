/**
 * Structured version of BALANTI_POLICIES.txt (project root) for the Support
 * page. Wording is the source document's, reorganised into headings /
 * paragraphs / lists for rendering. [SUPPORT EMAIL] has been substituted
 * with the real contact address already used elsewhere on the site; every
 * other bracketed placeholder ([LEGAL ENTITY NAME], [ABN], [REGISTERED
 * ADDRESS], [PHONE NUMBER], [BUSINESS HOURS], [STATE]) is left as-is on
 * purpose — see BALANTI_POLICIES.txt §9 "Items to fill in before publishing".
 * Update both files together if the policy text changes.
 */

const SUPPORT_EMAIL = "hello@balanti.com.au";

export type PolicyBlock = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
};

export type Policy = {
  id: string;
  title: string;
  summary: string;
  blocks: PolicyBlock[];
};

export const policiesLastUpdated = "27 August 2026";

export const policies: Policy[] = [
  {
    id: "privacy",
    title: "Privacy Policy",
    summary: "What we collect, how we use it, and your rights under the Australian Privacy Principles.",
    blocks: [
      {
        heading: "About this policy",
        paragraphs: [
          `Balanti ("Balanti", "we", "us", "our") respects your privacy. This policy explains what personal information we collect when you use our website, place an order or contact us, how we use it, who we share it with, and the choices and rights you have.`,
          "We handle personal information in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).",
          "By using our website or placing an order, you agree to the handling of your personal information as described in this policy.",
        ],
      },
      {
        heading: "What we collect",
        paragraphs: ["Information you give us:"],
        list: [
          "Name (first name, last name, display name)",
          "Email address",
          "Phone number",
          "Billing address and shipping address (you may save multiple addresses and mark one as your default)",
          "Account login details (username and an encrypted password — we never store your password in readable form)",
          "Order details: items ordered, quantities, prices, GST, delivery method, payment method, order notes and delivery notes",
          "Product reviews and ratings you submit, and the items you save to your wishlist",
          "Return requests, including the reason you give for the return",
          "Messages you send us through our contact form, by email or by phone",
        ],
      },
      {
        heading: "Information we collect automatically",
        list: [
          "IP address, browser type, device type and operating system",
          "Pages viewed, products viewed, time and date of your visit, and the site you arrived from",
          "Cookie and similar identifiers (see the Cookie Policy)",
        ],
      },
      {
        heading: "Guest checkout",
        paragraphs: [
          "You can order without creating an account. We still need your name, contact details and delivery address to fulfil and deliver the order, and we retain those order records as described in \"How long we keep it\" below.",
        ],
      },
      {
        heading: "Payment information",
        paragraphs: [
          "Our current payment method is Cash on Delivery, so we do not collect or store card numbers. If we introduce online card payments in future, card details will be captured and processed by our payment provider — Balanti will receive only a confirmation of the payment and a masked reference, never your full card number.",
        ],
      },
      {
        heading: "Sensitive information",
        paragraphs: [
          "We do not collect sensitive information (such as health, racial, political or religious information) and we ask that you do not send it to us.",
        ],
      },
      {
        heading: "How we use your information",
        list: [
          "Create and manage your account",
          "Process, pack, deliver and invoice your orders",
          "Calculate GST, delivery charges and any coupon discount applied",
          "Confirm your identity and delivery details when our courier or driver contacts you",
          "Handle returns, refunds and warranty or faulty-goods claims",
          "Publish product reviews you submit, and mark them as a verified purchase where our records show you bought the item",
          "Respond to your enquiries and provide customer support",
          "Detect, prevent and investigate fraud, abuse of coupon codes, and misuse of the site",
          "Understand how the site is used so we can improve it",
          "Send you marketing about Balanti products and offers, where you have opted in or where the law otherwise permits it (you can opt out at any time)",
          "Meet our legal, tax and accounting obligations",
        ],
      },
      {
        heading: "Selling your data",
        paragraphs: ["We do not sell your personal information."],
      },
      {
        heading: "Who we share it with",
        paragraphs: ["We disclose personal information only as needed, to:"],
        list: [
          "Delivery and logistics partners, so your order can be delivered and, for Cash on Delivery orders, so payment can be collected on delivery",
          "IT, hosting, database and email service providers who operate our systems on our behalf",
          "Analytics and error-monitoring providers",
          "Payment providers, if and when online payment is enabled",
          "Professional advisers such as accountants, auditors and lawyers",
          "Government agencies, regulators, courts or law enforcement where we are required or authorised by law",
          "A purchaser or prospective purchaser, if Balanti or part of our business is sold or restructured",
        ],
      },
      {
        heading: "Overseas disclosure",
        paragraphs: [
          "Some of our service providers — for example website hosting, email delivery, analytics and error monitoring — store or process data on servers outside Australia, including in the United States and the European Union. Before disclosing personal information overseas we take reasonable steps to ensure the recipient handles it in a way consistent with the Australian Privacy Principles.",
        ],
      },
      {
        heading: "Marketing and opt-out",
        paragraphs: [
          `If you subscribe to Balanti emails or opt in during checkout, we may send you product news, new releases and offers. Every marketing email contains an unsubscribe link. You can also opt out at any time by emailing ${SUPPORT_EMAIL}. Opting out of marketing does not stop transactional messages such as order confirmations, delivery updates and return notifications, which we need to send to complete your order.`,
        ],
      },
      {
        heading: "How long we keep it",
        list: [
          "Account records: for as long as your account is active, and then for a reasonable period after it is closed",
          "Order, invoice and payment records: at least 7 years, to meet Australian tax and record-keeping requirements",
          "Return and refund records: at least 7 years, for the same reason",
          "Reviews: until you or we remove them",
          "Marketing lists: until you unsubscribe",
          "Web analytics and log data: generally no more than 26 months",
        ],
      },
      {
        heading: "Security",
        paragraphs: [
          "We take reasonable steps to protect your personal information from misuse, interference, loss and unauthorised access, modification or disclosure. These include encrypted connections (HTTPS) to our website, hashed password storage, token-based authentication, role- and permission-based access controls limiting which staff can see customer data, and activity logging of administrative actions.",
          "No method of transmission or storage is completely secure. If a data breach occurs that is likely to result in serious harm, we will notify affected individuals and the Office of the Australian Information Commissioner (OAIC) as required by the Notifiable Data Breaches scheme.",
        ],
      },
      {
        heading: "Accessing and correcting your information",
        paragraphs: [
          "You can view and update most of your details — name, contact details and saved addresses — by logging in to your Balanti account.",
          "You may also ask us to:",
        ],
        list: [
          "Give you access to the personal information we hold about you",
          "Correct information that is inaccurate, out of date or incomplete",
          "Delete your account and associated personal information, subject to records we are legally required to keep (such as tax invoices)",
        ],
      },
      {
        heading: "Complaints",
        paragraphs: [
          `If you believe we have mishandled your personal information, contact our Privacy Officer in writing at ${SUPPORT_EMAIL} or at [REGISTERED ADDRESS]. We will acknowledge your complaint and respond within 30 days.`,
          "If you are not satisfied with our response, you can contact the Office of the Australian Information Commissioner at www.oaic.gov.au or on 1300 363 992.",
        ],
      },
      {
        heading: "Changes to this policy",
        paragraphs: [
          `We may update this policy from time to time. The current version is always available on our website, with the "last updated" date at the top. Material changes will be notified on the website or by email.`,
        ],
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookie Policy",
    summary: "The categories of cookies we use, why, and how to manage your choices.",
    blocks: [
      {
        heading: "What cookies are",
        paragraphs: [
          "Cookies are small text files placed on your device when you visit a website. They let the site remember your actions and preferences between pages and visits. We also use similar technologies such as local storage and pixels. This policy covers all of them.",
          "We never store payment card details or passwords in cookies.",
        ],
      },
      {
        heading: "The cookies we use",
        list: [
          "Strictly necessary — required for the site to work. They keep you logged in, hold your authentication token, remember the contents of your cart through checkout, and support security and fraud prevention. These cannot be switched off through our site.",
          "Functional / preference — remember choices you make, such as your region, recently viewed products, and whether you have dismissed a banner or notice.",
          "Performance and analytics — help us count visits, see which products and pages are popular, and find errors and slow pages, so we can improve the store. This data is used in aggregate.",
          "Advertising and targeting — used to show Balanti products to people who have shown interest, to limit how often you see the same ad, and to measure whether our campaigns work. These may be set by advertising partners and may be used to build a profile of your interests.",
        ],
      },
      {
        heading: "Third parties",
        paragraphs: [
          "Some cookies are set by third parties acting on our behalf, including our analytics provider and, where advertising is running, our advertising partners. Those parties handle the data they collect under their own privacy policies.",
        ],
      },
      {
        heading: "Managing cookies",
        paragraphs: [
          "You can accept or reject non-essential cookies through the cookie banner shown on your first visit, and change your choice later through the cookie settings link in the site footer.",
          "You can also delete or block cookies in your browser settings. Every major browser explains how in its help section. Blocking strictly necessary cookies will break parts of the site — you may not be able to sign in, keep items in your cart, or complete checkout.",
        ],
      },
    ],
  },
  {
    id: "terms-of-use",
    title: "Terms of Use",
    summary: "The rules for using the Balanti website, your account, and content you submit.",
    blocks: [
      {
        heading: "Acceptance",
        paragraphs: [
          "These Terms of Use govern your access to and use of the Balanti website. By using the site you agree to them. If you do not agree, please do not use the site. We may change these terms at any time by posting an updated version; continued use after that means you accept the change.",
        ],
      },
      {
        heading: "Using the site",
        paragraphs: ["You may view and use the site for your own personal, non-commercial purposes. You must not:"],
        list: [
          "Copy, reproduce, scrape, data-mine or republish any part of the site",
          "Use automated tools to access, harvest or overload the site",
          "Attempt to gain unauthorised access to any account, server or system",
          "Interfere with the security or proper working of the site",
          "Use the site for any unlawful purpose or to infringe anyone's rights",
        ],
      },
      {
        heading: "Your account",
        paragraphs: [
          `You are responsible for keeping your login details confidential and for all activity that occurs under your account. Tell us immediately at ${SUPPORT_EMAIL} if you believe your account has been accessed without your authorisation. You must give accurate and current information when you register and keep it up to date. We may suspend or close an account that is being used in breach of these terms.`,
        ],
      },
      {
        heading: "Reviews and other content you submit",
        paragraphs: [
          "When you submit a product review, rating, photo or other content, you confirm it is your own, is honest, and does not infringe anyone else's rights or contain unlawful, offensive, misleading or defamatory material. You grant Balanti a non-exclusive, royalty-free, worldwide licence to publish, display and reproduce that content in connection with our products and store.",
          "Reviews are moderated. We may decline to publish, edit or remove a review at our discretion — for example where it is off-topic, abusive, fraudulent, or written in exchange for payment. Where our records show you purchased the item, your review may be labelled as a verified purchase.",
        ],
      },
      {
        heading: "Product information and images",
        paragraphs: [
          "We try to describe our products accurately, but we do not warrant that descriptions, colours, measurements or other content are error-free. Colours can vary between screens, and leather is a natural material — grain, colour and markings will vary between pairs. That variation is a characteristic of the material, not a fault.",
        ],
      },
      {
        heading: "Intellectual property",
        paragraphs: [
          "All content on the site — including the Balanti name and logo, product images, photography, text, page layouts, graphics and code — is owned by Balanti or our licensors and is protected by copyright and trade mark law. You may not use it without our prior written consent, except as expressly permitted by these terms.",
        ],
      },
      {
        heading: "Third party links",
        paragraphs: [
          "The site may link to third party websites. We do not control those sites and are not responsible for their content, products or privacy practices. Links do not imply endorsement.",
        ],
      },
      {
        heading: "Availability and disclaimers",
        paragraphs: [
          "We aim to keep the site available at all times but do not guarantee uninterrupted or error-free access. We may suspend, withdraw or change all or part of the site without notice for maintenance or other reasons.",
          "To the maximum extent permitted by law, and subject to your rights under the Australian Consumer Law, Balanti excludes all warranties and is not liable for any indirect, incidental, consequential or special loss, or for loss of profit, revenue or data, arising from your use of the site. Where our liability cannot be excluded, it is limited to the amount you paid for the relevant order.",
        ],
      },
      {
        heading: "Australian Consumer Law",
        paragraphs: [
          "Nothing in these terms excludes, restricts or modifies any consumer guarantee, right or remedy that applies under the Australian Consumer Law and that cannot lawfully be excluded — see \"Your rights under Australian Consumer Law\" in the Returns & Exchanges policy.",
        ],
      },
      {
        heading: "Indemnity",
        paragraphs: [
          "You indemnify Balanti against any claim, loss or cost arising from your breach of these terms, your misuse of the site, or content you submit.",
        ],
      },
      {
        heading: "Privacy",
        paragraphs: ["Our Privacy Policy and Cookie Policy form part of these terms."],
      },
      {
        heading: "Governing law",
        paragraphs: [
          "These terms are governed by the laws of [STATE], Australia. You and Balanti submit to the non-exclusive jurisdiction of the courts of that state and of the Federal Court of Australia.",
        ],
      },
      {
        heading: "Severability",
        paragraphs: [
          "If any part of these terms is found to be invalid or unenforceable, that part is severed and the rest continues to apply.",
        ],
      },
    ],
  },
  {
    id: "terms-of-sale",
    title: "Terms & Conditions of Sale",
    summary: "How orders, prices, coupons, stock, and risk & title work when you buy from Balanti.",
    blocks: [
      {
        heading: "Who you are buying from",
        paragraphs: [
          "Orders placed on the Balanti website are sold by [LEGAL ENTITY NAME] (ABN [ABN]), trading as Balanti, of [REGISTERED ADDRESS].",
        ],
      },
      {
        heading: "Placing an order",
        paragraphs: [
          "Adding items to your cart and completing checkout is an offer to buy, not a binding contract. A contract is formed only when we send you an order confirmation email or, if earlier, when we dispatch your order.",
          "You can order as a guest or as a registered customer.",
        ],
      },
      {
        heading: "Order acceptance and refusal",
        paragraphs: ["We may refuse, limit or cancel an order at any time before dispatch, including where:"],
        list: [
          "The item is out of stock or has been withdrawn",
          "There was a pricing, description or stock error",
          "We cannot verify your details or delivery address",
          "We suspect fraud, resale, or misuse of a coupon or promotion",
          "Delivery is not available to your address",
        ],
      },
      {
        heading: "Prices and GST",
        list: [
          "All prices are in Australian dollars (AUD)",
          "All prices shown include GST at 10%, calculated on a GST-inclusive basis",
          "The GST component of your order is shown on your tax invoice",
          "Delivery charges, where applicable, are shown separately at checkout before you confirm your order",
          "Prices may change at any time, but a change will not affect an order we have already confirmed",
          "If a product is listed at an obviously incorrect price, we will contact you to confirm or cancel the order rather than supply at that price",
        ],
      },
      {
        heading: "Coupons and promotions",
        paragraphs: ["Coupon codes are subject to the conditions shown with the code, including any expiry date, minimum spend, per-customer usage limit and product exclusions. Unless we say otherwise:"],
        list: [
          "Only one coupon code may be used per order",
          "Coupons cannot be exchanged for cash and have no cash value",
          "Coupons cannot be applied retrospectively to an order already placed",
          "If you return items and the order then falls below a coupon's minimum spend, we may adjust the refund by the value of the discount received",
          "We may withdraw or cancel a coupon at any time if it is being misused",
        ],
      },
      {
        heading: "Stock availability",
        paragraphs: [
          "Stock levels shown are indicative. Occasionally an item sells out between your order and our pick-and-pack. If that happens we will contact you and either supply the item when available, offer an alternative, or refund that item.",
        ],
      },
      {
        heading: "Changing or cancelling an order",
        paragraphs: [
          `Contact us as soon as possible at ${SUPPORT_EMAIL} if you need to change or cancel an order. We will do our best, but once an order has been packed or handed to the courier we cannot change the address or contents. In that case you can use the returns process once the order arrives.`,
        ],
      },
      {
        heading: "Risk and title",
        paragraphs: [
          "Risk in the goods passes to you on delivery to the address you gave us. Title passes when we have received payment in full — for Cash on Delivery orders, when the courier collects payment from you.",
        ],
      },
      {
        heading: "Liability",
        paragraphs: [
          "Subject to your rights under the Australian Consumer Law and to the maximum extent permitted by law, our total liability in connection with an order is limited to the price you paid for the goods, and we are not liable for indirect or consequential loss.",
        ],
      },
      {
        heading: "Events outside our control",
        paragraphs: [
          "We are not liable for delay or failure to perform caused by events beyond our reasonable control, including natural disasters, extreme weather, industrial action, transport or courier failures, and government action. If such an event causes a significant delay, we will contact you and you may cancel the affected part of the order for a refund.",
        ],
      },
      {
        heading: "Governing law",
        paragraphs: ["These conditions of sale are governed by the laws of [STATE], Australia."],
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery Policy",
    summary: "Where we ship, delivery costs and timeframes, tracking, and what happens if something goes wrong in transit.",
    blocks: [
      {
        heading: "Where we deliver",
        paragraphs: [
          "Balanti currently delivers within Australia only. We deliver to residential and business addresses. We do not deliver to PO boxes or parcel lockers, because delivery requires someone present to receive the parcel and, for Cash on Delivery orders, to make payment.",
        ],
      },
      {
        heading: "Delivery cost",
        list: [
          "Orders of AUD $150 or more: free delivery",
          "Orders under AUD $150: the delivery charge applying to your address is calculated and displayed at checkout before you confirm your order",
        ],
      },
      {
        heading: "Dispatch and delivery times",
        list: [
          "Orders are picked and packed within 1–2 business days",
          "Metropolitan areas: approximately 2–5 business days from dispatch",
          "Regional and remote areas: approximately 5–10 business days from dispatch",
        ],
      },
      {
        heading: "Tracking your order",
        paragraphs: [
          "You will receive an order confirmation email when your order is placed, and a dispatch email with tracking details when it leaves us. Registered customers can also see order status and history in their account. Order status moves through confirmed, packed, shipped and delivered.",
        ],
      },
      {
        heading: "Receiving your delivery",
        paragraphs: [
          "Someone must be present at the delivery address to accept the parcel. For Cash on Delivery orders, payment must be made in full to the courier at the point of delivery before the parcel is handed over.",
          "If nobody is available, the courier will leave a card and either attempt redelivery or hold the parcel at a nearby depot. Parcels not collected within the carrier's holding period are returned to us. Where an order is returned to us because delivery could not be completed, or because payment was not made on delivery, we will contact you to arrange redelivery; a further delivery charge may apply.",
        ],
      },
      {
        heading: "Incorrect addresses",
        paragraphs: [
          "Please check your delivery address carefully before confirming your order. If a parcel is undeliverable or lost because the address given was incorrect or incomplete, we are not able to refund the order until the parcel is returned to us, and a redelivery charge may apply.",
        ],
      },
      {
        heading: "Lost or damaged in transit",
        paragraphs: [
          `If your parcel has not arrived within 10 business days of the dispatch email, or arrives damaged, contact us at ${SUPPORT_EMAIL} with your order number and, for damage, photographs of the parcel and contents. We will investigate with the carrier and arrange a replacement or refund.`,
        ],
      },
      {
        heading: "Split deliveries",
        paragraphs: [
          "If an order contains items shipping from different locations, it may arrive in more than one parcel at no extra cost to you. Each parcel will have its own tracking.",
        ],
      },
    ],
  },
  {
    id: "returns",
    title: "Returns & Exchanges Policy",
    summary: "Our 30-day change-of-mind window, how to lodge a return, refund timing, and your Australian Consumer Law rights.",
    blocks: [
      {
        heading: "Our returns window",
        paragraphs: [
          "You have 30 days from the date you receive your order to lodge a return for a refund. This is our own change-of-mind policy and is in addition to — not instead of — your rights under the Australian Consumer Law.",
        ],
      },
      {
        heading: "Conditions",
        paragraphs: ["To be accepted, returned items must be:"],
        list: [
          "Unworn and unused, in original condition, with all original tags attached",
          "Free of marks, scratches, scuffs and odours (including perfume and smoke)",
          "Footwear: returned in the original, undamaged shoe box, which must be placed inside an outer satchel or carton — please do not tape or write on the shoe box itself",
          "Accompanied by proof of purchase (order number or tax invoice)",
        ],
      },
      {
        heading: "How to lodge a return",
        list: [
          `Log in to your Balanti account and open the order, or email ${SUPPORT_EMAIL} with your order number if you checked out as a guest`,
          "Select the item(s) you want to return and give the reason",
          "Submit the request — your return moves to \"Requested\"",
          "We review it and either approve or decline it, and email you the outcome with return instructions and the return address",
          "Send the item(s) back within 14 days of approval, using a tracked service",
          "When your parcel reaches us the return is marked \"Received\" and inspected",
          "If the inspection passes, the return is marked \"Refunded\" and your refund is issued",
        ],
      },
      {
        heading: "Return postage",
        list: [
          "Change of mind: return postage is at your cost, and the original delivery charge (if one was paid) is not refunded",
          "Faulty, damaged or incorrect items: Balanti covers the cost of return postage and refunds the original delivery charge",
        ],
        paragraphs: ["Until we receive the parcel, it remains your responsibility. Please keep your tracking number."],
      },
      {
        heading: "Refunds",
        paragraphs: ["We aim to inspect and process approved returns within 2 business days of receipt."],
        list: [
          "Cash on Delivery orders: because no card was charged, refunds are made by electronic bank transfer to an Australian bank account you nominate. We will ask for the account name, BSB and account number after your return is received. Please allow 3–7 business days for the funds to appear",
          "Card or online payments (when available): refunded to the original payment method; your bank may take a further 3–7 business days to show the credit",
        ],
      },
      {
        heading: "Your rights under Australian Consumer Law",
        paragraphs: [
          "Our goods come with guarantees that cannot be excluded under the Australian Consumer Law. You are entitled to a replacement or refund for a major failure and to compensation for any other reasonably foreseeable loss or damage. You are also entitled to have the goods repaired or replaced if they are not of acceptable quality and the failure does not amount to a major failure.",
          "These rights apply regardless of our 30-day change-of-mind window and are not limited by it. Further information is available from the ACCC at www.accc.gov.au.",
        ],
      },
      {
        heading: "Faulty or incorrect items",
        paragraphs: [
          `If an item arrives faulty, damaged or is not what you ordered, email ${SUPPORT_EMAIL} with your order number, a description of the problem and clear photographs. We will assess it and, in line with the Australian Consumer Law, offer a repair, replacement or refund. Do not continue to wear an item you believe is faulty, as further wear can make assessment difficult.`,
          "Normal wear and tear, damage caused by misuse or accident, and damage caused by failing to follow the care instructions supplied with the product are not covered.",
        ],
      },
      {
        heading: "Exchanges",
        paragraphs: [
          "We do not process exchanges by post. If you need a different size or colour, place a new order for the item you want and lodge a return for the original. This is the fastest way to secure your replacement, since stock cannot be held while a return is in transit.",
        ],
      },
      {
        heading: "What we cannot accept",
        list: [
          "Items returned after the 30-day window (except where the Australian Consumer Law applies)",
          "Items that have been worn, washed, altered or repaired by someone other than Balanti",
          "Items returned without proof of purchase",
          "Gift cards",
          "Clearance or final-sale items marked as non-returnable at the time of purchase (your Australian Consumer Law rights still apply if the item is faulty)",
          "Original delivery charges on change-of-mind returns",
        ],
      },
      {
        heading: "Declined returns",
        paragraphs: [
          "If a returned item does not meet the conditions above, we will contact you and can send it back to you at your cost. We will hold it for 30 days while we wait for your instructions.",
        ],
      },
    ],
  },
  {
    id: "payment",
    title: "Payment Options",
    summary: "How you can pay, currency & GST, and what happens if a payment fails.",
    blocks: [
      {
        heading: "How you can pay",
        paragraphs: [
          "Balanti currently accepts Cash on Delivery (COD): pay the courier in full, in Australian dollars, when your order is handed to you. Available on all deliveries within Australia. Please have the exact amount ready where possible — couriers may not carry change. The parcel cannot be released until payment is made.",
          "Additional payment methods — including credit and debit cards and digital wallets — are being added. The methods available to you are always shown at checkout, and only those shown there can be used.",
        ],
      },
      {
        heading: "Currency and GST",
        paragraphs: [
          "All payments are in Australian dollars and all displayed prices include GST at 10%. A tax invoice showing the GST component is issued with your order.",
        ],
      },
      {
        heading: "Refused or failed payment",
        paragraphs: [
          "If payment is not made on delivery, the courier will return the parcel to us and the order will be cancelled. Repeated refusal to accept Cash on Delivery orders may result in COD being disabled for your account.",
        ],
      },
      {
        heading: "Security",
        paragraphs: [
          "We do not store payment card details. Where online payment is introduced, card data will be captured and processed by a PCI-DSS compliant payment provider over an encrypted connection, and Balanti will hold only a transaction reference.",
        ],
      },
    ],
  },
];

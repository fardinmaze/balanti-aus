/**
 * Structured version of BALANTI_Customer_Policies.docx (project root,
 * version 1.1) for the Support page. Wording is the source document's,
 * reorganised into headings / paragraphs / lists for rendering. Section
 * numbers are kept because the text cross-references them ("see section
 * 6.6"). Update both files together if the policy text changes.
 */

const SUPPORT_EMAIL = "info@balanti.com.au";

export type PolicyBlock = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  /** Render `list` as numbered steps rather than bullets. */
  ordered?: boolean;
  /** Paragraphs that follow the list in the source document. */
  after?: string[];
};

export type Policy = {
  id: string;
  title: string;
  summary: string;
  blocks: PolicyBlock[];
};

export const policiesLastUpdated = "4 October 2026";
export const policiesVersion = "1.1";

export const policies: Policy[] = [
  {
    id: "privacy",
    title: "1. Privacy Policy",
    summary: "What we collect, how we use it, and your rights under the Australian Privacy Principles.",
    blocks: [
      {
        heading: "1.1 About this policy",
        paragraphs: [
          "Balanti respects your privacy. This policy explains what personal information we collect when you use our website, place an order or contact us, how we use it, who we share it with, and the choices and rights you have.",
          "We handle personal information in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).",
          "By using our website or placing an order, you agree to the handling of your personal information as described in this policy.",
        ],
      },
      {
        heading: "1.2 What we collect",
        paragraphs: ["Information you give us:"],
        list: [
          "Name (first name, last name, display name)",
          "Email address",
          "Billing address and shipping address (you may save multiple addresses and mark one as your default)",
          "Account login details (username and an encrypted password — we never store your password in readable form)",
          "Order details: items ordered, quantities, prices, GST, delivery method, payment method, order notes and delivery notes",
          "Product reviews and ratings you submit, and the items you save to your wishlist",
          "Return requests, including the reason you give for the return",
          "Messages you send us through our contact form or by email",
        ],
      },
      {
        heading: "Information we collect automatically",
        list: [
          "IP address, browser type, device type and operating system",
          "Pages viewed, products viewed, time and date of your visit, and the site you arrived from",
          "Cookie and similar identifiers (see the Cookie Policy in section 2)",
        ],
      },
      {
        heading: "Guest checkout",
        paragraphs: [
          "You can order without creating an account. We still need your name, contact details and delivery address to fulfil and deliver the order, and we retain those order records as described in section 1.7.",
        ],
      },
      {
        heading: "Payment information",
        paragraphs: [
          "Payments for Balanti orders are made online at checkout. Payment information is securely processed by our payment provider. Balanti does not store your full payment card details. We receive only the information necessary to confirm and manage the transaction.",
        ],
      },
      {
        heading: "Sensitive information",
        paragraphs: [
          "We do not collect sensitive information (such as health, racial, political or religious information) and we ask that you do not send it to us.",
        ],
      },
      {
        heading: "1.3 How we use your information",
        paragraphs: ["We use your personal information to:"],
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
          "Send you marketing about Balanti products and offers, where you have opted in or where the law otherwise permits it (you can opt out at any time — see section 1.6)",
          "Meet our legal, tax and accounting obligations",
        ],
        after: ["We do not sell your personal information."],
      },
      {
        heading: "1.4 Who we share it with",
        paragraphs: ["We disclose personal information only as needed, to:"],
        list: [
          "Delivery and logistics partners, so your order can be delivered",
          "IT, hosting, database and email service providers who operate our systems on our behalf",
          "Analytics and error-monitoring providers",
          "Payment providers, so online payments can be securely processed",
          "Professional advisers such as accountants, auditors and lawyers",
          "Government agencies, regulators, courts or law enforcement where we are required or authorised by law",
          "A purchaser or prospective purchaser, if Balanti or part of our business is sold or restructured",
        ],
        after: ["We require our service providers to protect your information and to use it only for the purpose we engaged them for."],
      },
      {
        heading: "1.5 Overseas disclosure",
        paragraphs: [
          "Some of our service providers — for example website hosting, email delivery, analytics and error monitoring — store or process data on servers outside Australia, including in the United States and the European Union. Before disclosing personal information overseas we take reasonable steps to ensure the recipient handles it in a way consistent with the Australian Privacy Principles.",
        ],
      },
      {
        heading: "1.6 Marketing and opt-out",
        paragraphs: [
          `If you subscribe to Balanti emails or opt in during checkout, we may send you product news, new releases and offers. Every marketing email contains an unsubscribe link. You can also opt out at any time by emailing ${SUPPORT_EMAIL}. Opting out of marketing does not stop transactional messages such as order confirmations, delivery updates and return notifications, which we need to send to complete your order.`,
        ],
      },
      {
        heading: "1.7 How long we keep it",
        list: [
          "Account records: for as long as your account is active, and then for a reasonable period after it is closed",
          "Order, invoice and payment records: at least 7 years, to meet Australian tax and record-keeping requirements",
          "Return and refund records: at least 7 years, for the same reason",
          "Reviews: until you or we remove them",
          "Marketing lists: until you unsubscribe",
          "Web analytics and log data: generally no more than 26 months",
        ],
        after: ["When information is no longer needed and we are not required to keep it, we delete it or de-identify it."],
      },
      {
        heading: "1.8 Security",
        paragraphs: [
          "We take reasonable steps to protect your personal information from misuse, interference, loss and unauthorised access, modification or disclosure. These include encrypted connections (HTTPS) to our website, hashed password storage, token-based authentication, role- and permission-based access controls limiting which staff can see customer data, and activity logging of administrative actions.",
          "No method of transmission or storage is completely secure. If a data breach occurs that is likely to result in serious harm, we will notify affected individuals and the Office of the Australian Information Commissioner (OAIC) as required by the Notifiable Data Breaches scheme.",
        ],
      },
      {
        heading: "1.9 Accessing and correcting your information",
        paragraphs: [
          "You can view and update most of your details — name, contact details and saved addresses — by logging in to your Balanti account.",
          "You may also ask us to:",
        ],
        list: [
          "Give you access to the personal information we hold about you",
          "Correct information that is inaccurate, out of date or incomplete",
          "Delete your account and associated personal information, subject to records we are legally required to keep (such as tax invoices)",
        ],
        after: [
          `Email ${SUPPORT_EMAIL} with your request. We will respond within 30 days. We may ask you to verify your identity first. Access is free in ordinary cases; if a request is unusually large we will tell you about any charge before proceeding.`,
        ],
      },
      {
        heading: "1.10 Complaints",
        paragraphs: [
          `If you believe we have mishandled your personal information, contact our Privacy Officer by email at ${SUPPORT_EMAIL}. We will acknowledge your complaint and respond within 30 days.`,
          "If you are not satisfied with our response, you can contact the Office of the Australian Information Commissioner at www.oaic.gov.au or on 1300 363 992.",
        ],
      },
      {
        heading: "1.11 Changes to this policy",
        paragraphs: [
          `We may update this policy from time to time. The current version is always available on our website, with the "last updated" date at the top. Material changes will be notified on the website or by email.`,
        ],
      },
    ],
  },
  {
    id: "cookies",
    title: "2. Cookie Policy",
    summary: "The categories of cookies we use, why, and how to manage your choices.",
    blocks: [
      {
        heading: "2.1 What cookies are",
        paragraphs: [
          "Cookies are small text files placed on your device when you visit a website. They let the site remember your actions and preferences between pages and visits. We also use similar technologies such as local storage and pixels. This policy covers all of them.",
          "We never store payment card details or passwords in cookies.",
        ],
      },
      {
        heading: "2.2 The cookies we use",
        list: [
          "Strictly necessary — required for the site to work. They keep you logged in, hold your authentication token, remember the contents of your cart through checkout, and support security and fraud prevention. These cannot be switched off through our site.",
          "Functional / preference — remember choices you make, such as your region, recently viewed products, and whether you have dismissed a banner or notice.",
          "Performance and analytics — help us count visits, see which products and pages are popular, and find errors and slow pages, so we can improve the store. This data is used in aggregate.",
          "Advertising and targeting — used to show Balanti products to people who have shown interest, to limit how often you see the same ad, and to measure whether our campaigns work. These may be set by advertising partners and may be used to build a profile of your interests.",
        ],
      },
      {
        heading: "2.3 Third parties",
        paragraphs: [
          "Some cookies are set by third parties acting on our behalf, including our analytics provider and, where advertising is running, our advertising partners. Those parties handle the data they collect under their own privacy policies.",
        ],
      },
      {
        heading: "2.4 Managing cookies",
        paragraphs: [
          "You can accept or reject non-essential cookies through the cookie banner shown on your first visit, and change your choice later through the cookie settings link in the site footer.",
          "You can also delete or block cookies in your browser settings. Every major browser explains how in its help section. Blocking strictly necessary cookies will break parts of the site — you may not be able to sign in, keep items in your cart, or complete checkout.",
        ],
      },
    ],
  },
  {
    id: "terms-of-use",
    title: "3. Terms of Use",
    summary: "The rules for using the Balanti website, your account, and content you submit.",
    blocks: [
      {
        heading: "3.1 Acceptance",
        paragraphs: [
          "These Terms of Use govern your access to and use of the Balanti website. By using the site you agree to them. If you do not agree, please do not use the site. We may change these terms at any time by posting an updated version; continued use after that means you accept the change.",
        ],
      },
      {
        heading: "3.2 Using the site",
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
        heading: "3.3 Your account",
        paragraphs: [
          `You are responsible for keeping your login details confidential and for all activity that occurs under your account. Tell us immediately at ${SUPPORT_EMAIL} if you believe your account has been accessed without your authorisation. You must give accurate and current information when you register and keep it up to date. We may suspend or close an account that is being used in breach of these terms.`,
        ],
      },
      {
        heading: "3.4 Reviews and other content you submit",
        paragraphs: [
          "When you submit a product review, rating, photo or other content, you confirm it is your own, is honest, and does not infringe anyone else's rights or contain unlawful, offensive, misleading or defamatory material. You grant Balanti a non-exclusive, royalty-free, worldwide licence to publish, display and reproduce that content in connection with our products and store.",
          "Reviews are moderated. We may decline to publish, edit or remove a review at our discretion — for example where it is off-topic, abusive, fraudulent, or written in exchange for payment. Where our records show you purchased the item, your review may be labelled as a verified purchase.",
        ],
      },
      {
        heading: "3.5 Product information and images",
        paragraphs: [
          "We try to describe our products accurately, but we do not warrant that descriptions, colours, measurements or other content are error-free. Colours can vary between screens, and leather is a natural material — grain, colour and markings will vary between pairs. That variation is a characteristic of the material, not a fault.",
        ],
      },
      {
        heading: "3.6 Intellectual property",
        paragraphs: [
          "All content on the site — including the Balanti name and logo, product images, photography, text, page layouts, graphics and code — is owned by Balanti or our licensors and is protected by copyright and trade mark law. You may not use it without our prior written consent, except as expressly permitted by these terms.",
        ],
      },
      {
        heading: "3.7 Third party links",
        paragraphs: [
          "The site may link to third party websites. We do not control those sites and are not responsible for their content, products or privacy practices. Links do not imply endorsement.",
        ],
      },
      {
        heading: "3.8 Availability and disclaimers",
        paragraphs: [
          "We aim to keep the site available at all times but do not guarantee uninterrupted or error-free access. We may suspend, withdraw or change all or part of the site without notice for maintenance or other reasons.",
          "To the maximum extent permitted by law, and subject to section 3.9, Balanti excludes all warranties and is not liable for any indirect, incidental, consequential or special loss, or for loss of profit, revenue or data, arising from your use of the site. Where our liability cannot be excluded, it is limited to the amount you paid for the relevant order.",
        ],
      },
      {
        heading: "3.9 Australian Consumer Law",
        paragraphs: [
          "Nothing in these terms excludes, restricts or modifies any consumer guarantee, right or remedy that applies under the Australian Consumer Law and that cannot lawfully be excluded. See section 6.6.",
        ],
      },
      {
        heading: "3.10 Indemnity",
        paragraphs: [
          "You indemnify Balanti against any claim, loss or cost arising from your breach of these terms, your misuse of the site, or content you submit.",
        ],
      },
      {
        heading: "3.11 Privacy",
        paragraphs: ["Our Privacy Policy (section 1) and Cookie Policy (section 2) form part of these terms."],
      },
      {
        heading: "3.12 Governing law",
        paragraphs: [
          "These terms are governed by the laws of Queensland, Australia. You and Balanti submit to the non-exclusive jurisdiction of the courts of Queensland and of the Federal Court of Australia.",
        ],
      },
      {
        heading: "3.13 Severability",
        paragraphs: [
          "If any part of these terms is found to be invalid or unenforceable, that part is severed and the rest continues to apply.",
        ],
      },
    ],
  },
  {
    id: "terms-of-sale",
    title: "4. Terms and Conditions of Sale",
    summary: "How orders, prices, coupons, stock, and risk & title work when you buy from Balanti.",
    blocks: [
      {
        heading: "4.1 Who you are buying from",
        paragraphs: ["Orders placed on the Balanti website are sold by BEXBUY AUSTRALIA (ABN 43 146 421 385), trading as Balanti."],
      },
      {
        heading: "4.2 Placing an order",
        paragraphs: [
          "Adding items to your cart and completing checkout is an offer to buy, not a binding contract. A contract is formed only when we send you an order confirmation email or, if earlier, when we dispatch your order.",
          "You can order as a guest or as a registered customer.",
        ],
      },
      {
        heading: "4.3 Order acceptance and refusal",
        paragraphs: ["We may refuse, limit or cancel an order at any time before dispatch, including where:"],
        list: [
          "The item is out of stock or has been withdrawn",
          "There was a pricing, description or stock error",
          "We cannot verify your details or delivery address",
          "We suspect fraud, resale, or misuse of a coupon or promotion",
          "Delivery is not available to your address",
        ],
        after: ["If we cancel an order you have already paid for, we will refund you in full."],
      },
      {
        heading: "4.4 Prices and GST",
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
        heading: "4.5 Coupons and promotions",
        paragraphs: [
          "Coupon codes are subject to the conditions shown with the code, including any expiry date, minimum spend, per-customer usage limit and product exclusions. Unless we say otherwise:",
        ],
        list: [
          "Only one coupon code may be used per order",
          "Coupons cannot be exchanged for cash and have no cash value",
          "Coupons cannot be applied retrospectively to an order already placed",
          "If you return items and the order then falls below a coupon's minimum spend, we may adjust the refund by the value of the discount received",
          "We may withdraw or cancel a coupon at any time if it is being misused",
        ],
      },
      {
        heading: "4.6 Stock availability",
        paragraphs: [
          "Stock levels shown are indicative. Occasionally an item sells out between your order and our pick-and-pack. If that happens we will contact you and either supply the item when available, offer an alternative, or refund that item.",
        ],
      },
      {
        heading: "4.7 Changing or cancelling an order",
        paragraphs: [
          `Contact us as soon as possible at ${SUPPORT_EMAIL} if you need to change or cancel an order. We will do our best, but once an order has been packed or handed to the courier we cannot change the address or contents. In that case you can use the returns process in section 6 once the order arrives.`,
        ],
      },
      {
        heading: "4.8 Risk and title",
        paragraphs: [
          "Risk in the goods passes to you on delivery to the address you gave us. Title to the goods passes to you once we have received payment in full.",
        ],
      },
      {
        heading: "4.9 Liability",
        paragraphs: [
          "Subject to section 6.6 and to the maximum extent permitted by law, our total liability in connection with an order is limited to the price you paid for the goods, and we are not liable for indirect or consequential loss.",
        ],
      },
      {
        heading: "4.10 Events outside our control",
        paragraphs: [
          "We are not liable for delay or failure to perform caused by events beyond our reasonable control, including natural disasters, extreme weather, industrial action, transport or courier failures, and government action. If such an event causes a significant delay, we will contact you and you may cancel the affected part of the order for a refund.",
        ],
      },
      {
        heading: "4.11 Governing law",
        paragraphs: ["These conditions of sale are governed by the laws of Queensland, Australia."],
      },
    ],
  },
  {
    id: "delivery",
    title: "5. Delivery Policy",
    summary: "Where we ship, delivery costs and timeframes, tracking, and what happens if something goes wrong in transit.",
    blocks: [
      {
        heading: "5.1 Where we deliver",
        paragraphs: [
          "Balanti currently delivers within Australia only. We deliver to residential and business addresses. We do not currently deliver to PO boxes or parcel lockers.",
        ],
      },
      {
        heading: "5.2 Delivery cost",
        list: [
          "Orders of AUD $200 or more: free delivery",
          "Orders under AUD $200: the delivery charge applying to your address is calculated and displayed at checkout before you confirm your order",
        ],
        after: ["The free delivery threshold is assessed on the order total after any coupon discount and before delivery charges."],
      },
      {
        heading: "5.3 Dispatch and delivery times",
        list: [
          "Orders are picked and packed within 1–2 business days",
          "Metropolitan areas: approximately 2–5 business days from dispatch",
          "Regional and remote areas: approximately 5–10 business days from dispatch",
        ],
        after: [
          "Business days are Monday to Friday excluding public holidays in Queensland. Orders placed on a weekend or public holiday are processed on the next business day. Timeframes are estimates provided by our carriers, not guarantees, and can be longer during sale periods, holidays and peak season.",
        ],
      },
      {
        heading: "5.4 Tracking your order",
        paragraphs: [
          "You will receive an order confirmation email when your order is placed, and a dispatch email with tracking details when it leaves us. Registered customers can also see order status and history in their account. Order status moves through confirmed, packed, shipped and delivered.",
        ],
      },
      {
        heading: "5.5 Receiving your delivery",
        paragraphs: [
          "Someone must be available at the delivery address where the carrier requires the parcel to be accepted in person.",
          "If nobody is available, the courier may attempt redelivery or hold the parcel at a collection location, depending on the carrier's delivery process. Parcels that are not collected within the carrier's holding period may be returned to us. If an order is returned to Balanti because delivery could not be completed, we will contact you to arrange redelivery. An additional delivery charge may apply.",
        ],
      },
      {
        heading: "5.6 Incorrect addresses",
        paragraphs: [
          "Please check your delivery address carefully before confirming your order. If a parcel is undeliverable or lost because the address given was incorrect or incomplete, we are not able to refund the order until the parcel is returned to us, and a redelivery charge may apply.",
        ],
      },
      {
        heading: "5.7 Lost or damaged in transit",
        paragraphs: [
          `If your parcel has not arrived within 10 business days of the dispatch email, or arrives damaged, contact us at ${SUPPORT_EMAIL} with your order number and, for damage, photographs of the parcel and contents. We will investigate with the carrier and arrange a replacement or refund.`,
        ],
      },
      {
        heading: "5.8 Split deliveries",
        paragraphs: [
          "If an order contains items shipping from different locations, it may arrive in more than one parcel at no extra cost to you. Each parcel will have its own tracking.",
        ],
      },
    ],
  },
  {
    id: "returns",
    title: "6. Returns and Exchanges Policy",
    summary: "Our 30-day change-of-mind window, how to lodge a return, refund timing, and your Australian Consumer Law rights.",
    blocks: [
      {
        heading: "6.1 Our returns window",
        paragraphs: [
          "You have 30 days from the date you receive your order to lodge a return for a refund. This is our own change-of-mind policy and is in addition to — not instead of — your rights under the Australian Consumer Law (section 6.6).",
        ],
      },
      {
        heading: "6.2 Conditions",
        paragraphs: ["To be accepted, returned items must be:"],
        list: [
          "Unworn and unused, in brand-new condition, with all original tags attached. Shoes may only be tried on indoors on a clean, carpeted surface.",
          "Free of marks, scratches, scuffs and odours (including perfume and smoke).",
          "Footwear must be returned in its original shoe box. The box should be in good condition; minor scratches on the shoe box are acceptable. The shoe box must be placed inside an outer satchel or carton, and must not be taped or written on.",
          "Accompanied by proof of purchase, including the receipt and order confirmation email.",
        ],
        after: ["Items showing signs of wear, including soles that have been worn outdoors, cannot be accepted as a change-of-mind return."],
      },
      {
        heading: "6.3 How to lodge a return",
        ordered: true,
        list: [
          `Log in to your Balanti account and open the order, or email ${SUPPORT_EMAIL} with your order number if you checked out as a guest`,
          "Select the item(s) you want to return and give the reason",
          `Submit the request — your return moves to "Requested"`,
          "We review it and either approve or decline it, and email you the outcome with return instructions and the return address",
          "Send the item(s) back within 14 days of approval, using a tracked service",
          `When your parcel reaches us the return is marked "Received" and inspected`,
          `If the inspection passes, the return is marked "Refunded" and your refund is issued`,
        ],
        after: ["Please do not send items back before your return has been approved — unapproved parcels may be returned to you."],
      },
      {
        heading: "6.4 Return postage",
        list: [
          "Change of mind: return postage is at your cost, and the original delivery charge (if one was paid) is not refunded",
          "Faulty, damaged or incorrect items: Balanti covers the cost of return postage and refunds the original delivery charge",
        ],
        after: ["Until we receive the parcel, it remains your responsibility. Please keep your tracking number."],
      },
      {
        heading: "6.5 Refunds",
        paragraphs: [
          "We aim to inspect and process approved returns within 2 business days of receipt.",
          "Refunds for online purchases will be issued to the original payment method used for the order. After we process the refund, your bank or payment provider may take a further 3–7 business days to make the funds available.",
          "Refunds are for the amount you actually paid for the returned item, including its GST component, and after any coupon discount that was applied to it.",
        ],
      },
      {
        heading: "6.6 Your rights under Australian Consumer Law",
        paragraphs: [
          "Our goods come with guarantees that cannot be excluded under the Australian Consumer Law. You are entitled to a replacement or refund for a major failure and to compensation for any other reasonably foreseeable loss or damage. You are also entitled to have the goods repaired or replaced if they are not of acceptable quality and the failure does not amount to a major failure.",
          "These rights apply regardless of our 30-day change-of-mind window and are not limited by it. Further information is available from the ACCC at www.accc.gov.au.",
        ],
      },
      {
        heading: "6.7 Faulty or incorrect items",
        paragraphs: [
          `If an item arrives faulty, damaged or is not what you ordered, email ${SUPPORT_EMAIL} with your order number, a description of the problem and clear photographs. We will assess it and, in line with the Australian Consumer Law, offer a repair, replacement or refund. Do not continue to wear an item you believe is faulty, as further wear can make assessment difficult.`,
          "Normal wear and tear, damage caused by misuse or accident, and damage caused by failing to follow the care instructions supplied with the product are not covered.",
        ],
      },
      {
        heading: "6.8 Exchanges",
        paragraphs: [
          "We do not process exchanges by post. If you need a different size or colour, place a new order for the item you want and lodge a return for the original. This is the fastest way to secure your replacement, since stock cannot be held while a return is in transit.",
        ],
      },
      {
        heading: "6.9 What we cannot accept",
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
        heading: "6.10 Declined returns",
        paragraphs: [
          "If a returned item does not meet the conditions in section 6.2, we will contact you and can send it back to you at your cost. We will hold it for 30 days while we wait for your instructions.",
        ],
      },
    ],
  },
  {
    id: "payment",
    title: "7. Payment Options",
    summary: "How you can pay, currency & GST, failed payments and payment security.",
    blocks: [
      {
        heading: "7.1 How you can pay",
        paragraphs: [
          "Balanti accepts online payment only. The payment methods currently available will be displayed at checkout. Payment must be completed successfully online before an order can be processed. Balanti does not offer Cash on Delivery.",
        ],
      },
      {
        heading: "7.2 Currency and GST",
        paragraphs: [
          "All payments are in Australian dollars and all displayed prices include GST at 10%. A tax invoice showing the GST component is issued with your order.",
        ],
      },
      {
        heading: "7.3 Failed payment",
        paragraphs: [
          "If an online payment is declined, unsuccessful or cannot be completed, the order will not be processed. You may try the payment again or use another payment method available at checkout.",
        ],
      },
      {
        heading: "7.4 Security",
        paragraphs: [
          "Payment information is processed securely by Balanti's online payment provider using an encrypted connection. Balanti does not store your full payment card details. We retain only the transaction information required to confirm, manage and refund your order where necessary.",
        ],
      },
    ],
  },
  {
    id: "contact-us",
    title: "8. Contact Us",
    summary: "How to reach Balanti Customer Care and our Privacy Officer.",
    blocks: [
      {
        heading: "Balanti Customer Care",
        list: [
          `Email: ${SUPPORT_EMAIL}`,
          "Web: https://www.balanti.com.au",
          `Privacy enquiries and complaints: ${SUPPORT_EMAIL}, marked "Privacy Officer"`,
        ],
        after: ["Please include your order number in all correspondence about an order."],
      },
    ],
  },
];

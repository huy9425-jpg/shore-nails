/**
 * ============================================================
 *  SHORE NAILS — OFFICIAL AUDITED PRICE LIST
 * ============================================================
 *
 * All prices strictly audited against the confirmed Shore Nails menu.
 * For unconfirmed services (Dipping Powder, Tap Gel, Builder Gel,
 * Ombre, and Powder Color), prices are displayed as
 * "Contact us for pricing". No invented prices.
 */

export interface PriceItem {
  id?: string;
  name: string;
  price: string;
  note?: string;
  duration?: string;
  isUnconfirmed?: boolean;
}

export interface PriceCategory {
  id: string;
  category: string;
  description?: string;
  items: PriceItem[];
}

export const priceList: PriceCategory[] = [
  {
    id: "nail-services",
    category: "Nail Services",
    description:
      "Full sets, refills, manicures, and polish care crafted with precision and long-lasting finishes.",
    items: [
      { name: "Pre-Designed Full Set", price: "$45" },
      { name: "Acrylic Full Set", price: "$40" },
      { name: "Color Tip Full Set", price: "$45" },
      { name: "French Tip Full Set", price: "$45" },
      { name: "Pink & White Full Set", price: "$65" },
      { name: "Color Gel Powder Full Set", price: "$55" },
      { name: "Sparkle Tip Full Set", price: "$45" },
      { name: "Regular Refill", price: "$30" },
      { name: "Color Tip / French Tip Refill", price: "$35" },
      { name: "Gel Powder Refill", price: "$40" },
      { name: "Pink Refill", price: "$40" },
      { name: "Pink & White Refill", price: "$55" },
      { name: "Gel Manicure", price: "$35" },
      { name: "Nail Take Off & Manicure", price: "$25" },
      { name: "Nails Removal with New Set", price: "$5 Extra" },
      { name: "Regular Polish Change - Hands", price: "$10" },
      { name: "Regular Polish Change - Feet", price: "$15" },
      { name: "Gel Polish Change - Hands", price: "$25" },
      { name: "Gel Polish Change - Feet", price: "$30" },
      { name: "Polish Change with French", price: "$5 Extra" },
      { name: "Nail Design", price: "$5+" },
      { name: "Manicure", price: "$20" },
    ],
  },
  {
    id: "pedicure",
    category: "Pedicure",
    description:
      "Relaxing foot soaks, exfoliation, cuticle grooming, and rejuvenating massage treatments.",
    items: [
      {
        name: "Luxury Spa Pedicure (Approximately 45 Minutes)",
        price: "$65",
      },
      { name: "Deluxe Pedicure", price: "$55" },
      { name: "Regular Pedicure", price: "$38" },
      { name: "Pedicure with Gel Polish", price: "$53" },
    ],
  },
  {
    id: "waxing",
    category: "Waxing Services",
    description:
      "Smooth, professional facial and body waxing performed in a hygienic, tranquil environment.",
    items: [
      { name: "Eyebrows", price: "$10" },
      { name: "Upper Lip", price: "$7" },
      { name: "Chin", price: "$10+" },
      { name: "Sideburn", price: "$15+" },
      { name: "Full Facial", price: "$40+" },
      { name: "Bikini Line", price: "$40+" },
      { name: "Half Legs", price: "$45+" },
      { name: "Full Legs", price: "$80+" },
      { name: "Underarms", price: "$25+" },
      { name: "Brazilian Bikini", price: "$55+" },
      { name: "Back Waxing", price: "$70+" },
    ],
  },
  {
    id: "mens-services",
    category: "Men's Services",
    description:
      "Essential grooming treatments tailored for clean, healthy nails and relaxing foot care.",
    items: [
      { name: "Sport Manicure", price: "$20" },
      { name: "Sport Pedicure", price: "$38" },
      { name: "Back Waxing", price: "$70+" },
    ],
  },
  {
    id: "specialty-services",
    category: "Specialty & Powder Systems",
    description:
      "Specialty enhancement services with custom consultation. Call our salon directly for custom quotes.",
    items: [
      {
        name: "Dipping Powder",
        price: "Contact us for pricing",
        isUnconfirmed: true,
      },
      {
        name: "Tap Gel",
        price: "Contact us for pricing",
        isUnconfirmed: true,
      },
      {
        name: "Builder Gel",
        price: "Contact us for pricing",
        isUnconfirmed: true,
      },
      {
        name: "Ombre Nails",
        price: "Contact us for pricing",
        isUnconfirmed: true,
      },
      {
        name: "Powder Color",
        price: "Contact us for pricing",
        isUnconfirmed: true,
      },
    ],
  },
];

/** Notice for services with unlisted prices */
export const unlistedPriceNotice = {
  text: "For Dipping Powder, Tap Gel, Builder Gel, Ombre, and Powder Color, please contact the salon for pricing.",
  phonePrompt: "Call +1 (609) 407-0072 for personalized consultations or custom nail art quotes.",
};

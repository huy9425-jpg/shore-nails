/**
 * ============================================================
 *  SHORE NAILS — SERVICE CATALOG & 11 CORE OFFERINGS
 * ============================================================
 *
 * All 11 required services explicitly represented:
 * 1. Spa Pedicure
 * 2. Manicure
 * 3. Gel Manicure
 * 4. Dipping Powder
 * 5. Acrylic Powder
 * 6. Tap Gel
 * 7. Builder Gel
 * 8. Ombre
 * 9. Pink & White
 * 10. Powder Color
 * 11. Waxing
 */

export interface CoreServiceItem {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  image: string;
}

export const coreServices11: CoreServiceItem[] = [
  {
    id: "spa-pedicure",
    name: "Spa Pedicure",
    category: "Foot Care & Relaxation",
    tagline: "Botanical Soaks, Exfoliation & Massage",
    description:
      "A rejuvenating foot spa treatment featuring warm mineral soaks, botanical scrubs, cuticle detailing, callus care, soothing massage, and high-shine polish.",
    image: "/images/gallery/spa-pedicure/pedicure-01.webp",
  },
  {
    id: "manicure",
    name: "Manicure",
    category: "Natural Hand Care",
    tagline: "Essential Shaping, Cuticle Care & Lacquer",
    description:
      "A classic manicure tailored to keep your natural nails healthy and clean. Includes gentle cuticle grooming, precision shaping, hand lotion, and polish.",
    image: "/images/gallery/classic-manicure/classic-02.webp",
  },
  {
    id: "gel-manicure",
    name: "Gel Manicure",
    category: "Long-Wear Manicure",
    tagline: "Up to 3 Weeks of Chip-Resistant Shine",
    description:
      "High-performance gel lacquer cured under LED light for instant drying and a durable, glossy mirror finish that resists chipping.",
    image: "/images/gallery/gel-manicure/gel-01.webp",
  },
  {
    id: "dipping-powder",
    name: "Dipping Powder",
    category: "Powder System",
    tagline: "Lightweight, Strong & Odor-Free",
    description:
      "A gentle dipping system enriched with vitamins that provides durable strength without UV light, giving nails a natural and flexible feel.",
    image: "/images/gallery/dipping/dipping-01.webp",
  },
  {
    id: "acrylic-powder",
    name: "Acrylic Powder",
    category: "Extensions & Full Sets",
    tagline: "Custom Sculpted Length & Durability",
    description:
      "Precision-sculpted acrylic enhancements providing exceptional durability, custom shapes, and length suited to your lifestyle.",
    image: "/images/gallery/acrylic/acrylic-03.webp",
  },
  {
    id: "tap-gel",
    name: "Tap Gel",
    category: "Hybrid Gel System",
    tagline: "Ultra-Light Flexibility & Strength",
    description:
      "A premium hybrid gel overlay formula offering the strength of acrylics with the lightweight flexibility and natural clarity of soft gels.",
    image: "/images/gallery/tap-gel/tap-gel-01.webp",
  },
  {
    id: "builder-gel",
    name: "Builder Gel",
    category: "Structured Nails",
    tagline: "Apex Strengthening & Natural Growth",
    description:
      "Structured hard and soft builder gels designed to reinforce weak natural nails, build elegant apex curves, and maintain natural length.",
    image: "/images/gallery/builder-gel/builder-01.webp",
  },
  {
    id: "ombre",
    name: "Ombre Nails",
    category: "Color Blend & Design",
    tagline: "Seamless Dual-Tone Gradient Transition",
    description:
      "A smooth blend between two complementary shades—from soft pink-to-white baby boomer gradients to dramatic customized color fades.",
    image: "/images/gallery/ombre/ombre-01.webp",
  },
  {
    id: "pink-white",
    name: "Pink & White",
    category: "Timeless French Extensions",
    tagline: "Permanent Sharp Smile Lines",
    description:
      "The quintessential American luxury full set. Sculpted with permanent white tips and translucent pink bases that never chip or yellow.",
    image: "/images/gallery/pink-white/pink-white-02.webp",
  },
  {
    id: "powder-color",
    name: "Powder Color",
    category: "Colored Enhancements",
    tagline: "Vibrant Pigments Infused Throughout",
    description:
      "Full sets and refills created with pigmented acrylic and dipping powders, delivering rich, consistent color that never chips away.",
    image: "/images/gallery/color-powder/color-powder-01.webp",
  },
  {
    id: "waxing",
    name: "Waxing Services",
    category: "Facial & Body Smoothing",
    tagline: "Gentle, Hygienic Hair Removal",
    description:
      "Professional facial and body waxing in a private, clean treatment room. Includes brows, lip, chin, legs, bikini line, and men's back waxing.",
    image: "/images/gallery/waxing/waxing-02.webp",
  },
];

export interface ServiceCategory {
  id: string;
  title: string;
  tagline: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
  items: string[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: "nail-enhancements",
    title: "Nail Enhancements",
    tagline: "Full Sets, Extensions & Custom Artistry",
    description:
      "Long-lasting strength, sculpted length, and creative finishes designed to match your individual style. From classic acrylics and dipping powder to builder gels and custom nail art.",
    image: {
      src: "/images/gallery/acrylic/acrylic-03.webp",
      alt: "Sculpted nail enhancements with elegant marble and gold accents",
    },
    items: [
      "Acrylic Powder",
      "Dipping Powder",
      "Tap Gel",
      "Builder Gel",
      "Pink & White",
      "Ombre",
      "Color Powder",
      "French Tips",
      "Custom Nail Designs",
    ],
  },
  {
    id: "manicure",
    title: "Manicure",
    tagline: "Careful Shaping, Cuticle Care & High-Shine Finish",
    description:
      "Gentle hand treatments with precise cuticle care, natural nail shaping, soothing moisture, and your choice of long-wear gel or classic lacquer.",
    image: {
      src: "/images/gallery/classic-manicure/classic-02.webp",
      alt: "Professional manicure and precision polish application",
    },
    items: [
      "Classic Manicure",
      "Gel Manicure",
      "Nail Polish Change",
      "Gel Polish Change",
      "Nail Removal",
    ],
  },
  {
    id: "pedicure",
    title: "Pedicure",
    tagline: "Relaxing Foot Soaks, Exfoliation & Massage",
    description:
      "Soothing foot spa treatments designed to relieve fatigue, smooth tired skin, and leave your toenails immaculately groomed and polished.",
    image: {
      src: "/images/gallery/spa-pedicure/pedicure-01.webp",
      alt: "Relaxing foot spa pedicure with fresh flowers and warm water",
    },
    items: [
      "Regular Pedicure",
      "Deluxe Pedicure",
      "Luxury Spa Pedicure",
      "Pedicure with Gel Polish",
    ],
  },
  {
    id: "waxing",
    title: "Waxing",
    tagline: "Smooth Facial & Full Body Hair Removal",
    description:
      "Hygienic, gentle wax treatments for smooth, radiant skin. Performed in a private, clean, and comfortable setting with skin-calming finishes.",
    image: {
      src: "/images/gallery/waxing/waxing-02.webp",
      alt: "Clean spa treatment environment with soothing towels and skincare",
    },
    items: [
      "Eyebrow Waxing",
      "Upper Lip",
      "Chin",
      "Sideburn",
      "Full Facial",
      "Bikini Line",
      "Half Legs",
      "Full Legs",
      "Underarms",
      "Brazilian Bikini",
      "Back Waxing",
    ],
  },
  {
    id: "mens-services",
    title: "Men's Services",
    tagline: "Clean, Disciplined Grooming for Hands & Feet",
    description:
      "Tailored nail and foot care designed for gentlemen. Focused on clean cuticle maintenance, smooth nails, heel care, and muscle relaxation.",
    image: {
      src: "/images/gallery/classic-manicure/classic-03.webp",
      alt: "Clean hand and nail grooming treatment",
    },
    items: [
      "Sport Manicure",
      "Sport Pedicure",
      "Back Waxing",
    ],
  },
];

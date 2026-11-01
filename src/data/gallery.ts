/**
 * ============================================================
 *  SHORE NAILS — REFINED 45-PHOTO GALLERY DATA (15 CATEGORIES)
 * ============================================================
 *
 * 45 unique, non-duplicated high-resolution photos
 * 15 distinct categories (3 unique photos per category)
 * All images professionally curated from Unsplash and Pexels
 * Optimized WebP format stored locally in public/images/gallery/<category>/
 */

export const galleryCategories = [
  "Acrylic Powder Nails",
  "Dipping Powder Nails",
  "Tap Gel Nails",
  "Builder Gel Nails",
  "Ombre Nails",
  "Pink & White",
  "Color Powder Nails",
  "French & Color Tip",
  "Gel Manicure",
  "Classic Manicure",
  "Spa Pedicure",
  "Nail Art & Design",
  "Minimalist & Clean",
  "Luxury & Bridal Nails",
  "Waxing Services"
] as const;

export type GalleryCategory = (typeof galleryCategories)[number];

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  category: GalleryCategory;
  width: number;
  height: number;
  author: string;
  sourceUrl: string;
  license: string;
}

export const galleryItems: GalleryItem[] = [
  {
    "id": "gallery-01",
    "src": "/images/gallery/acrylic/acrylic-01.webp",
    "alt": "Sculpted dramatic coffin acrylic full set with balanced apex",
    "title": "Sculpted Coffin Acrylic Full Set",
    "category": "Acrylic Powder Nails",
    "width": 800,
    "height": 1200,
    "author": "Cottonbro Studio",
    "sourceUrl": "https://www.pexels.com/photo/3992856/",
    "license": "Pexels License"
  },
  {
    "id": "gallery-02",
    "src": "/images/gallery/acrylic/acrylic-02.webp",
    "alt": "Long sculpted almond acrylic extensions with high gloss finish and rings",
    "title": "Sculpted Almond Acrylic Extensions",
    "category": "Acrylic Powder Nails",
    "width": 1200,
    "height": 798,
    "author": "Daiga Ellaby",
    "sourceUrl": "https://unsplash.com/photos/photo-1506152983158-b4a74a01c721",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-03",
    "src": "/images/gallery/acrylic/acrylic-03.webp",
    "alt": "Nail technician meticulously shaping sculpted acrylic powder nails",
    "title": "Acrylic Powder Sculpt & Shaping",
    "category": "Acrylic Powder Nails",
    "width": 1200,
    "height": 800,
    "author": "Giorgio Trovato",
    "sourceUrl": "https://unsplash.com/photos/photo-1632345031435-8727f6897d53",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-04",
    "src": "/images/gallery/dipping/dipping-01.webp",
    "alt": "Soft natural nude dipping powder manicure on almond shaped nails",
    "title": "Natural Almond Dip Powder",
    "category": "Dipping Powder Nails",
    "width": 1200,
    "height": 675,
    "author": "Chelson Tamares",
    "sourceUrl": "https://unsplash.com/photos/photo-1610992015732-2449b76344bc",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-05",
    "src": "/images/gallery/dipping/dipping-02.webp",
    "alt": "Flawless blush pink dipping powder coat with high gloss finish",
    "title": "Blush Pink Dipping Finish",
    "category": "Dipping Powder Nails",
    "width": 800,
    "height": 1200,
    "author": "Allison Saeng",
    "sourceUrl": "https://unsplash.com/photos/photo-1604902396830-aca29e19b067",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-06",
    "src": "/images/gallery/dipping/dipping-03.webp",
    "alt": "Salon technician applying dipping powder layer on manicured nails",
    "title": "Precision Dipping Powder Application",
    "category": "Dipping Powder Nails",
    "width": 842,
    "height": 1200,
    "author": "Curology",
    "sourceUrl": "https://unsplash.com/photos/photo-1599206676335-193c82b13c9e",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-07",
    "src": "/images/gallery/tap-gel/tap-gel-01.webp",
    "alt": "Applying smooth tap gel overlay with fine bristle brush",
    "title": "Precision Brush Tap Gel Overlay",
    "category": "Tap Gel Nails",
    "width": 1200,
    "height": 798,
    "author": "Krisztina Papp",
    "sourceUrl": "https://unsplash.com/photos/photo-1659391542239-9648f307c0b1",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-08",
    "src": "/images/gallery/tap-gel/tap-gel-02.webp",
    "alt": "Smooth reinforced tap gel overlay on sculpted manicured nails",
    "title": "Reinforced Tap Gel Full Set",
    "category": "Tap Gel Nails",
    "width": 800,
    "height": 1200,
    "author": "Krisztina Papp",
    "sourceUrl": "https://unsplash.com/photos/photo-1583001809873-a128495da465",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-09",
    "src": "/images/gallery/tap-gel/tap-gel-03.webp",
    "alt": "Tap gel nail set curing under professional salon LED lamp",
    "title": "Tap Gel UV LED Curing",
    "category": "Tap Gel Nails",
    "width": 1200,
    "height": 803,
    "author": "Ivan Samkov",
    "sourceUrl": "https://www.pexels.com/photo/6830805/",
    "license": "Pexels License"
  },
  {
    "id": "gallery-10",
    "src": "/images/gallery/builder-gel/builder-01.webp",
    "alt": "Reinforced builder gel apex sculpting on nude almond nails",
    "title": "Structured Apex Builder Gel",
    "category": "Builder Gel Nails",
    "width": 752,
    "height": 1200,
    "author": "Chelson Tamares",
    "sourceUrl": "https://unsplash.com/photos/photo-1610992015762-45dca7fa3a85",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-11",
    "src": "/images/gallery/builder-gel/builder-02.webp",
    "alt": "Reinforced hard builder gel overlay with smooth apex and natural finish",
    "title": "Structured Hard Gel Apex Overlay",
    "category": "Builder Gel Nails",
    "width": 900,
    "height": 1200,
    "author": "Cottonbro Studio",
    "sourceUrl": "https://www.pexels.com/photo/3993322/",
    "license": "Pexels License"
  },
  {
    "id": "gallery-12",
    "src": "/images/gallery/builder-gel/builder-03.webp",
    "alt": "Flawless builder gel overlay fortifying natural nails with glossy shine",
    "title": "Natural Builder Gel Foundation",
    "category": "Builder Gel Nails",
    "width": 1200,
    "height": 798,
    "author": "Daiga Ellaby",
    "sourceUrl": "https://unsplash.com/photos/photo-1562967914-608f82629710",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-13",
    "src": "/images/gallery/ombre/ombre-01.webp",
    "alt": "Soft gradient pastel ombre manicure with silver glitter transition",
    "title": "Soft Pastel Ombre Blend",
    "category": "Ombre Nails",
    "width": 1200,
    "height": 1200,
    "author": "Sarah Haimes",
    "sourceUrl": "https://unsplash.com/photos/photo-1607779097040-26e80aa78e66",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-14",
    "src": "/images/gallery/ombre/ombre-02.webp",
    "alt": "Artistic multi-tone gradient fade nail art",
    "title": "Vibrant Color Gradient Fade",
    "category": "Ombre Nails",
    "width": 800,
    "height": 1200,
    "author": "Daiga Ellaby",
    "sourceUrl": "https://unsplash.com/photos/photo-1571290274554-6a2eaa771e5f",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-15",
    "src": "/images/gallery/ombre/ombre-03.webp",
    "alt": "Delicate baby boomer French ombre transition from soft pink to white",
    "title": "Baby Boomer French Ombre",
    "category": "Ombre Nails",
    "width": 800,
    "height": 1200,
    "author": "Anna Nekrashevich",
    "sourceUrl": "https://www.pexels.com/photo/7683058/",
    "license": "Pexels License"
  },
  {
    "id": "gallery-16",
    "src": "/images/gallery/pink-white/pink-white-01.webp",
    "alt": "Crisp sculpted Pink and White French manicure with sharp smile line",
    "title": "Classic Pink & White French Set",
    "category": "Pink & White",
    "width": 800,
    "height": 1200,
    "author": "Cottonbro Studio",
    "sourceUrl": "https://www.pexels.com/photo/3993448/",
    "license": "Pexels License"
  },
  {
    "id": "gallery-17",
    "src": "/images/gallery/pink-white/pink-white-02.webp",
    "alt": "American style Pink and White full set with soft natural smile line",
    "title": "American Pink & White Full Set",
    "category": "Pink & White",
    "width": 800,
    "height": 1200,
    "author": "Fleur Kaan",
    "sourceUrl": "https://unsplash.com/photos/photo-1617897903246-719242758050",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-18",
    "src": "/images/gallery/pink-white/pink-white-03.webp",
    "alt": "Salon technician perfecting a pink and white French manicure",
    "title": "Sculpted Pink & White Polish",
    "category": "Pink & White",
    "width": 675,
    "height": 1200,
    "author": "Cottonbro Studio",
    "sourceUrl": "https://www.pexels.com/photo/22668317/",
    "license": "Pexels License"
  },
  {
    "id": "gallery-19",
    "src": "/images/gallery/color-powder/color-powder-01.webp",
    "alt": "Rich pigmented color powder nail design with mirror shine",
    "title": "Pigmented Color Powder Full Set",
    "category": "Color Powder Nails",
    "width": 1200,
    "height": 800,
    "author": "Theme Photos",
    "sourceUrl": "https://unsplash.com/photos/photo-1595867818082-083862f3d630",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-20",
    "src": "/images/gallery/color-powder/color-powder-02.webp",
    "alt": "Vibrant color powder shades display in professional salon",
    "title": "Color Gel Powder Palette",
    "category": "Color Powder Nails",
    "width": 800,
    "height": 1200,
    "author": "Theme Photos",
    "sourceUrl": "https://unsplash.com/photos/photo-1599948128020-9a44505b0d1b",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-21",
    "src": "/images/gallery/color-powder/color-powder-03.webp",
    "alt": "Deep wine red color powder manicure on oval nails",
    "title": "Deep Wine Color Powder Nails",
    "category": "Color Powder Nails",
    "width": 800,
    "height": 1200,
    "author": "Element5 Digital",
    "sourceUrl": "https://www.pexels.com/photo/3997384/",
    "license": "Pexels License"
  },
  {
    "id": "gallery-22",
    "src": "/images/gallery/french/french-01.webp",
    "alt": "Modern salon French manicure with crisp white tips on healthy nude base",
    "title": "Modern Crisp French Tips",
    "category": "French & Color Tip",
    "width": 800,
    "height": 1200,
    "author": "Element5 Digital",
    "sourceUrl": "https://www.pexels.com/photo/3997381/",
    "license": "Pexels License"
  },
  {
    "id": "gallery-23",
    "src": "/images/gallery/french/french-02.webp",
    "alt": "Delicate micro French tips on clean almond shaped nails",
    "title": "Neutral Micro French Tips",
    "category": "French & Color Tip",
    "width": 800,
    "height": 1200,
    "author": "Cottonbro Studio",
    "sourceUrl": "https://www.pexels.com/photo/3993447/",
    "license": "Pexels License"
  },
  {
    "id": "gallery-24",
    "src": "/images/gallery/french/french-03.webp",
    "alt": "Timeless curved smile line French manicure with high-gloss topcoat",
    "title": "Curved Smile Line French Manicure",
    "category": "French & Color Tip",
    "width": 1200,
    "height": 800,
    "author": "Daria Shevtsova",
    "sourceUrl": "https://www.pexels.com/photo/939836/",
    "license": "Pexels License"
  },
  {
    "id": "gallery-25",
    "src": "/images/gallery/gel-manicure/gel-01.webp",
    "alt": "Professional nail filing and cuticle preparation for gel manicure",
    "title": "Precision Gel Edge Grooming",
    "category": "Gel Manicure",
    "width": 800,
    "height": 1200,
    "author": "Pavel Danilyuk",
    "sourceUrl": "https://www.pexels.com/photo/16041439/",
    "license": "Pexels License"
  },
  {
    "id": "gallery-26",
    "src": "/images/gallery/gel-manicure/gel-02.webp",
    "alt": "Nail technician applying rich glossy gel polish with fine bristle brush",
    "title": "Precision Gel Polish Application",
    "category": "Gel Manicure",
    "width": 800,
    "height": 1200,
    "author": "Element5 Digital",
    "sourceUrl": "https://www.pexels.com/photo/3997382/",
    "license": "Pexels License"
  },
  {
    "id": "gallery-27",
    "src": "/images/gallery/gel-manicure/gel-03.webp",
    "alt": "Chip-resistant cured gel manicure in neutral tone",
    "title": "Long-Wear Gel Lacquer",
    "category": "Gel Manicure",
    "width": 1200,
    "height": 800,
    "author": "Allef Vinicius",
    "sourceUrl": "https://unsplash.com/photos/photo-1600428877878-1a0fd85beda8",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-28",
    "src": "/images/gallery/classic-manicure/classic-01.webp",
    "alt": "Meticulous cuticle care and natural nail shaping during a classic manicure",
    "title": "Natural Cuticle Grooming & Shaping",
    "category": "Classic Manicure",
    "width": 1200,
    "height": 801,
    "author": "Element5 Digital",
    "sourceUrl": "https://unsplash.com/photos/photo-1522337660859-02fbefca4702",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-29",
    "src": "/images/gallery/classic-manicure/classic-02.webp",
    "alt": "Relaxing salon hand care and classic nail grooming session",
    "title": "Relaxing Hand Treatment",
    "category": "Classic Manicure",
    "width": 1200,
    "height": 801,
    "author": "Element5 Digital",
    "sourceUrl": "https://unsplash.com/photos/photo-1522337360788-8b13dee7a37e",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-30",
    "src": "/images/gallery/classic-manicure/classic-03.webp",
    "alt": "Clean polish finish and hand lotion treatment",
    "title": "Classic Nail Polish Application",
    "category": "Classic Manicure",
    "width": 1200,
    "height": 864,
    "author": "Laura Chouette",
    "sourceUrl": "https://unsplash.com/photos/photo-1515688594390-b649af70d282",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-31",
    "src": "/images/gallery/spa-pedicure/pedicure-01.webp",
    "alt": "Warm foot soak bath with fresh orchid petals and essential oils",
    "title": "Botanical Orchid Foot Soak",
    "category": "Spa Pedicure",
    "width": 1200,
    "height": 801,
    "author": "Conscious Design",
    "sourceUrl": "https://unsplash.com/photos/photo-1519415510236-718bdfcd89c8",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-32",
    "src": "/images/gallery/spa-pedicure/pedicure-02.webp",
    "alt": "Foot exfoliation scrub and smoothing pedicure service",
    "title": "Revitalizing Foot Exfoliation",
    "category": "Spa Pedicure",
    "width": 800,
    "height": 1200,
    "author": "Juan Vargas",
    "sourceUrl": "https://www.pexels.com/photo/17056222/",
    "license": "Pexels License"
  },
  {
    "id": "gallery-33",
    "src": "/images/gallery/spa-pedicure/pedicure-03.webp",
    "alt": "Beautician applying smooth nail polish during pedicure treatment",
    "title": "Deluxe Toenail Polish Finish",
    "category": "Spa Pedicure",
    "width": 1200,
    "height": 800,
    "author": "Ivan Samkov",
    "sourceUrl": "https://www.pexels.com/photo/4960359/",
    "license": "Pexels License"
  },
  {
    "id": "gallery-34",
    "src": "/images/gallery/nail-art/nail-art-01.webp",
    "alt": "Custom hand-painted modern geometric line art on manicured nails",
    "title": "Modern Geometric Nail Art",
    "category": "Nail Art & Design",
    "width": 800,
    "height": 1200,
    "author": "Cottonbro Studio",
    "sourceUrl": "https://www.pexels.com/photo/3992857/",
    "license": "Pexels License"
  },
  {
    "id": "gallery-35",
    "src": "/images/gallery/nail-art/nail-art-02.webp",
    "alt": "Custom red and white typography lettering nail art",
    "title": "Custom Statement Lettering Art",
    "category": "Nail Art & Design",
    "width": 1200,
    "height": 800,
    "author": "Kristina Paukshtite",
    "sourceUrl": "https://unsplash.com/photos/photo-1519014816548-bf5fe059798b",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-36",
    "src": "/images/gallery/nail-art/nail-art-03.webp",
    "alt": "Close-up of creative colorful geometric abstract nail art",
    "title": "Abstract Geometric Artistry",
    "category": "Nail Art & Design",
    "width": 800,
    "height": 1200,
    "author": "Cottonbro Studio",
    "sourceUrl": "https://www.pexels.com/photo/5871743/",
    "license": "Pexels License"
  },
  {
    "id": "gallery-37",
    "src": "/images/gallery/minimalist/minimalist-01.webp",
    "alt": "Clean minimal manicure with soft yellow tips and delicate micro-dots",
    "title": "Subtle Yellow Dot Minimalist",
    "category": "Minimalist & Clean",
    "width": 800,
    "height": 1200,
    "author": "Daiga Ellaby",
    "sourceUrl": "https://unsplash.com/photos/photo-1601244668565-afba8cbd2b51",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-38",
    "src": "/images/gallery/minimalist/minimalist-02.webp",
    "alt": "Chic negative space minimalist nail art with delicate micro-dots",
    "title": "Negative Space Micro-Dot Art",
    "category": "Minimalist & Clean",
    "width": 800,
    "height": 1200,
    "author": "Cottonbro Studio",
    "sourceUrl": "https://www.pexels.com/photo/3992864/",
    "license": "Pexels License"
  },
  {
    "id": "gallery-39",
    "src": "/images/gallery/minimalist/minimalist-03.webp",
    "alt": "Understated sheer neutral manicure on neat natural square nails",
    "title": "Clean Neutral Sheer Manicure",
    "category": "Minimalist & Clean",
    "width": 1200,
    "height": 800,
    "author": "Brigitte Tohm",
    "sourceUrl": "https://unsplash.com/photos/photo-1526045612212-70caf35c14df",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-40",
    "src": "/images/gallery/luxury/luxury-01.webp",
    "alt": "Rich tortoiseshell and glossy onyx nail designs with gold ring styling",
    "title": "Tortoiseshell & Onyx Luxury Set",
    "category": "Luxury & Bridal Nails",
    "width": 800,
    "height": 1200,
    "author": "Allef Vinicius",
    "sourceUrl": "https://unsplash.com/photos/photo-1604654894610-df63bc536371",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-41",
    "src": "/images/gallery/luxury/luxury-02.webp",
    "alt": "Luminous pearlescent bridal manicure with delicate accessories",
    "title": "Pearlescent Bridal Manicure",
    "category": "Luxury & Bridal Nails",
    "width": 900,
    "height": 1200,
    "author": "Mathilde Langevin",
    "sourceUrl": "https://unsplash.com/photos/photo-1598440947619-2c35fc9aa908",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-42",
    "src": "/images/gallery/luxury/luxury-03.webp",
    "alt": "Opulent luxury nail set with gold accents and high-fashion finish",
    "title": "Embellished Luxury Nail Set",
    "category": "Luxury & Bridal Nails",
    "width": 800,
    "height": 1200,
    "author": "Cottonbro Studio",
    "sourceUrl": "https://www.pexels.com/photo/3992862/",
    "license": "Pexels License"
  },
  {
    "id": "gallery-43",
    "src": "/images/gallery/waxing/waxing-01.webp",
    "alt": "Clean spa treatment environment with soothing towels, warm botanical oils, and skincare",
    "title": "Botanical Spa Waxing Preparation",
    "category": "Waxing Services",
    "width": 1200,
    "height": 800,
    "author": "Content Pixie",
    "sourceUrl": "https://unsplash.com/photos/photo-1616394584738-fc6e612e71b9",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-44",
    "src": "/images/gallery/waxing/waxing-02.webp",
    "alt": "Calm aesthetic facial skin treatment and gentle eyebrow waxing preparation",
    "title": "Gentle Facial & Eyebrow Care",
    "category": "Waxing Services",
    "width": 1200,
    "height": 800,
    "author": "Jernej Graj",
    "sourceUrl": "https://unsplash.com/photos/photo-1570172619644-dfd03ed5d881",
    "license": "Unsplash License"
  },
  {
    "id": "gallery-45",
    "src": "/images/gallery/waxing/waxing-03.webp",
    "alt": "Gentle facial and body waxing post-treatment with calming botanical hydration",
    "title": "Soothing Post-Wax Skin Therapy",
    "category": "Waxing Services",
    "width": 1200,
    "height": 800,
    "author": "Rochelle Brown",
    "sourceUrl": "https://unsplash.com/photos/photo-1582095133179-bfd08e2fc6b3",
    "license": "Unsplash License"
  }
];

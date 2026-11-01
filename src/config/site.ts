/**
 * ============================================================
 *  SHORE NAILS — OFFICIAL BUSINESS CONFIGURATION
 * ============================================================
 *
 * Official business details for Shore Nails in Northfield, NJ.
 * All details here are displayed across the header, hero,
 * contact, map, footer, and SEO metadata.
 */

export const siteConfig = {
  /** Official salon brand name */
  name: "SHORE NAILS",
  shortName: "Shore Nails",

  /** Tagline */
  tagline: "Nail Care & Spa Waxing",

  /** Local community location */
  cityState: "Northfield, New Jersey",
  shortLocation: "Northfield, NJ",

  /** SEO & promotional description */
  description:
    "Visit Shore Nails in Northfield, New Jersey for professional manicures, pedicures, gel nails, acrylic nails, nail enhancements, waxing, and relaxing spa services.",

  /** Website URL for metadata */
  url: "https://www.shorenailsnj.com",

  contact: {
    /** Formatted telephone display */
    phoneDisplay: "+1 (609) 407-0072",
    /** Dialable telephone link */
    phoneLink: "+16094070072",

    /** Physical location */
    address: {
      businessName: "SHORENAILS",
      street: "512 New Road",
      city: "Northfield",
      state: "New Jersey",
      stateAbbr: "NJ",
      zip: "08225",
      country: "USA",
      full: "512 New Road, Northfield, New Jersey 08225, USA",
      short: "512 New Road, Northfield, NJ 08225",
    },

    /** Google Maps Directions URL */
    googleMapsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=512+New+Road,+Northfield,+NJ+08225",

    /** Apple Maps URL */
    appleMapsUrl:
      "https://maps.apple.com/?address=512%20New%20Road,%20Northfield,%20NJ%2008225",

    /** Safe embed URL for Google Maps without requiring a private API key */
    embedMapUrl:
      "https://maps.google.com/maps?q=512+New+Road,+Northfield,+NJ+08225&t=&z=15&ie=UTF8&iwloc=&output=embed",

    /** Note regarding opening hours */
    hoursNotice:
      "Please call us at (609) 407-0072 for current hours and walk-in availability.",
  },

  /** Official Social Media */
  social: {
    facebook: {
      name: "ShoreNails Waxing",
      url: "https://www.facebook.com/profile.php?id=61591942442581",
    },
    instagram: {
      handle: "@hannah.shorenails",
      url: "https://www.instagram.com/hannah.shorenails/",
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;

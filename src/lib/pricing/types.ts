export type PricingFormat = "fixed" | "starting" | "range" | "custom" | "contact";

/**
 * Service record as stored in Supabase `pricing_services` table.
 */
export interface PricingService {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
  price: string;
  price_format: PricingFormat;
  price_amount: number | null;
  price_max: number | null;
  duration: string | null;
  description: string | null;
  is_unconfirmed: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Pricing category structure.
 */
export interface PricingCategory {
  id: string;
  category: string;
  description?: string;
  display_order: number;
  items: PricingService[];
}

/**
 * Public response format for GET /api/prices
 */
export interface PublicPricingResponse {
  configured: boolean;
  categories: {
    id: string;
    category: string;
    description?: string;
    items: {
      id?: string;
      name: string;
      price: string;
      note?: string;
      duration?: string;
      isUnconfirmed?: boolean;
    }[];
  }[];
  totalServices: number;
}

/**
 * Summary metrics for Admin Pricing Dashboard.
 */
export interface AdminPricingSummary {
  totalServices: number;
  publishedCount: number;
  hiddenCount: number;
  categoryCounts: Record<string, number>;
}

/**
 * Admin response for GET /api/admin/prices
 */
export interface AdminPricingResponse {
  configured: boolean;
  categories: {
    id: string;
    category: string;
    description?: string;
    display_order: number;
  }[];
  services: PricingService[];
  summary: AdminPricingSummary;
}

/**
 * Payload for creating or updating a service.
 */
export interface SavePricingServicePayload {
  name: string;
  category_id: string;
  category_name?: string;
  price_format: PricingFormat;
  price_amount?: number | null;
  price_max?: number | null;
  custom_price?: string | null;
  duration?: string | null;
  description?: string | null;
  is_published?: boolean;
  display_order?: number;
}

/**
 * Helper to compute the formatted display string for any price type.
 */
export function formatServicePrice(
  format: PricingFormat,
  amount?: number | null,
  max?: number | null,
  custom?: string | null,
): string {
  switch (format) {
    case "fixed":
      return amount !== undefined && amount !== null ? `$${amount}` : "$0";
    case "starting":
      return amount !== undefined && amount !== null ? `$${amount}+` : "$0+";
    case "range":
      return amount !== undefined && amount !== null && max !== undefined && max !== null
        ? `$${amount}–$${max}`
        : "$0–$0";
    case "contact":
      return "Contact us for pricing";
    case "custom":
      return (custom || "").trim() || "$0";
    default:
      return "$0";
  }
}


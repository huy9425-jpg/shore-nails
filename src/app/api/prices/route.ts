import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { priceList } from "@/data/prices";
import { createAdminServerClient, createPublicServerClient, getSupabaseEnv } from "@/lib/supabase/server";
import type { PublicPricingResponse } from "@/lib/pricing/types";

/**
 * Public GET /api/prices
 * Returns active published salon service prices, grouped by category.
 * Seamlessly falls back to the 45 confirmed baseline prices if Supabase
 * is not configured or table has not yet been created.
 */
export async function GET() {
  await headers();

  const { isConfigured, serviceRoleKey } = getSupabaseEnv();

  // Baseline static fallback
  const fallbackResponse: PublicPricingResponse = {
    configured: isConfigured,
    categories: priceList,
    totalServices: priceList.reduce((acc, cat) => acc + cat.items.length, 0),
  };

  if (!isConfigured) {
    return NextResponse.json(fallbackResponse, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=59" },
    });
  }

  try {
    const supabase = serviceRoleKey ? createAdminServerClient() : createPublicServerClient();

    if (!supabase) {
      return NextResponse.json(fallbackResponse, { status: 200 });
    }

    // 1. Fetch categories
    const { data: catRows, error: catErr } = await supabase
      .from("pricing_categories")
      .select("id, category, description, display_order")
      .order("display_order", { ascending: true });

    if (catErr || !catRows || catRows.length === 0) {
      return NextResponse.json(fallbackResponse, { status: 200 });
    }

    // 2. Fetch published services
    const { data: serviceRows, error: servErr } = await supabase
      .from("pricing_services")
      .select("id, name, category_id, price, duration, description, is_unconfirmed, display_order")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (servErr || !serviceRows || serviceRows.length === 0) {
      return NextResponse.json(fallbackResponse, { status: 200 });
    }

    // 3. Group services by category
    const categoryMap = new Map<
      string,
      {
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
      }
    >();

    for (const cat of catRows) {
      categoryMap.set(cat.id, {
        id: cat.id,
        category: cat.category,
        description: cat.description || undefined,
        items: [],
      });
    }

    for (const s of serviceRows) {
      const cat = categoryMap.get(s.category_id);
      if (cat) {
        cat.items.push({
          id: s.id,
          name: s.name,
          price: s.price,
          note: s.description || undefined,
          duration: s.duration || undefined,
          isUnconfirmed: Boolean(s.is_unconfirmed),
        });
      }
    }

    const categories = Array.from(categoryMap.values()).filter(
      (c) => c.items.length > 0,
    );

    const totalServices = categories.reduce(
      (acc, c) => acc + c.items.length,
      0,
    );

    return NextResponse.json(
      {
        configured: true,
        categories,
        totalServices,
      },
      {
        status: 200,
        headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59" },
      },
    );
  } catch {
    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}


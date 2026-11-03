import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminServerClient, verifyAdminRequest } from "@/lib/supabase/server";
import {
  formatServicePrice,
  type AdminPricingResponse,
  type AdminPricingSummary,
  type PricingService,
  type SavePricingServicePayload,
} from "@/lib/pricing/types";

/**
 * GET /api/admin/prices
 * Returns all pricing services (published & hidden), categories, and summary metrics.
 * Protected by verifyAdminRequest.
 */
export async function GET(request: Request) {
  await headers();

  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: auth.status });
  }

  const adminClient = createAdminServerClient(auth.accessToken);
  if (!adminClient) {
    return NextResponse.json({ error: "Database client unavailable" }, { status: 503 });
  }

  try {
    // 1. Fetch categories
    const { data: catRows, error: catErr } = await adminClient
      .from("pricing_categories")
      .select("id, category, description, display_order")
      .order("display_order", { ascending: true });

    if (catErr) {
      if (catErr.code === "42P01" || catErr.message?.includes("does not exist")) {
        return NextResponse.json({
          configured: false,
          needsMigration: true,
          error: "The pricing_services table does not exist in Supabase yet. Please run the SQL migration.",
          categories: [],
          services: [],
          summary: {
            totalServices: 0,
            publishedCount: 0,
            hiddenCount: 0,
            categoryCounts: {},
          },
        });
      }
      throw catErr;
    }

    // 2. Fetch all services
    const { data: serviceRows, error: servErr } = await adminClient
      .from("pricing_services")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (servErr) throw servErr;

    const services: PricingService[] = (serviceRows ?? []).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      category_id: String(row.category_id),
      category_name: String(row.category_name),
      price: String(row.price),
      price_format: row.price_format,
      price_amount: row.price_amount !== null ? Number(row.price_amount) : null,
      price_max: row.price_max !== null ? Number(row.price_max) : null,
      duration: row.duration ? String(row.duration) : null,
      description: row.description ? String(row.description) : null,
      is_unconfirmed: Boolean(row.is_unconfirmed),
      is_published: Boolean(row.is_published),
      display_order: Number(row.display_order || 0),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
    }));

    const categoryCounts: Record<string, number> = {};
    let publishedCount = 0;
    let hiddenCount = 0;

    for (const s of services) {
      if (s.is_published) publishedCount++;
      else hiddenCount++;

      categoryCounts[s.category_id] = (categoryCounts[s.category_id] || 0) + 1;
    }

    const summary: AdminPricingSummary = {
      totalServices: services.length,
      publishedCount,
      hiddenCount,
      categoryCounts,
    };

    const response: AdminPricingResponse = {
      configured: true,
      categories: catRows ?? [],
      services,
      summary,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load pricing services";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/prices
 * Creates a new service in pricing_services.
 * Protected by verifyAdminRequest.
 */
export async function POST(request: Request) {
  await headers();

  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: auth.status });
  }

  const adminClient = createAdminServerClient(auth.accessToken);
  if (!adminClient) {
    return NextResponse.json({ error: "Database client unavailable" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as SavePricingServicePayload;
    const cleanName = (body.name || "").trim();
    const categoryId = (body.category_id || "").trim();

    if (!cleanName || cleanName.length < 2 || cleanName.length > 120) {
      return NextResponse.json({ error: "Service name must be between 2 and 120 characters." }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ error: "Please select a service category." }, { status: 400 });
    }

    // Validate prices
    const format = body.price_format || "fixed";
    const amount = body.price_amount !== undefined && body.price_amount !== null ? Number(body.price_amount) : null;
    const max = body.price_max !== undefined && body.price_max !== null ? Number(body.price_max) : null;

    if (amount !== null && amount < 0) {
      return NextResponse.json({ error: "Price cannot be negative." }, { status: 400 });
    }

    if (max !== null && max < 0) {
      return NextResponse.json({ error: "Maximum price cannot be negative." }, { status: 400 });
    }

    if (format === "range" && amount !== null && max !== null && max < amount) {
      return NextResponse.json({ error: "Maximum price must be greater than or equal to minimum price." }, { status: 400 });
    }

    // Fetch category name
    const { data: catData, error: catError } = await adminClient
      .from("pricing_categories")
      .select("category")
      .eq("id", categoryId)
      .single();

    if (catError || !catData) {
      return NextResponse.json({ error: "Invalid category selected." }, { status: 400 });
    }

    const formattedPrice = formatServicePrice(format, amount, max, body.custom_price);

    const { data: inserted, error: insertError } = await adminClient
      .from("pricing_services")
      .insert({
        name: cleanName,
        category_id: categoryId,
        category_name: catData.category,
        price: formattedPrice,
        price_format: format,
        price_amount: amount,
        price_max: max,
        duration: body.duration ? body.duration.trim() : null,
        description: body.description ? body.description.trim() : null,
        is_unconfirmed: format === "contact",
        is_published: body.is_published !== false,
        display_order: body.display_order ?? 99,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Service "${cleanName}" created successfully.`,
        service: inserted,
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create service";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


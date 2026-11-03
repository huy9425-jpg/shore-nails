import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminServerClient, verifyAdminRequest } from "@/lib/supabase/server";
import { formatServicePrice, type SavePricingServicePayload } from "@/lib/pricing/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/prices/[id]
 * Updates an existing service.
 * Protected by verifyAdminRequest.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  await headers();
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing service ID" }, { status: 400 });
  }

  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: auth.status });
  }

  const adminClient = createAdminServerClient(auth.accessToken);
  if (!adminClient) {
    return NextResponse.json({ error: "Database client unavailable" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as Partial<SavePricingServicePayload>;
    const updates: Record<string, unknown> = {};

    if (typeof body.name === "string") {
      const cleanName = body.name.trim();
      if (cleanName.length < 2 || cleanName.length > 120) {
        return NextResponse.json({ error: "Service name must be between 2 and 120 characters." }, { status: 400 });
      }
      updates.name = cleanName;
    }

    if (typeof body.category_id === "string") {
      const catId = body.category_id.trim();
      const { data: catData, error: catError } = await adminClient
        .from("pricing_categories")
        .select("category")
        .eq("id", catId)
        .single();

      if (catError || !catData) {
        return NextResponse.json({ error: "Invalid category selected." }, { status: 400 });
      }
      updates.category_id = catId;
      updates.category_name = catData.category;
    }

    if (body.price_format) {
      const format = body.price_format;
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

      updates.price_format = format;
      updates.price_amount = amount;
      updates.price_max = max;
      updates.price = formatServicePrice(format, amount, max, body.custom_price);
      updates.is_unconfirmed = format === "contact";
    }

    if (typeof body.duration === "string") {
      updates.duration = body.duration.trim() || null;
    } else if (body.duration === null) {
      updates.duration = null;
    }

    if (typeof body.description === "string") {
      updates.description = body.description.trim() || null;
    } else if (body.description === null) {
      updates.description = null;
    }

    if (typeof body.is_published === "boolean") {
      updates.is_published = body.is_published;
    }

    if (typeof body.display_order === "number") {
      updates.display_order = body.display_order;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update provided." }, { status: 400 });
    }

    const { data: updated, error } = await adminClient
      .from("pricing_services")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Service updated successfully.",
      service: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update service";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/prices/[id]
 * Deletes a service from pricing_services.
 * Protected by verifyAdminRequest.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  await headers();
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing service ID" }, { status: 400 });
  }

  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: auth.status });
  }

  const adminClient = createAdminServerClient(auth.accessToken);
  if (!adminClient) {
    return NextResponse.json({ error: "Database client unavailable" }, { status: 503 });
  }

  try {
    const { error } = await adminClient
      .from("pricing_services")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete service";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


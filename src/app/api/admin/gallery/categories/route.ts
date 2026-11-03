import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { galleryCategories } from "@/data/gallery";
import { createAdminServerClient, verifyAdminRequest } from "@/lib/supabase/server";

/**
 * GET /api/admin/gallery/categories
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
    const categories = new Set<string>(galleryCategories);

    const { data, error } = await adminClient
      .from("gallery_categories")
      .select("id, name, slug, display_order, is_system")
      .order("display_order", { ascending: true });

    if (!error && Array.isArray(data)) {
      for (const row of data) {
        if (row.name) categories.add(String(row.name).trim());
      }
    }

    return NextResponse.json({
      categories: Array.from(categories),
      details: data ?? [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/gallery/categories
 * Adds a new custom category.
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
    const { name } = (await request.json()) as { name?: string };
    const cleanName = String(name || "").trim();

    if (!cleanName || cleanName.length < 2 || cleanName.length > 60) {
      return NextResponse.json({ error: "Category name must be between 2 and 60 characters." }, { status: 400 });
    }

    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const { data: inserted, error } = await adminClient
      .from("gallery_categories")
      .insert({
        name: cleanName,
        slug: slug || `cat-${Date.now()}`,
        display_order: 99,
        is_system: false,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "A category with this name already exists." }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Category "${cleanName}" created successfully.`,
      category: inserted,
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

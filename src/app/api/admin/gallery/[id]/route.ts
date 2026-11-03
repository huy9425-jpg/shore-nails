import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminServerClient, verifyAdminRequest } from "@/lib/supabase/server";
import type { UpdateGalleryPhotoPayload } from "@/lib/gallery/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/gallery/[id]
 * Updates metadata (title, category, is_published, display_order, alt_text).
 * Protected by verifyAdminRequest.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  await headers();
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing photo ID" }, { status: 400 });
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
    const body = (await request.json()) as UpdateGalleryPhotoPayload;
    const updates: Record<string, unknown> = {};

    if (typeof body.title === "string") {
      const cleanTitle = body.title.trim();
      if (cleanTitle.length < 2 || cleanTitle.length > 120) {
        return NextResponse.json({ error: "Title must be between 2 and 120 characters." }, { status: 400 });
      }
      updates.title = cleanTitle;
    }

    if (typeof body.category === "string") {
      const cleanCategory = body.category.trim();
      if (cleanCategory.length < 2 || cleanCategory.length > 60) {
        return NextResponse.json({ error: "Invalid category name." }, { status: 400 });
      }
      updates.category = cleanCategory;
    }

    if (typeof body.alt_text === "string") {
      updates.alt_text = body.alt_text.trim().slice(0, 250);
    }

    if (typeof body.is_published === "boolean") {
      updates.is_published = body.is_published;
    }

    if (typeof body.is_featured === "boolean") {
      updates.is_featured = body.is_featured;
    }

    if (typeof body.display_order === "number") {
      updates.display_order = body.display_order;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid update fields provided." }, { status: 400 });
    }

    const { data: updated, error } = await adminClient
      .from("gallery_images")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Photo updated successfully.",
      image: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update photo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/gallery/[id]
 * Deletes photo record from database and permanently removes file from Supabase Storage.
 * Protected by verifyAdminRequest.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  await headers();
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing photo ID" }, { status: 400 });
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
    // 1. Fetch photo to get storage path
    const { data: photo, error: fetchError } = await adminClient
      .from("gallery_images")
      .select("id, storage_path")
      .eq("id", id)
      .single();

    if (fetchError || !photo) {
      return NextResponse.json({ error: "Photo not found or already deleted." }, { status: 404 });
    }

    // 2. Delete database record
    const { error: dbDeleteError } = await adminClient
      .from("gallery_images")
      .delete()
      .eq("id", id);

    if (dbDeleteError) {
      return NextResponse.json({ error: dbDeleteError.message }, { status: 500 });
    }

    // 3. Delete from Supabase Storage bucket 'gallery'
    if (photo.storage_path) {
      await adminClient.storage.from("gallery").remove([photo.storage_path]);
    }

    return NextResponse.json({
      success: true,
      message: "Photo deleted successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete photo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

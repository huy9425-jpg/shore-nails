import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { galleryCategories } from "@/data/gallery";
import { createAdminServerClient, verifyAdminRequest } from "@/lib/supabase/server";
import type { AdminGalleryItem, AdminGalleryResponse, AdminGallerySummary } from "@/lib/gallery/types";

/**
 * GET /api/admin/gallery
 * Returns all gallery images (published and hidden), categories, and summary metrics.
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
    const allCategories = new Set<string>(galleryCategories);

    // 1. Fetch categories
    try {
      const { data: dbCategories } = await adminClient
        .from("gallery_categories")
        .select("name, display_order")
        .order("display_order", { ascending: true });

      if (Array.isArray(dbCategories)) {
        for (const cat of dbCategories) {
          if (cat.name) allCategories.add(String(cat.name).trim());
        }
      }
    } catch {
      // Continue with default categories
    }

    // 2. Fetch all images
    const { data: rows, error } = await adminClient
      .from("gallery_images")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return NextResponse.json({
          configured: false,
          needsMigration: true,
          error: "The gallery_images table does not exist in Supabase yet. Please run the SQL migration.",
          images: [],
          categories: Array.from(allCategories),
          summary: {
            totalPhotos: 0,
            publishedCount: 0,
            hiddenCount: 0,
            categoryCounts: {},
          },
        });
      }
      throw error;
    }

    const images: AdminGalleryItem[] = (rows ?? []).map((row) => ({
      id: String(row.id),
      storage_path: String(row.storage_path),
      image_url: String(row.image_url),
      title: String(row.title),
      alt_text: row.alt_text ? String(row.alt_text) : null,
      category: String(row.category),
      width: Number(row.width || 1200),
      height: Number(row.height || 1200),
      file_size: row.file_size ? Number(row.file_size) : null,
      mime_type: row.mime_type ? String(row.mime_type) : "image/webp",
      display_order: Number(row.display_order || 0),
      is_published: Boolean(row.is_published),
      is_featured: Boolean(row.is_featured),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
    }));

    const categoryCounts: Record<string, number> = {};
    let publishedCount = 0;
    let hiddenCount = 0;

    for (const img of images) {
      if (img.is_published) publishedCount++;
      else hiddenCount++;

      categoryCounts[img.category] = (categoryCounts[img.category] || 0) + 1;
      if (img.category) allCategories.add(img.category);
    }

    const summary: AdminGallerySummary = {
      totalPhotos: images.length,
      publishedCount,
      hiddenCount,
      categoryCounts,
    };

    const response: AdminGalleryResponse = {
      configured: true,
      images,
      categories: Array.from(allCategories),
      summary,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load gallery photos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/gallery
 * Uploads a photo file to Supabase Storage and records metadata in gallery_images table.
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
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = String(formData.get("title") || "").trim();
    const category = String(formData.get("category") || "Nail Art & Design").trim();
    const altText = String(formData.get("alt_text") || title).trim();
    const isPublished = formData.get("is_published") !== "false";
    const width = Number(formData.get("width") || 1200);
    const height = Number(formData.get("height") || 1200);

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Please select an image file to upload." }, { status: 400 });
    }

    if (!title || title.length < 2 || title.length > 120) {
      return NextResponse.json({ error: "Photo title must be between 2 and 120 characters." }, { status: 400 });
    }

    if (!category || category.length < 2 || category.length > 60) {
      return NextResponse.json({ error: "Please select a valid gallery category." }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "image/webp";

    // Generate unique storage path
    const extension = mimeType.includes("webp")
      ? "webp"
      : mimeType.includes("png")
        ? "png"
        : "jpg";
    const cleanSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    const storagePath = `designs/${Date.now()}-${cleanSlug || "photo"}.${extension}`;

    // Upload to Supabase Storage bucket 'gallery'
    const { error: uploadError } = await adminClient.storage
      .from("gallery")
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 502 },
      );
    }

    // Get public URL
    const { data: urlData } = adminClient.storage
      .from("gallery")
      .getPublicUrl(storagePath);
    const imageUrl = urlData.publicUrl;

    // Insert database record
    const { data: inserted, error: insertError } = await adminClient
      .from("gallery_images")
      .insert({
        storage_path: storagePath,
        image_url: imageUrl,
        title,
        alt_text: altText || title,
        category,
        width,
        height,
        file_size: buffer.length,
        mime_type: mimeType,
        is_published: isPublished,
        display_order: 0,
      })
      .select()
      .single();

    if (insertError) {
      // Clean up uploaded storage object if database insert fails
      await adminClient.storage.from("gallery").remove([storagePath]);
      return NextResponse.json(
        { error: `Database insert failed: ${insertError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Photo uploaded and saved to gallery successfully.",
        image: inserted,
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to upload photo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

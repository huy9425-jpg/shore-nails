import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { galleryCategories, galleryItems } from "@/data/gallery";
import { createAdminServerClient, createPublicServerClient, getSupabaseEnv } from "@/lib/supabase/server";
import type { PublicGalleryItem, PublicGalleryResponse } from "@/lib/gallery/types";

/**
 * Public GET /api/gallery
 * Returns all gallery items (combining static curated photos + published uploaded photos)
 * and all categories.
 */
export async function GET() {
  await headers();

  const { isConfigured, serviceRoleKey } = getSupabaseEnv();

  // Baseline static gallery items
  const staticItems: PublicGalleryItem[] = galleryItems.map((item) => ({
    id: item.id,
    src: item.src,
    alt: item.alt,
    title: item.title,
    category: item.category,
    width: item.width,
    height: item.height,
    isCustom: false,
  }));

  const allCategories = new Set<string>(galleryCategories);

  if (!isConfigured) {
    const fallbackResponse: PublicGalleryResponse = {
      configured: false,
      items: staticItems,
      categories: Array.from(allCategories),
      totalCount: staticItems.length,
    };
    return NextResponse.json(fallbackResponse, {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }

  try {
    const supabase = serviceRoleKey ? createAdminServerClient() : createPublicServerClient();

    let uploadedItems: PublicGalleryItem[] = [];

    if (supabase) {
      // 1. Fetch categories
      try {
        const { data: dbCategories } = await supabase
          .from("gallery_categories")
          .select("name, display_order")
          .order("display_order", { ascending: true });

        if (Array.isArray(dbCategories)) {
          for (const cat of dbCategories) {
            if (cat.name) allCategories.add(String(cat.name).trim());
          }
        }
      } catch {
        // Table may not exist yet, continue with default categories
      }

      // 2. Fetch published images
      try {
        const { data: dbImages, error: imgError } = await supabase
          .from("gallery_images")
          .select("id, image_url, title, alt_text, category, width, height, is_featured, created_at, display_order")
          .eq("is_published", true)
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: false });

        if (!imgError && Array.isArray(dbImages)) {
          uploadedItems = dbImages.map((row) => ({
            id: String(row.id),
            src: String(row.image_url),
            alt: String(row.alt_text || row.title || "Shore Nails nail design"),
            title: String(row.title || "Salon Nail Design"),
            category: String(row.category),
            width: Number(row.width || 1200),
            height: Number(row.height || 1200),
            isCustom: true,
            isFeatured: Boolean(row.is_featured),
            createdAt: String(row.created_at),
          }));

          for (const img of uploadedItems) {
            if (img.category) allCategories.add(img.category);
          }
        }
      } catch {
        // Table may not exist yet, continue with static items
      }
    }

    // Merge uploaded items (prepended) with static items
    const mergedItems = [...uploadedItems, ...staticItems];

    const response: PublicGalleryResponse = {
      configured: true,
      items: mergedItems,
      categories: Array.from(allCategories),
      totalCount: mergedItems.length,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59" },
    });
  } catch {
    const safeFallback: PublicGalleryResponse = {
      configured: false,
      items: staticItems,
      categories: Array.from(allCategories),
      totalCount: staticItems.length,
    };
    return NextResponse.json(safeFallback, {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }
}

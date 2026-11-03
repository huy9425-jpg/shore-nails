/**
 * Gallery Image record as stored in Supabase `gallery_images` table.
 */
export interface DbGalleryImage {
  id: string;
  storage_path: string;
  image_url: string;
  title: string;
  alt_text: string | null;
  category: string;
  width: number;
  height: number;
  file_size: number | null;
  mime_type: string | null;
  display_order: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Custom category record stored in Supabase `gallery_categories` table.
 */
export interface DbGalleryCategory {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_system: boolean;
  created_at: string;
}

/**
 * Publicly consumable gallery item on the homepage (combines static + uploaded).
 */
export interface PublicGalleryItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  category: string;
  width: number;
  height: number;
  author?: string;
  license?: string;
  isCustom?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
}

/**
 * Response for public GET /api/gallery.
 */
export interface PublicGalleryResponse {
  configured: boolean;
  items: PublicGalleryItem[];
  categories: string[];
  totalCount: number;
}

/**
 * Admin gallery photo item representation.
 */
export interface AdminGalleryItem {
  id: string;
  storage_path: string;
  image_url: string;
  title: string;
  alt_text: string | null;
  category: string;
  width: number;
  height: number;
  file_size: number | null;
  mime_type: string | null;
  display_order: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Summary counters for Gallery Management in Admin.
 */
export interface AdminGallerySummary {
  totalPhotos: number;
  publishedCount: number;
  hiddenCount: number;
  categoryCounts: Record<string, number>;
}

/**
 * Response for admin GET /api/admin/gallery.
 */
export interface AdminGalleryResponse {
  configured: boolean;
  images: AdminGalleryItem[];
  categories: string[];
  summary: AdminGallerySummary;
}

/**
 * Payload for updating an existing photo's metadata.
 */
export interface UpdateGalleryPhotoPayload {
  title?: string;
  category?: string;
  alt_text?: string;
  is_published?: boolean;
  is_featured?: boolean;
  display_order?: number;
}

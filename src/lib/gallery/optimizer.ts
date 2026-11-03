/**
 * High-performance browser-side image optimizer for Shore Nails Gallery.
 * Automatically resizes large camera photos to a max of 1600px, converts to WebP,
 * compresses at 0.88 quality, and generates instant local previews.
 */

export interface OptimizedImageResult {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
  savedPercentage: number;
}

const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.88;

/**
 * Normalizes a raw filename to a clean URL-friendly slug.
 */
export function sanitizeImageFilename(name: string): string {
  const base = name.replace(/\.[^/.]+$/, "");
  const clean = base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${clean || "nail-design"}-${Date.now()}.webp`;
}

/**
 * Optimizes an image File using HTML5 Canvas.
 */
export async function optimizeGalleryImage(file: File): Promise<OptimizedImageResult> {
  // 1. Basic validation
  if (!file.type.startsWith("image/")) {
    throw new Error(`File "${file.name}" is not a recognized image.`);
  }

  // 2. Load into an Image element
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load "${file.name}". The image may be corrupted.`));
      image.src = objectUrl;
    });

    const origWidth = img.naturalWidth || img.width;
    const origHeight = img.naturalHeight || img.height;

    if (!origWidth || !origHeight) {
      throw new Error(`Unable to read dimensions of "${file.name}".`);
    }

    // 3. Compute scaled dimensions (capped at MAX_DIMENSION)
    let targetWidth = origWidth;
    let targetHeight = origHeight;

    if (origWidth > MAX_DIMENSION || origHeight > MAX_DIMENSION) {
      if (origWidth >= origHeight) {
        targetWidth = MAX_DIMENSION;
        targetHeight = Math.round((origHeight / origWidth) * MAX_DIMENSION);
      } else {
        targetHeight = MAX_DIMENSION;
        targetWidth = Math.round((origWidth / origHeight) * MAX_DIMENSION);
      }
    }

    // 4. Render to Canvas
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d", { alpha: false });

    if (!ctx) {
      throw new Error("Unable to create canvas context for image optimization.");
    }

    // High quality downscaling smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // 5. Export as WebP Blob (fallback to JPEG if WebP unsupported)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) {
            resolve(b);
          } else {
            // Fallback to jpeg
            canvas.toBlob(
              (jpegBlob) => {
                if (jpegBlob) resolve(jpegBlob);
                else reject(new Error("Image compression failed."));
              },
              "image/jpeg",
              WEBP_QUALITY,
            );
          }
        },
        "image/webp",
        WEBP_QUALITY,
      );
    });

    const newFilename = sanitizeImageFilename(file.name);
    const optimizedFile = new File([blob], newFilename, {
      type: blob.type || "image/webp",
      lastModified: Date.now(),
    });

    const previewUrl = URL.createObjectURL(blob);
    const originalSize = file.size;
    const optimizedSize = optimizedFile.size;
    const savedPercentage =
      originalSize > optimizedSize
        ? Math.round(((originalSize - optimizedSize) / originalSize) * 100)
        : 0;

    return {
      file: optimizedFile,
      previewUrl,
      width: targetWidth,
      height: targetHeight,
      originalSize,
      optimizedSize,
      savedPercentage,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Format bytes into human readable KB or MB.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


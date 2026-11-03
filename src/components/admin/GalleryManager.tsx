"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Filter,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { galleryCategories } from "@/data/gallery";
import {
  formatFileSize,
  optimizeGalleryImage,
  type OptimizedImageResult,
} from "@/lib/gallery/optimizer";
import type {
  AdminGalleryItem,
  AdminGalleryResponse,
  AdminGallerySummary,
} from "@/lib/gallery/types";

interface QueuedPhoto {
  id: string;
  originalFile: File;
  optimizedResult: OptimizedImageResult;
  title: string;
  category: string;
  isPublished: boolean;
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
}

interface GalleryManagerProps {
  sessionToken: string;
  onRefreshStats?: () => void;
}

export function GalleryManager({ sessionToken, onRefreshStats }: GalleryManagerProps) {
  const [images, setImages] = useState<AdminGalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>(Array.from(galleryCategories));
  const [summary, setSummary] = useState<AdminGallerySummary>({
    totalPhotos: 0,
    publishedCount: 0,
    hiddenCount: 0,
    categoryCounts: {},
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [needsMigration, setNeedsMigration] = useState<boolean>(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "hidden">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [queuedPhotos, setQueuedPhotos] = useState<QueuedPhoto[]>([]);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [uploadingBatch, setUploadingBatch] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [defaultCategory, setDefaultCategory] = useState<string>(galleryCategories[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit photo modal state
  const [editTarget, setEditTarget] = useState<AdminGalleryItem | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editCategory, setEditCategory] = useState<string>("");
  const [editPublished, setEditPublished] = useState<boolean>(true);
  const [editSaving, setEditSaving] = useState<boolean>(false);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<AdminGalleryItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState<boolean>(false);

  // Action busy states for toggle buttons
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const reloadPhotos = useCallback(async (token: string, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setErrorNotice(null);

    try {
      const res = await fetch("/api/admin/gallery", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await res.json()) as AdminGalleryResponse & {
        needsMigration?: boolean;
        error?: string;
      };

      if (!res.ok) {
        if (data.needsMigration) {
          setNeedsMigration(true);
          setErrorNotice(data.error ?? "Database setup required for gallery.");
        } else {
          setErrorNotice(data.error ?? "Failed to load gallery photos.");
        }
        return;
      }

      setNeedsMigration(false);
      setImages(data.images ?? []);
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        setCategories(data.categories);
      }
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch {
      setErrorNotice("Unable to reach the gallery service. Please check your network connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionToken) return;
    let mounted = true;

    fetch("/api/admin/gallery", {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })
      .then((res) => res.json() as Promise<AdminGalleryResponse & { needsMigration?: boolean; error?: string }>)
      .then((data) => {
        if (!mounted) return;
        if (data.needsMigration) {
          setNeedsMigration(true);
          setErrorNotice(data.error ?? "Database setup required for gallery.");
        } else if (data.images) {
          setNeedsMigration(false);
          setImages(data.images);
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
          }
          if (data.summary) {
            setSummary(data.summary);
          }
        }
      })
      .catch(() => {
        if (!mounted) return;
        setErrorNotice("Unable to reach the gallery service.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [sessionToken]);

  // Handle files selected from file picker or drag & drop
  const handleFilesSelected = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      setErrorNotice("Please select valid image files (JPEG, PNG, WebP).");
      return;
    }

    setIsOptimizing(true);
    setErrorNotice(null);

    const newQueued: QueuedPhoto[] = [];

    for (const file of validFiles) {
      try {
        const optimized = await optimizeGalleryImage(file);
        const rawName = file.name.replace(/\.[^/.]+$/, "");
        const cleanTitle = rawName
          .replace(/[-_]+/g, " ")
          .trim()
          .replace(/\b\w/g, (c) => c.toUpperCase());

        newQueued.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          originalFile: file,
          optimizedResult: optimized,
          title: cleanTitle || "Shore Nails Design",
          category: defaultCategory,
          isPublished: true,
          status: "pending",
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : `Failed to process ${file.name}`;
        setErrorNotice(msg);
      }
    }

    setQueuedPhotos((prev) => [...prev, ...newQueued]);
    setIsOptimizing(false);
    setIsUploadOpen(true);
  };

  const removeQueuedPhoto = (id: string) => {
    setQueuedPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.optimizedResult.previewUrl) {
        URL.revokeObjectURL(target.optimizedResult.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  // Upload batch of queued photos
  const handleUploadAllQueued = async () => {
    if (queuedPhotos.length === 0 || uploadingBatch) return;

    setUploadingBatch(true);
    setUploadProgress(0);
    setErrorNotice(null);

    let completed = 0;
    const errors: string[] = [];

    for (let i = 0; i < queuedPhotos.length; i++) {
      const item = queuedPhotos[i];
      if (item.status === "success") continue;

      setQueuedPhotos((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, status: "uploading" } : p)),
      );

      try {
        const formData = new FormData();
        formData.append("file", item.optimizedResult.file);
        formData.append("title", item.title.trim());
        formData.append("category", item.category);
        formData.append("alt_text", item.title.trim());
        formData.append("is_published", item.isPublished ? "true" : "false");
        formData.append("width", String(item.optimizedResult.width));
        formData.append("height", String(item.optimizedResult.height));

        const res = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
          body: formData,
        });

        const result = (await res.json()) as { success?: boolean; error?: string };

        if (!res.ok || !result.success) {
          throw new Error(result.error ?? `Upload failed for ${item.title}`);
        }

        completed++;
        setQueuedPhotos((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, status: "success" } : p)),
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload error";
        errors.push(msg);
        setQueuedPhotos((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, status: "error", errorMessage: msg } : p,
          ),
        );
      }

      setUploadProgress(Math.round(((i + 1) / queuedPhotos.length) * 100));
    }

    setUploadingBatch(false);

    if (completed > 0) {
      setSuccessNotice(
        `Successfully uploaded and published ${completed} ${
          completed === 1 ? "nail design photo" : "nail design photos"
        }!`,
      );
      void reloadPhotos(sessionToken, true);
      if (onRefreshStats) onRefreshStats();

      // Clean up successfully uploaded previews and remove them from queue
      setTimeout(() => {
        setQueuedPhotos((prev) => prev.filter((p) => p.status !== "success"));
        if (errors.length === 0) {
          setIsUploadOpen(false);
        }
      }, 1200);
    }

    if (errors.length > 0) {
      setErrorNotice(`${errors.length} photos encountered upload issues. Please check below.`);
    }
  };

  // Quick toggle Publish / Unpublish
  const handleTogglePublish = async (item: AdminGalleryItem) => {
    if (togglingId) return;
    setTogglingId(item.id);
    const nextPublished = !item.is_published;

    try {
      const res = await fetch(`/api/admin/gallery/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ is_published: nextPublished }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Failed to change publication status.");
      }

      setImages((prev) =>
        prev.map((img) => (img.id === item.id ? { ...img, is_published: nextPublished } : img)),
      );
      setSummary((prev) => ({
        ...prev,
        publishedCount: prev.publishedCount + (nextPublished ? 1 : -1),
        hiddenCount: prev.hiddenCount + (nextPublished ? -1 : 1),
      }));
      setSuccessNotice(
        `Photo "${item.title}" is now ${nextPublished ? "published publicly" : "hidden"}.`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Toggle failed";
      setErrorNotice(msg);
    } finally {
      setTogglingId(null);
    }
  };

  // Edit photo metadata
  const handleOpenEdit = (item: AdminGalleryItem) => {
    setEditTarget(item);
    setEditTitle(item.title);
    setEditCategory(item.category);
    setEditPublished(item.is_published);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || editSaving) return;

    setEditSaving(true);
    setErrorNotice(null);

    try {
      const res = await fetch(`/api/admin/gallery/${editTarget.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          category: editCategory,
          is_published: editPublished,
        }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Failed to save photo changes.");
      }

      setImages((prev) =>
        prev.map((img) =>
          img.id === editTarget.id
            ? {
                ...img,
                title: editTitle.trim(),
                category: editCategory,
                is_published: editPublished,
              }
            : img,
        ),
      );

      setSuccessNotice(`Updated photo "${editTitle.trim()}" successfully.`);
      setEditTarget(null);
      void reloadPhotos(sessionToken, true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setErrorNotice(msg);
    } finally {
      setEditSaving(false);
    }
  };

  // Delete photo
  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleteBusy) return;

    setDeleteBusy(true);
    setErrorNotice(null);

    try {
      const res = await fetch(`/api/admin/gallery/${deleteTarget.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Failed to delete photo.");
      }

      setImages((prev) => prev.filter((img) => img.id !== deleteTarget.id));
      setSuccessNotice(`Photo "${deleteTarget.title}" has been deleted.`);
      setDeleteTarget(null);
      void reloadPhotos(sessionToken, true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      setErrorNotice(msg);
    } finally {
      setDeleteBusy(false);
    }
  };

  // Filtered view
  const filteredImages = images.filter((item) => {
    if (statusFilter === "published" && !item.is_published) return false;
    if (statusFilter === "hidden" && item.is_published) return false;
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Toast Notifications */}
      {errorNotice && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-2xl border border-rose bg-blush-soft p-4 text-sm text-brown font-medium shadow-xs"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-rose shrink-0 mt-0.5" />
            <span>{errorNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorNotice(null)}
            className="text-taupe hover:text-brown cursor-pointer p-0.5"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {successNotice && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-950 font-medium shadow-xs"
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
            <span>{successNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-800 hover:text-emerald-950 cursor-pointer p-0.5"
            aria-label="Dismiss notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Migration Alert Banner if table not yet created */}
      {needsMigration && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif text-lg text-amber-950 font-medium">
                Gallery Database Setup Required in Supabase
              </h3>
              <p className="mt-1 text-sm text-amber-900 leading-relaxed">
                The <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">gallery_images</code> table has not been created yet in your connected Supabase database.
              </p>
              <p className="mt-2 text-xs text-amber-800 leading-relaxed">
                To activate gallery uploads, open your <strong>Supabase Dashboard &rarr; SQL Editor</strong> and execute the SQL file:
                <br />
                <code className="mt-1 inline-block rounded bg-amber-100 px-2 py-1 font-mono text-xs text-amber-950">
                  supabase/migrations/20261103000000_create_gallery_system.sql
                </code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-beige pb-6">
        <div>
          <span className="text-[0.72rem] font-semibold tracking-[0.24em] text-taupe uppercase">
            Shore Nails Portfolio
          </span>
          <h2 className="mt-1 font-serif text-2xl sm:text-3xl text-brown font-normal">
            Gallery Management
          </h2>
          <p className="mt-1.5 text-sm text-ink-soft max-w-2xl leading-relaxed">
            Upload new nail design photographs, edit photo titles and categories, toggle published status, or remove photos. Changes reflect instantly on the public website.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => void reloadPhotos(sessionToken, true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-beige bg-cream px-4 py-2.5 text-xs font-medium tracking-wider uppercase text-brown hover:border-champagne hover:text-champagne transition-colors cursor-pointer"
            aria-label="Refresh gallery photos"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              fileInputRef.current?.click();
            }}
            disabled={isOptimizing}
            className="btn-primary !py-2.5 !px-5 text-xs font-semibold tracking-wider cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            {isOptimizing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            <span>ADD PHOTOS</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                void handleFilesSelected(e.target.files);
                e.target.value = "";
              }
            }}
          />
        </div>
      </div>

      {/* Metrics Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-5">
        <div className="rounded-2xl border border-beige bg-cream p-4 sm:p-5 shadow-xs">
          <p className="text-[0.72rem] font-semibold tracking-wider text-taupe uppercase">
            Total Photos
          </p>
          <p className="mt-2 font-serif text-2xl sm:text-3xl text-brown">
            {summary.totalPhotos}
          </p>
          <span className="text-xs text-taupe-light mt-0.5 block">
            Across {categories.length} categories
          </span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5 shadow-xs">
          <p className="text-[0.72rem] font-semibold tracking-wider text-emerald-800 uppercase">
            Published
          </p>
          <p className="mt-2 font-serif text-2xl sm:text-3xl text-emerald-950">
            {summary.publishedCount}
          </p>
          <span className="text-xs text-emerald-800/80 mt-0.5 block">
            Visible on website
          </span>
        </div>

        <div className="rounded-2xl border border-beige bg-sand/40 p-4 sm:p-5 shadow-xs">
          <p className="text-[0.72rem] font-semibold tracking-wider text-taupe uppercase">
            Hidden / Drafts
          </p>
          <p className="mt-2 font-serif text-2xl sm:text-3xl text-brown">
            {summary.hiddenCount}
          </p>
          <span className="text-xs text-taupe mt-0.5 block">
            Private in admin
          </span>
        </div>

        <div className="rounded-2xl border border-beige bg-cream p-4 sm:p-5 shadow-xs">
          <p className="text-[0.72rem] font-semibold tracking-wider text-taupe uppercase">
            Categories
          </p>
          <p className="mt-2 font-serif text-2xl sm:text-3xl text-champagne">
            {categories.length}
          </p>
          <span className="text-xs text-taupe-light mt-0.5 block">
            15 core + custom
          </span>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="rounded-2xl border border-beige bg-cream p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
              statusFilter === "all"
                ? "bg-brown text-cream"
                : "bg-sand/60 text-brown hover:bg-sand"
            }`}
          >
            All ({images.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("published")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
              statusFilter === "published"
                ? "bg-emerald-800 text-cream"
                : "bg-sand/60 text-brown hover:bg-sand"
            }`}
          >
            Published ({summary.publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("hidden")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
              statusFilter === "hidden"
                ? "bg-taupe text-cream"
                : "bg-sand/60 text-brown hover:bg-sand"
            }`}
          >
            Hidden ({summary.hiddenCount})
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-taupe shrink-0" />
          <label htmlFor="admin-category-filter" className="sr-only">
            Filter by Category
          </label>
          <select
            id="admin-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-beige bg-ivory px-3.5 py-2 text-xs font-medium text-brown focus:border-champagne focus:outline-hidden"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({summary.categoryCounts[cat] || 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Photos Management Grid */}
      {loading ? (
        <div className="rounded-2xl border border-beige bg-cream p-12 text-center text-taupe">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-champagne" />
          <p className="mt-3 text-sm">Loading gallery photos&hellip;</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="rounded-2xl border border-beige bg-cream p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sand/70 border border-beige text-champagne">
            <ImagePlus className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-serif text-2xl text-brown font-normal">
            {images.length === 0 ? "No Uploaded Photos Yet" : "No Photos Match This Filter"}
          </h3>
          <p className="mt-2 text-sm text-ink-soft max-w-md mx-auto leading-relaxed">
            {images.length === 0
              ? "Your website is currently displaying the 45 curated baseline photos. Click 'Add Photos' to upload your own salon client photographs."
              : "Try switching your category or publication filter above."}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary !py-3 !px-7 text-xs font-semibold tracking-wider cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>UPLOAD FIRST PHOTO</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredImages.map((photo) => (
            <div
              key={photo.id}
              className="group flex flex-col justify-between rounded-2xl border border-beige bg-cream overflow-hidden shadow-xs transition-shadow hover:shadow-md"
            >
              {/* Photo Image Card */}
              <div>
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-sand border-b border-beige">
                  <Image
                    src={photo.image_url}
                    alt={photo.alt_text || photo.title}
                    fill
                    sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 45vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Status Pill Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    {photo.is_published ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400 bg-emerald-50/95 px-2.5 py-0.5 text-[0.68rem] font-bold tracking-wider uppercase text-emerald-900 shadow-xs backdrop-blur-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        <span>Published</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-beige bg-sand/95 px-2.5 py-0.5 text-[0.68rem] font-bold tracking-wider uppercase text-taupe shadow-xs backdrop-blur-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-taupe" />
                        <span>Hidden</span>
                      </span>
                    )}
                  </div>

                  {/* Quick Toggle Button on Hover */}
                  <button
                    type="button"
                    onClick={() => void handleTogglePublish(photo)}
                    disabled={togglingId === photo.id}
                    className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-ivory/95 text-brown shadow-xs border border-beige hover:border-champagne hover:text-champagne transition-all cursor-pointer"
                    title={photo.is_published ? "Click to Hide Photo" : "Click to Publish Photo"}
                  >
                    {togglingId === photo.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : photo.is_published ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {/* Details */}
                <div className="p-4 sm:p-4.5">
                  <span className="inline-block rounded-md bg-sand/60 px-2 py-0.5 text-[0.68rem] font-semibold tracking-wider uppercase text-taupe">
                    {photo.category}
                  </span>

                  <h4 className="mt-2 font-serif text-lg text-brown font-normal line-clamp-1" title={photo.title}>
                    {photo.title}
                  </h4>

                  <div className="mt-2 flex items-center justify-between text-[0.72rem] text-taupe font-medium">
                    <span>
                      {new Date(photo.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {photo.file_size ? (
                      <span>{formatFileSize(photo.file_size)}</span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 sm:p-3.5 pt-0 border-t border-beige/60 flex items-center justify-between gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(photo)}
                  className="flex-1 rounded-xl border border-beige bg-ivory py-2 text-xs font-semibold tracking-wider uppercase text-brown hover:border-champagne hover:text-champagne transition-colors cursor-pointer text-center"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(photo)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose/30 bg-blush-soft text-rose hover:bg-rose hover:text-cream transition-colors cursor-pointer shrink-0"
                  title="Delete Photo"
                  aria-label={`Delete ${photo.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload & Preview Modal */}
      {isUploadOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[95] flex items-center justify-center bg-brown/75 p-3 sm:p-6 backdrop-blur-xs animate-fade-in overflow-y-auto"
          onClick={() => {
            if (!uploadingBatch) setIsUploadOpen(false);
          }}
        >
          <div
            className="relative my-auto w-full max-w-4xl rounded-2xl border border-beige bg-ivory p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-beige pb-4">
              <div>
                <p className="text-[0.72rem] font-semibold tracking-[0.22em] text-taupe uppercase">
                  Shore Nails &bull; Photo Upload
                </p>
                <h3 className="mt-1 font-serif text-2xl sm:text-3xl text-brown font-normal">
                  Add Nail Design Photos ({queuedPhotos.length})
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!uploadingBatch) setIsUploadOpen(false);
                }}
                disabled={uploadingBatch}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-beige bg-cream text-brown hover:border-champagne hover:text-champagne transition-colors cursor-pointer"
                aria-label="Close upload window"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drag & Drop Add More Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) void handleFilesSelected(e.dataTransfer.files);
              }}
              className="mt-6 rounded-2xl border-2 border-dashed border-beige hover:border-champagne bg-sand/30 p-6 text-center transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-8 w-8 text-champagne" />
              <p className="mt-2 text-sm font-medium text-brown">
                Drag and drop more photographs here, or <span className="text-champagne underline">browse files</span>
              </p>
              <p className="mt-1 text-xs text-taupe">
                Supports multiple JPEG, PNG, or WebP files from phone or desktop. Automatic WebP optimization applied.
              </p>
            </div>

            {/* Batch category selector tool */}
            {queuedPhotos.length > 1 && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-beige bg-cream p-3 text-xs">
                <span className="font-semibold text-brown uppercase tracking-wider">
                  Apply category to all queued photos:
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={defaultCategory}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setDefaultCategory(newCat);
                      setQueuedPhotos((prev) => prev.map((p) => ({ ...p, category: newCat })));
                    }}
                    className="rounded-lg border border-beige bg-ivory px-3 py-1.5 text-xs text-brown focus:border-champagne focus:outline-hidden"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Queued Photos Preview List */}
            <div className="mt-6 space-y-4 max-h-[46vh] overflow-y-auto pr-1">
              {queuedPhotos.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border p-3.5 sm:p-4 transition-colors ${
                    item.status === "success"
                      ? "border-emerald-300 bg-emerald-50/60"
                      : item.status === "error"
                        ? "border-rose bg-blush-soft"
                        : "border-beige bg-cream"
                  }`}
                >
                  {/* Thumbnail & Info */}
                  <div className="flex items-center gap-3.5 w-full sm:w-auto">
                    <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-xl border border-beige bg-sand">
                      <Image
                        src={item.optimizedResult.previewUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-taupe uppercase tracking-wider">
                          Photo #{index + 1}
                        </span>
                        {item.optimizedResult.savedPercentage > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[0.65rem] font-bold text-emerald-800">
                            <Sparkles className="h-2.5 w-2.5" />
                            <span>-{item.optimizedResult.savedPercentage}% WebP</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-taupe-light mt-0.5">
                        {formatFileSize(item.optimizedResult.originalSize)} &rarr;{" "}
                        <strong className="text-brown">{formatFileSize(item.optimizedResult.optimizedSize)}</strong> ({item.optimizedResult.width}&times;{item.optimizedResult.height})
                      </p>
                      {item.errorMessage && (
                        <p className="text-xs text-rose font-medium mt-1">
                          {item.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Editable Title & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full sm:w-[48%]">
                    <div>
                      <label className="block text-[0.68rem] font-semibold text-brown uppercase">
                        Title
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        disabled={uploadingBatch || item.status === "success"}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQueuedPhotos((prev) =>
                            prev.map((p) => (p.id === item.id ? { ...p, title: val } : p)),
                          );
                        }}
                        className="mt-1 w-full rounded-lg border border-beige bg-ivory px-2.5 py-1.5 text-xs text-brown focus:border-champagne focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.68rem] font-semibold text-brown uppercase">
                        Category
                      </label>
                      <select
                        value={item.category}
                        disabled={uploadingBatch || item.status === "success"}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQueuedPhotos((prev) =>
                            prev.map((p) => (p.id === item.id ? { ...p, category: val } : p)),
                          );
                        }}
                        className="mt-1 w-full rounded-lg border border-beige bg-ivory px-2 py-1.5 text-xs text-brown focus:border-champagne focus:outline-hidden"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeQueuedPhoto(item.id)}
                    disabled={uploadingBatch}
                    className="self-end sm:self-center p-1.5 rounded-lg text-taupe hover:text-rose cursor-pointer"
                    aria-label="Remove photo from upload queue"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            {uploadingBatch && (
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-taupe mb-1">
                  <span>Uploading to Shore Nails gallery&hellip;</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-sand overflow-hidden">
                  <div
                    className="h-full bg-champagne transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-7 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-beige pt-4">
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                disabled={uploadingBatch}
                className="btn-outline w-full sm:w-auto !py-3 !px-6 text-xs font-semibold tracking-wider cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleUploadAllQueued()}
                disabled={queuedPhotos.length === 0 || uploadingBatch}
                className="btn-primary w-full sm:w-auto !py-3 !px-8 text-xs font-semibold tracking-wider cursor-pointer shadow-xs inline-flex items-center justify-center gap-2"
              >
                {uploadingBatch ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publishing ({uploadProgress}%)</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>
                      Publish {queuedPhotos.length} {queuedPhotos.length === 1 ? "Photo" : "Photos"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Photo Modal */}
      {editTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[95] flex items-center justify-center bg-brown/75 p-4 backdrop-blur-xs animate-fade-in overflow-y-auto"
          onClick={() => {
            if (!editSaving) setEditTarget(null);
          }}
        >
          <div
            className="relative my-auto w-full max-w-lg rounded-2xl border border-beige bg-ivory p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-beige pb-4">
              <div>
                <p className="text-[0.72rem] font-semibold tracking-wider text-taupe uppercase">
                  Edit Photo Details
                </p>
                <h3 className="mt-1 font-serif text-2xl text-brown font-normal">
                  {editTarget.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="p-1 rounded-full text-taupe hover:text-brown cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-beige bg-sand">
                <Image
                  src={editTarget.image_url}
                  alt={editTarget.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-brown uppercase">
                  Photo Title <span className="text-rose">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-beige bg-cream px-4 py-2.5 text-sm text-brown focus:border-champagne focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-brown uppercase">
                  Category <span className="text-rose">*</span>
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-beige bg-cream px-3.5 py-2.5 text-sm text-brown focus:border-champagne focus:outline-hidden"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Published toggle */}
              <div className="rounded-xl border border-beige bg-cream p-3.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-brown uppercase tracking-wider">
                      Published Status
                    </p>
                    <p className="text-xs text-taupe mt-0.5">
                      {editPublished
                        ? "Visible to public visitors on the website"
                        : "Hidden from public website (Draft)"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editPublished}
                    onChange={(e) => setEditPublished(e.target.checked)}
                    className="h-5 w-5 rounded border-beige text-brown accent-brown cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-beige">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  disabled={editSaving}
                  className="btn-outline w-full sm:w-auto !py-2.5 !px-5 text-xs font-semibold tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="btn-primary w-full sm:w-auto !py-2.5 !px-6 text-xs font-semibold tracking-wider cursor-pointer"
                >
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[95] flex items-center justify-center bg-brown/75 p-4 backdrop-blur-xs animate-fade-in"
          onClick={() => {
            if (!deleteBusy) setDeleteTarget(null);
          }}
        >
          <div
            className="relative my-auto w-full max-w-md rounded-2xl border border-beige bg-ivory p-6 sm:p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blush-soft border border-rose/30">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-2xl text-brown font-normal">
                Delete Photo?
              </h3>
            </div>

            <p className="mt-3.5 text-sm text-ink-soft leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-brown">&ldquo;{deleteTarget.title}&rdquo;</strong>?
              This will remove the photo from the website gallery and delete the file from storage. This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteBusy}
                className="btn-outline w-full sm:w-auto !py-2.5 !px-5 text-xs font-semibold tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={deleteBusy}
                className="rounded-xl border border-rose bg-rose px-6 py-2.5 text-xs font-semibold tracking-wider uppercase text-cream hover:bg-rose/90 transition-colors cursor-pointer w-full sm:w-auto"
              >
                {deleteBusy ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

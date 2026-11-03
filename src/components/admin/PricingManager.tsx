"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit2,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import {
  formatServicePrice,
  type AdminPricingResponse,
  type AdminPricingSummary,
  type PricingFormat,
  type PricingService,
  type SavePricingServicePayload,
} from "@/lib/pricing/types";

interface PricingManagerProps {
  sessionToken: string;
  onRefreshStats?: () => void;
}

export function PricingManager({ sessionToken, onRefreshStats }: PricingManagerProps) {
  const [categories, setCategories] = useState<{ id: string; category: string; description?: string }[]>([]);
  const [services, setServices] = useState<PricingService[]>([]);
  const [summary, setSummary] = useState<AdminPricingSummary>({
    totalServices: 0,
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "hidden">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State (Add or Edit)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [modalName, setModalName] = useState<string>("");
  const [modalCategoryId, setModalCategoryId] = useState<string>("nail-services");
  const [modalFormat, setModalFormat] = useState<PricingFormat>("fixed");
  const [modalAmount, setModalAmount] = useState<string>("");
  const [modalMax, setModalMax] = useState<string>("");
  const [modalCustomPrice, setModalCustomPrice] = useState<string>("");
  const [modalDuration, setModalDuration] = useState<string>("");
  const [modalDescription, setModalDescription] = useState<string>("");
  const [modalPublished, setModalPublished] = useState<boolean>(true);
  const [modalSaving, setModalSaving] = useState<boolean>(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<PricingService | null>(null);
  const [deleteBusy, setDeleteBusy] = useState<boolean>(false);

  // Quick Toggle busy ID
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const reloadPrices = useCallback(async (token: string, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setErrorNotice(null);

    try {
      const res = await fetch("/api/admin/prices", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = (await res.json()) as AdminPricingResponse & {
        needsMigration?: boolean;
        error?: string;
      };

      if (!res.ok) {
        if (data.needsMigration) {
          setNeedsMigration(true);
          setErrorNotice(data.error ?? "Database setup required for pricing.");
        } else {
          setErrorNotice(data.error ?? "Failed to load pricing services.");
        }
        return;
      }

      setNeedsMigration(false);
      setCategories(data.categories ?? []);
      setServices(data.services ?? []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch {
      setErrorNotice("Unable to reach the pricing service. Please check your network connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionToken) return;
    let mounted = true;

    fetch("/api/admin/prices", {
      headers: { Authorization: `Bearer ${sessionToken}` },
    })
      .then((res) => res.json() as Promise<AdminPricingResponse & { needsMigration?: boolean; error?: string }>)
      .then((data) => {
        if (!mounted) return;
        if (data.needsMigration) {
          setNeedsMigration(true);
          setErrorNotice(data.error ?? "Database setup required for pricing.");
        } else if (data.services) {
          setNeedsMigration(false);
          setCategories(data.categories ?? []);
          setServices(data.services ?? []);
          if (data.summary) {
            setSummary(data.summary);
          }
        }
      })
      .catch(() => {
        if (!mounted) return;
        setErrorNotice("Unable to reach the pricing service.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [sessionToken]);

  // Open modal to Add
  const handleOpenAdd = () => {
    setEditingServiceId(null);
    setModalName("");
    setModalCategoryId(categories[0]?.id || "nail-services");
    setModalFormat("fixed");
    setModalAmount("");
    setModalMax("");
    setModalCustomPrice("");
    setModalDuration("");
    setModalDescription("");
    setModalPublished(true);
    setIsModalOpen(true);
  };

  // Open modal to Edit
  const handleOpenEdit = (service: PricingService) => {
    setEditingServiceId(service.id);
    setModalName(service.name);
    setModalCategoryId(service.category_id);
    setModalFormat(service.price_format);
    setModalAmount(service.price_amount !== null ? String(service.price_amount) : "");
    setModalMax(service.price_max !== null ? String(service.price_max) : "");
    setModalCustomPrice(service.price_format === "custom" ? service.price : "");
    setModalDuration(service.duration || "");
    setModalDescription(service.description || "");
    setModalPublished(service.is_published);
    setIsModalOpen(true);
  };

  // Live formatted price preview
  const previewPriceString = useMemo(() => {
    const numAmount = modalAmount.trim() ? parseFloat(modalAmount) : null;
    const numMax = modalMax.trim() ? parseFloat(modalMax) : null;
    return formatServicePrice(modalFormat, numAmount, numMax, modalCustomPrice);
  }, [modalFormat, modalAmount, modalMax, modalCustomPrice]);

  // Save (Create or Update)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalSaving) return;

    const cleanName = modalName.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorNotice("Please enter a valid service name (at least 2 characters).");
      return;
    }

    const numAmount = modalAmount.trim() ? parseFloat(modalAmount) : null;
    const numMax = modalMax.trim() ? parseFloat(modalMax) : null;

    if (modalFormat === "range" && numAmount !== null && numMax !== null && numMax < numAmount) {
      setErrorNotice("Maximum price cannot be less than minimum price.");
      return;
    }

    setModalSaving(true);
    setErrorNotice(null);

    const payload: SavePricingServicePayload = {
      name: cleanName,
      category_id: modalCategoryId,
      price_format: modalFormat,
      price_amount: numAmount,
      price_max: numMax,
      custom_price: modalCustomPrice.trim() || null,
      duration: modalDuration.trim() || null,
      description: modalDescription.trim() || null,
      is_published: modalPublished,
    };

    try {
      const url = editingServiceId
        ? `/api/admin/prices/${editingServiceId}`
        : "/api/admin/prices";
      const method = editingServiceId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Failed to save service.");
      }

      setSuccessNotice(
        editingServiceId
          ? `Updated "${cleanName}" successfully.`
          : `Added new service "${cleanName}" successfully.`,
      );
      setIsModalOpen(false);
      void reloadPrices(sessionToken, true);
      if (onRefreshStats) onRefreshStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setErrorNotice(msg);
    } finally {
      setModalSaving(false);
    }
  };

  // Quick toggle Publish / Hide
  const handleTogglePublish = async (service: PricingService) => {
    if (togglingId) return;
    setTogglingId(service.id);
    const nextPublished = !service.is_published;

    try {
      const res = await fetch(`/api/admin/prices/${service.id}`, {
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

      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, is_published: nextPublished } : s)),
      );
      setSummary((prev) => ({
        ...prev,
        publishedCount: prev.publishedCount + (nextPublished ? 1 : -1),
        hiddenCount: prev.hiddenCount + (nextPublished ? -1 : 1),
      }));
      setSuccessNotice(
        `Service "${service.name}" is now ${nextPublished ? "published on the website" : "hidden"}.`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Toggle failed";
      setErrorNotice(msg);
    } finally {
      setTogglingId(null);
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleteBusy) return;

    setDeleteBusy(true);
    setErrorNotice(null);

    try {
      const res = await fetch(`/api/admin/prices/${deleteTarget.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Failed to delete service.");
      }

      setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setSuccessNotice(`Service "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      void reloadPrices(sessionToken, true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      setErrorNotice(msg);
    } finally {
      setDeleteBusy(false);
    }
  };

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (selectedCategory !== "all" && s.category_id !== selectedCategory) return false;
      if (statusFilter === "published" && !s.is_published) return false;
      if (statusFilter === "hidden" && s.is_published) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(query);
        const matchPrice = s.price.toLowerCase().includes(query);
        const matchDesc = s.description?.toLowerCase().includes(query);
        if (!matchName && !matchPrice && !matchDesc) return false;
      }
      return true;
    });
  }, [services, selectedCategory, statusFilter, searchQuery]);

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

      {/* Migration Alert Banner */}
      {needsMigration && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif text-lg text-amber-950 font-medium">
                Pricing Database Setup Required in Supabase
              </h3>
              <p className="mt-1 text-sm text-amber-900 leading-relaxed">
                The <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">pricing_services</code> table has not been created yet in your connected Supabase database.
              </p>
              <p className="mt-2 text-xs text-amber-800 leading-relaxed">
                To activate pricing management, open your <strong>Supabase Dashboard &rarr; SQL Editor</strong> and execute:
                <br />
                <code className="mt-1 inline-block rounded bg-amber-100 px-2 py-1 font-mono text-xs text-amber-950">
                  supabase/migrations/20261103010000_create_pricing_system.sql
                </code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header & Primary Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-beige pb-6">
        <div>
          <span className="text-[0.72rem] font-semibold tracking-[0.24em] text-taupe uppercase">
            Salon Menu Management
          </span>
          <h2 className="mt-1 font-serif text-2xl sm:text-3xl text-brown font-normal">
            Pricing Management
          </h2>
          <p className="mt-1.5 text-sm text-ink-soft max-w-2xl leading-relaxed">
            Update prices, service descriptions, durations, or add new services. All changes synchronize live to the public homepage menu immediately without redeployment.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => void reloadPrices(sessionToken, true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-beige bg-cream px-4 py-2.5 text-xs font-medium tracking-wider uppercase text-brown hover:border-champagne hover:text-champagne transition-colors cursor-pointer"
            aria-label="Refresh price list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn-primary !py-2.5 !px-5 text-xs font-semibold tracking-wider cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>ADD SERVICE</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-5">
        <div className="rounded-2xl border border-beige bg-cream p-4 sm:p-5 shadow-xs">
          <p className="text-[0.72rem] font-semibold tracking-wider text-taupe uppercase">
            Total Services
          </p>
          <p className="mt-2 font-serif text-2xl sm:text-3xl text-brown">
            {summary.totalServices}
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
            Live on public menu
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
            Menu Categories
          </p>
          <p className="mt-2 font-serif text-2xl sm:text-3xl text-champagne">
            {categories.length}
          </p>
          <span className="text-xs text-taupe-light mt-0.5 block">
            Nail, Pedi, Wax, Men, Specialty
          </span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-2xl border border-beige bg-cream p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Filters */}
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
            All ({services.length})
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

        {/* Category & Search Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-taupe shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-beige bg-ivory px-3.5 py-2 text-xs font-medium text-brown focus:border-champagne focus:outline-hidden"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category} ({summary.categoryCounts[cat.id] || 0})
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            placeholder="Search service name or price..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl border border-beige bg-ivory px-3 py-2 text-xs text-brown placeholder:text-taupe-light focus:border-champagne focus:outline-hidden"
          />
        </div>
      </div>

      {/* Services List Table / Cards */}
      {loading ? (
        <div className="rounded-2xl border border-beige bg-cream p-12 text-center text-taupe">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-champagne" />
          <p className="mt-3 text-sm">Loading salon price list&hellip;</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-2xl border border-beige bg-cream p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sand/70 border border-beige text-champagne">
            <DollarSign className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-serif text-2xl text-brown font-normal">
            No Services Match Your Filter
          </h3>
          <p className="mt-2 text-sm text-ink-soft max-w-md mx-auto leading-relaxed">
            Try adjusting your search query, status, or category filter above.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-beige bg-cream shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-beige bg-sand/40 text-[0.72rem] font-semibold tracking-wider text-taupe uppercase">
                  <th className="py-3.5 px-4 sm:px-6">Service Name &amp; Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/70 text-sm">
                {filteredServices.map((service) => (
                  <tr
                    key={service.id}
                    className="hover:bg-ivory/60 transition-colors"
                  >
                    {/* Name & Note */}
                    <td className="py-4 px-4 sm:px-6">
                      <p className="font-medium text-brown text-[0.98rem] sm:text-[1.04rem]">
                        {service.name}
                      </p>
                      {service.description && (
                        <p className="text-xs text-taupe mt-0.5 max-w-md line-clamp-1 italic">
                          {service.description}
                        </p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-block rounded-md bg-sand/70 border border-beige px-2.5 py-0.5 text-[0.72rem] font-semibold tracking-wider uppercase text-brown">
                        {service.category_name}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {service.is_unconfirmed ? (
                        <span className="inline-flex items-center rounded-full bg-blush-soft border border-blush/80 px-2.5 py-0.5 text-xs font-medium text-brown">
                          Contact for pricing
                        </span>
                      ) : (
                        <span className="font-serif text-lg text-brown font-medium">
                          {service.price}
                        </span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-taupe">
                      {service.duration ? (
                        <span className="inline-flex items-center gap-1.5 text-taupe">
                          <Clock className="h-3.5 w-3.5 text-champagne" />
                          <span>{service.duration}</span>
                        </span>
                      ) : (
                        <span className="text-taupe-light">&mdash;</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {service.is_published ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[0.68rem] font-bold tracking-wider uppercase text-emerald-900">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-beige bg-sand px-2.5 py-0.5 text-[0.68rem] font-bold tracking-wider uppercase text-taupe">
                          <span className="h-1.5 w-1.5 rounded-full bg-taupe" />
                          <span>Hidden</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        {/* Quick Toggle */}
                        <button
                          type="button"
                          onClick={() => void handleTogglePublish(service)}
                          disabled={togglingId === service.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-beige bg-ivory text-brown hover:border-champagne hover:text-champagne transition-colors cursor-pointer"
                          title={service.is_published ? "Hide from website" : "Publish to website"}
                        >
                          {togglingId === service.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : service.is_published ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(service)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-beige bg-ivory text-brown hover:border-champagne hover:text-champagne transition-colors cursor-pointer"
                          title="Edit Service"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(service)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose/30 bg-blush-soft text-rose hover:bg-rose hover:text-cream transition-colors cursor-pointer"
                          title="Delete Service"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[95] flex items-center justify-center bg-brown/75 p-4 backdrop-blur-xs animate-fade-in overflow-y-auto"
          onClick={() => {
            if (!modalSaving) setIsModalOpen(false);
          }}
        >
          <div
            className="relative my-auto w-full max-w-xl rounded-2xl border border-beige bg-ivory p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-beige pb-4">
              <div>
                <p className="text-[0.72rem] font-semibold tracking-wider text-taupe uppercase">
                  Shore Nails Menu Management
                </p>
                <h3 className="mt-1 font-serif text-2xl sm:text-3xl text-brown font-normal">
                  {editingServiceId ? "Edit Service Price" : "Add New Salon Service"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={modalSaving}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-beige bg-cream text-brown hover:border-champagne hover:text-champagne transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="mt-5 space-y-4.5">
              {/* Service Name */}
              <div>
                <label className="block text-xs font-semibold tracking-wider text-brown uppercase">
                  Service Name <span className="text-rose">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  placeholder="e.g., Luxury Spa Pedicure"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-beige bg-cream px-4 py-2.5 text-base text-brown placeholder:text-taupe-light focus:border-champagne focus:outline-hidden"
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold tracking-wider text-brown uppercase">
                  Category <span className="text-rose">*</span>
                </label>
                <select
                  value={modalCategoryId}
                  onChange={(e) => setModalCategoryId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-beige bg-cream px-3.5 py-2.5 text-sm text-brown focus:border-champagne focus:outline-hidden"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Format Selector */}
              <div>
                <label className="block text-xs font-semibold tracking-wider text-brown uppercase">
                  Pricing Format <span className="text-rose">*</span>
                </label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalFormat("fixed")}
                    className={`rounded-xl border p-2.5 text-center text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                      modalFormat === "fixed"
                        ? "border-brown bg-brown text-cream shadow-xs"
                        : "border-beige bg-cream text-brown hover:border-champagne"
                    }`}
                  >
                    Fixed Price ($20)
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalFormat("starting")}
                    className={`rounded-xl border p-2.5 text-center text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                      modalFormat === "starting"
                        ? "border-brown bg-brown text-cream shadow-xs"
                        : "border-beige bg-cream text-brown hover:border-champagne"
                    }`}
                  >
                    Starting Price ($70+)
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalFormat("range")}
                    className={`rounded-xl border p-2.5 text-center text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                      modalFormat === "range"
                        ? "border-brown bg-brown text-cream shadow-xs"
                        : "border-beige bg-cream text-brown hover:border-champagne"
                    }`}
                  >
                    Price Range ($40–$60)
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalFormat("custom")}
                    className={`rounded-xl border p-2.5 text-center text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                      modalFormat === "custom"
                        ? "border-brown bg-brown text-cream shadow-xs"
                        : "border-beige bg-cream text-brown hover:border-champagne"
                    }`}
                  >
                    Custom Label ($5 Extra)
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalFormat("contact")}
                    className={`rounded-xl border p-2.5 text-center text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer col-span-2 sm:col-span-1 ${
                      modalFormat === "contact"
                        ? "border-brown bg-brown text-cream shadow-xs"
                        : "border-beige bg-cream text-brown hover:border-champagne"
                    }`}
                  >
                    Contact for Pricing
                  </button>
                </div>
              </div>

              {/* Dynamic Price Inputs based on format */}
              {modalFormat === "fixed" && (
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-brown uppercase">
                    Fixed Price Amount ($) <span className="text-rose">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-taupe font-medium">
                      $
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      placeholder="e.g., 45"
                      value={modalAmount}
                      onChange={(e) => setModalAmount(e.target.value)}
                      className="w-full rounded-xl border border-beige bg-cream pl-8 pr-4 py-2.5 text-base text-brown focus:border-champagne focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {modalFormat === "starting" && (
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-brown uppercase">
                    Starting Price Amount ($) <span className="text-rose">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-taupe font-medium">
                      $
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      placeholder="e.g., 70"
                      value={modalAmount}
                      onChange={(e) => setModalAmount(e.target.value)}
                      className="w-full rounded-xl border border-beige bg-cream pl-8 pr-4 py-2.5 text-base text-brown focus:border-champagne focus:outline-hidden"
                    />
                  </div>
                  <p className="mt-1 text-xs text-taupe">
                    Displays on the menu as <strong className="text-brown">{modalAmount ? `$${modalAmount}+` : "$0+"}</strong>.
                  </p>
                </div>
              )}

              {modalFormat === "range" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-brown uppercase">
                      Minimum ($) <span className="text-rose">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-taupe font-medium">
                        $
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        placeholder="e.g., 40"
                        value={modalAmount}
                        onChange={(e) => setModalAmount(e.target.value)}
                        className="w-full rounded-xl border border-beige bg-cream pl-8 pr-4 py-2.5 text-base text-brown focus:border-champagne focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-brown uppercase">
                      Maximum ($) <span className="text-rose">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-taupe font-medium">
                        $
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        placeholder="e.g., 60"
                        value={modalMax}
                        onChange={(e) => setModalMax(e.target.value)}
                        className="w-full rounded-xl border border-beige bg-cream pl-8 pr-4 py-2.5 text-base text-brown focus:border-champagne focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {modalFormat === "custom" && (
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-brown uppercase">
                    Custom Price Label <span className="text-rose">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., $5 Extra, Inquire within"
                    value={modalCustomPrice}
                    onChange={(e) => setModalCustomPrice(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-beige bg-cream px-4 py-2.5 text-base text-brown focus:border-champagne focus:outline-hidden"
                  />
                </div>
              )}

              {modalFormat === "contact" && (
                <div className="rounded-xl border border-blush bg-blush-soft p-3.5 text-xs text-brown">
                  Displays as &ldquo;<span className="font-semibold">Contact us for pricing</span>&rdquo; with our phone consultation prompt.
                </div>
              )}

              {/* Duration & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-brown uppercase">
                    Service Duration (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Approximately 45 Minutes"
                    value={modalDuration}
                    onChange={(e) => setModalDuration(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-beige bg-cream px-3.5 py-2.5 text-sm text-brown placeholder:text-taupe-light focus:border-champagne focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-brown uppercase">
                    Notes / Details (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Exfoliation & massage included"
                    value={modalDescription}
                    onChange={(e) => setModalDescription(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-beige bg-cream px-3.5 py-2.5 text-sm text-brown placeholder:text-taupe-light focus:border-champagne focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Published Checkbox */}
              <div className="rounded-xl border border-beige bg-cream p-3.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-brown uppercase tracking-wider">
                      Published Status
                    </p>
                    <p className="text-xs text-taupe mt-0.5">
                      {modalPublished
                        ? "Visible on public salon menu immediately"
                        : "Hidden from public website (Draft)"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={modalPublished}
                    onChange={(e) => setModalPublished(e.target.checked)}
                    className="h-5 w-5 rounded border-beige text-brown accent-brown cursor-pointer"
                  />
                </label>
              </div>

              {/* Live Preview Card */}
              <div className="rounded-xl border border-dashed border-beige bg-sand/40 p-4">
                <div className="flex items-center justify-between text-xs text-taupe mb-2">
                  <span className="font-semibold uppercase tracking-wider">
                    Website Preview
                  </span>
                  <span>Public Presentation</span>
                </div>
                <div className="flex items-baseline justify-between py-2 border-b border-beige">
                  <div>
                    <span className="text-base font-medium text-brown">
                      {modalName.trim() || "Service Name Preview"}
                    </span>
                    {modalDuration.trim() && (
                      <span className="block text-xs text-taupe italic">
                        {modalDuration.trim()}
                      </span>
                    )}
                    {modalDescription.trim() && (
                      <span className="block text-xs text-taupe-light">
                        {modalDescription.trim()}
                      </span>
                    )}
                  </div>
                  <span className="font-serif text-xl text-brown font-normal ml-3">
                    {previewPriceString}
                  </span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-beige">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalSaving}
                  className="btn-outline w-full sm:w-auto !py-2.5 !px-5 text-xs font-semibold tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="btn-primary w-full sm:w-auto !py-2.5 !px-6 text-xs font-semibold tracking-wider cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  {modalSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Service</span>
                  )}
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
                Delete Service?
              </h3>
            </div>

            <p className="mt-3.5 text-sm text-ink-soft leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-brown">&ldquo;{deleteTarget.name}&rdquo;</strong> ({deleteTarget.price})?
              It will be removed from your website price list. This action cannot be undone.
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

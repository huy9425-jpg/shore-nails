"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Clock,
  EyeOff,
  Lock,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import {
  getSupabaseBrowserClient,
  isSupabaseClientConfigured,
} from "@/lib/supabase/client";
import type {
  AdminReview,
  AdminReviewsSummary,
  ModerationStatus,
} from "@/lib/reviews/types";
import { Logo } from "@/components/ui/Logo";

type FilterTab = "all" | "pending" | "approved" | "rejected" | "hidden";

function formatAdminTimestamp(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return isoDate;
    return new Intl.DateTimeFormat("en-US", {
      timeZone: siteConfig.contact.timezone,
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    return isoDate;
  }
}

function StatusBadge({ status }: { status: ModerationStatus }) {
  const styles: Record<ModerationStatus, string> = {
    pending:
      "border-amber-600/35 bg-amber-50 text-amber-900",
    approved:
      "border-emerald-700/30 bg-emerald-50 text-emerald-900",
    rejected:
      "border-rose bg-blush-soft text-brown",
    hidden:
      "border-beige-dark bg-sand text-taupe",
  };

  const labels: Record<ModerationStatus, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    hidden: "Hidden",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase ${styles[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "pending"
            ? "bg-amber-600 animate-pulse"
            : status === "approved"
              ? "bg-emerald-600"
              : status === "rejected"
                ? "bg-rose"
                : "bg-taupe"
        }`}
      />
      <span>{labels[status]}</span>
    </span>
  );
}

export function AdminDashboard() {
  const configured = isSupabaseClientConfigured();

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isAdminVerified, setIsAdminVerified] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [authChecking, setAuthChecking] = useState<boolean>(() => configured);

  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Reviews & summary state
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [summary, setSummary] = useState<AdminReviewsSummary>({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    hiddenCount: 0,
    totalCount: 0,
    averageRating: 0,
  });
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(false);
  const [realtimeNotice, setRealtimeNotice] = useState<string | null>(null);

  const fetchAdminReviews = useCallback(async (token: string) => {
    try {
      setLoadingReviews(true);
      setDashboardError(null);

      const res = await fetch("/api/admin/reviews", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = (await res.json()) as {
        reviews?: AdminReview[];
        summary?: AdminReviewsSummary;
        adminEmail?: string;
        error?: string;
      };

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          const supabase = getSupabaseBrowserClient();
          if (supabase) {
            await supabase.auth.signOut();
          }
          setSessionToken(null);
          setIsAdminVerified(false);
          setReviews([]);
          setLoginError(data.error ?? "Session expired or unauthorized. Please sign in with an administrator account.");
          return;
        }
        setDashboardError(data.error ?? "Failed to load reviews.");
        return;
      }

      setIsAdminVerified(true);
      setReviews(data.reviews ?? []);
      if (data.summary) {
        setSummary(data.summary);
      }
      if (data.adminEmail) {
        setAdminEmail(data.adminEmail);
      }
    } catch {
      setDashboardError("Network error while loading reviews.");
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  // Check active Supabase Auth session on mount
  useEffect(() => {
    if (!configured) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const token = data.session?.access_token ?? null;
      const email = data.session?.user?.email ?? "";
      setSessionToken(token);
      setAdminEmail(email);
      setAuthChecking(false);
      if (token) {
        void fetchAdminReviews(token);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        const token = session?.access_token ?? null;
        setSessionToken(token);
        setAdminEmail(session?.user?.email ?? "");
        if (token) {
          void fetchAdminReviews(token);
        } else {
          setReviews([]);
        }
      },
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [configured, fetchAdminReviews]);

  // Subscribe to Supabase Realtime only after server-side admin verification succeeds
  useEffect(() => {
    if (!configured || !sessionToken || !isAdminVerified) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("shore-nails-admin-reviews")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reviews" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setRealtimeNotice("A new customer review was just submitted!");
          }
          void fetchAdminReviews(sessionToken);
        },
      )
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(channel);
      setRealtimeConnected(false);
    };
  }, [configured, sessionToken, isAdminVerified, fetchAdminReviews]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoginError("Supabase client is not configured.");
      return;
    }

    const email = loginEmail.trim();
    if (!email || !loginPassword) {
      setLoginError("Please enter both your administrator email and password.");
      return;
    }

    try {
      setLoginLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: loginPassword,
      });

      if (error || !data.session) {
        setLoginError(
          error?.message || "Invalid email or password. Please try again.",
        );
        return;
      }

      setLoginPassword("");
      setSessionToken(data.session.access_token);
      setAdminEmail(data.session.user.email ?? email);
      await fetchAdminReviews(data.session.access_token);
    } catch {
      setLoginError("Unable to sign in right now. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSessionToken(null);
    setIsAdminVerified(false);
    setAdminEmail("");
    setReviews([]);
  };

  const handleUpdateStatus = async (
    reviewId: string,
    nextStatus: ModerationStatus,
  ) => {
    if (!sessionToken || busyId) return;

    try {
      setBusyId(reviewId);
      setDashboardError(null);

      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ moderation_status: nextStatus }),
      });

      const data = (await res.json()) as {
        review?: AdminReview;
        error?: string;
      };

      if (!res.ok) {
        setDashboardError(data.error ?? "Failed to update review status.");
        return;
      }

      await fetchAdminReviews(sessionToken);
    } catch {
      setDashboardError("Network error while updating review status.");
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!sessionToken || !deleteTarget || busyId) return;
    const targetId = deleteTarget.id;

    try {
      setBusyId(targetId);
      setDashboardError(null);

      const res = await fetch(`/api/admin/reviews/${targetId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || !data.success) {
        setDashboardError(data.error ?? "Failed to delete review.");
        return;
      }

      setDeleteTarget(null);
      await fetchAdminReviews(sessionToken);
    } catch {
      setDashboardError("Network error while deleting review.");
    } finally {
      setBusyId(null);
    }
  };

  const filteredReviews = useMemo(() => {
    if (activeTab === "all") return reviews;
    return reviews.filter((r) => r.moderation_status === activeTab);
  }, [reviews, activeTab]);

  return (
    <div className="min-h-screen bg-ivory text-ink flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 border-b border-beige bg-ivory/95 backdrop-blur-md">
        <div className="container-lux py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="focus:outline-hidden"
              aria-label="Return to Shore Nails public website"
            >
              <Logo showSubtitle={false} />
            </Link>
            <span className="hidden sm:inline-block h-5 w-px bg-beige" />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-beige bg-cream px-3 py-1 text-xs font-semibold tracking-[0.14em] text-brown uppercase">
              <ShieldCheck className="h-3.5 w-3.5 text-champagne" />
              <span>Admin Portal</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {sessionToken && isAdminVerified && summary.pendingCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("pending")}
                className="inline-flex items-center gap-2 rounded-full border border-amber-600/40 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-amber-900 uppercase cursor-pointer"
              >
                <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
                <span>
                  {summary.pendingCount} Pending{" "}
                  {summary.pendingCount === 1 ? "Review" : "Reviews"}
                </span>
              </button>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-beige bg-cream px-4 py-2 text-xs font-medium tracking-wider uppercase text-brown hover:border-champagne transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Public Site</span>
            </Link>

            {sessionToken && isAdminVerified && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-full border border-brown bg-brown px-4 py-2 text-xs font-medium tracking-wider uppercase text-cream hover:bg-champagne hover:border-champagne transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container-lux py-8 sm:py-12 flex-1">
        {!configured ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-beige bg-cream p-7 sm:p-10 shadow-xs">
            <div className="flex items-center gap-3 text-brown">
              <AlertTriangle className="h-6 w-6 text-champagne shrink-0" />
              <h1 className="font-serif text-2xl sm:text-3xl font-normal">
                Supabase Database Configuration Required
              </h1>
            </div>
            <p className="mt-4 text-sm sm:text-base text-ink-soft leading-relaxed">
              To activate the Shore Nails Customer Review System and Admin Dashboard, configure the following environment variables in{" "}
              <code className="rounded bg-sand px-1.5 py-0.5 text-xs font-mono text-brown">
                .env.local
              </code>{" "}
              (and in Vercel Project Settings):
            </p>
            <ul className="mt-4 space-y-2 rounded-xl border border-beige bg-ivory p-4 text-xs sm:text-sm font-mono text-brown">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              <li>SUPABASE_SERVICE_ROLE_KEY (server-only secret)</li>
              <li>ADMIN_ALLOWED_EMAILS (server-only administrator email allowlist)</li>
            </ul>
            <p className="mt-4 text-xs sm:text-sm text-taupe leading-relaxed">
              Run the SQL migration located in{" "}
              <code className="rounded bg-sand px-1.5 py-0.5 text-xs font-mono text-brown">
                supabase/migrations/20261102000000_create_reviews_system.sql
              </code>{" "}
              inside your Supabase SQL Editor, then create your administrator account under{" "}
              <strong>Supabase Dashboard &rarr; Authentication &rarr; Users</strong>.
            </p>
          </div>
        ) : authChecking || (sessionToken && !isAdminVerified && loadingReviews) ? (
          <div className="mx-auto max-w-md rounded-2xl border border-beige bg-cream p-10 text-center text-taupe">
            Verifying administrator session&hellip;
          </div>
        ) : !sessionToken || !isAdminVerified ? (
          /* Unauthenticated Administrator Login Card */
          <div className="mx-auto max-w-md rounded-2xl border border-beige bg-cream p-7 sm:p-9 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand/70 border border-beige text-champagne">
              <Lock className="h-5 w-5" aria-hidden="true" />
            </div>

            <h1 className="mt-5 font-serif text-2xl sm:text-3xl text-brown font-normal">
              Owner Review Management
            </h1>
            <p className="mt-2 text-sm text-ink-soft leading-relaxed">
              Sign in with your authorized Shore Nails administrator account to review, approve, hide, or remove customer reviews.
            </p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="admin-login-email"
                  className="block text-xs font-semibold tracking-wider text-brown uppercase"
                >
                  Administrator Email
                </label>
                <input
                  id="admin-login-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="owner@shorenails.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-beige bg-ivory px-4 py-3 text-base text-brown placeholder:text-taupe-light focus:border-champagne focus:outline-hidden"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-login-password"
                  className="block text-xs font-semibold tracking-wider text-brown uppercase"
                >
                  Password
                </label>
                <input
                  id="admin-login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-beige bg-ivory px-4 py-3 text-base text-brown placeholder:text-taupe-light focus:border-champagne focus:outline-hidden"
                />
              </div>

              {loginError && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose bg-blush-soft px-4 py-3 text-xs sm:text-sm text-brown font-medium"
                >
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="btn-primary w-full justify-center !py-3.5 text-[0.86rem] cursor-pointer disabled:opacity-60"
              >
                {loginLoading ? "Signing In..." : "Sign In to Dashboard"}
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Review Management Dashboard */
          <div>
            {/* Dashboard Title & Refresh Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brown font-normal">
                    Customer Review Moderation
                  </h1>
                  {realtimeConnected && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-700/25 bg-emerald-50 px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wider text-emerald-900 uppercase">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>Live Sync</span>
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs sm:text-sm text-taupe">
                  Signed in as <span className="font-medium text-brown">{adminEmail}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchAdminReviews(sessionToken)}
                disabled={loadingReviews}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-beige bg-cream px-5 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase text-brown hover:border-champagne transition-colors cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loadingReviews ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
            </div>

            {/* Realtime New Submission Banner */}
            {realtimeNotice && (
              <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-amber-600/40 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <div className="flex items-center gap-2.5 font-medium">
                  <Clock className="h-4 w-4 text-amber-700 shrink-0" />
                  <span>{realtimeNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRealtimeNotice(null)}
                  className="text-xs font-semibold uppercase tracking-wider text-amber-900 underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* 4 Summary Cards */}
            <div className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {/* 1. Pending Reviews */}
              <div
                className={`rounded-2xl border p-5 sm:p-6 shadow-xs ${
                  summary.pendingCount > 0
                    ? "border-amber-600/45 bg-amber-50/70"
                    : "border-beige bg-cream"
                }`}
              >
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-taupe uppercase">
                  Pending Reviews
                </p>
                <p className="mt-2 font-serif text-3xl sm:text-4xl text-brown font-normal">
                  {summary.pendingCount}
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  {summary.pendingCount > 0
                    ? "Awaiting your approval"
                    : "All caught up"}
                </p>
              </div>

              {/* 2. Approved Reviews */}
              <div className="rounded-2xl border border-beige bg-cream p-5 sm:p-6 shadow-xs">
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-taupe uppercase">
                  Approved Reviews
                </p>
                <p className="mt-2 font-serif text-3xl sm:text-4xl text-brown font-normal">
                  {summary.approvedCount}
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  Visible on public homepage
                </p>
              </div>

              {/* 3. Rejected Reviews */}
              <div className="rounded-2xl border border-beige bg-cream p-5 sm:p-6 shadow-xs">
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-taupe uppercase">
                  Rejected Reviews
                </p>
                <p className="mt-2 font-serif text-3xl sm:text-4xl text-brown font-normal">
                  {summary.rejectedCount}
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  {summary.hiddenCount > 0
                    ? `+ ${summary.hiddenCount} hidden from public`
                    : "Kept private"}
                </p>
              </div>

              {/* 4. Average Rating */}
              <div className="rounded-2xl border border-beige bg-cream p-5 sm:p-6 shadow-xs">
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-taupe uppercase">
                  Average Rating
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-serif text-3xl sm:text-4xl text-brown font-normal">
                    {summary.approvedCount > 0
                      ? summary.averageRating.toFixed(1)
                      : "—"}
                  </span>
                  {summary.approvedCount > 0 && (
                    <Star className="h-5 w-5 fill-champagne text-champagne self-center" />
                  )}
                </div>
                <p className="mt-1 text-xs text-ink-soft">
                  From approved reviews
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mt-8 border-b border-beige pb-3">
              <div
                role="tablist"
                aria-label="Filter reviews by moderation status"
                className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0 scrollbar-none"
              >
                {(
                  [
                    { id: "all", label: "All Reviews", count: summary.totalCount },
                    { id: "pending", label: "Pending", count: summary.pendingCount },
                    { id: "approved", label: "Approved", count: summary.approvedCount },
                    { id: "rejected", label: "Rejected", count: summary.rejectedCount },
                    ...(summary.hiddenCount > 0
                      ? [{ id: "hidden" as FilterTab, label: "Hidden", count: summary.hiddenCount }]
                      : []),
                  ] as Array<{ id: FilterTab; label: string; count: number }>
                ).map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveTab(tab.id)}
                      className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium tracking-[0.08em] uppercase transition-colors cursor-pointer ${
                        active
                          ? "border-brown bg-brown text-cream"
                          : "border-beige bg-cream text-brown hover:border-champagne"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.7rem] ${
                          active
                            ? "bg-cream/20 text-cream"
                            : "bg-sand text-brown"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {dashboardError && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-rose bg-blush-soft px-4 py-3 text-sm text-brown font-medium"
              >
                {dashboardError}
              </div>
            )}

            {/* Reviews List */}
            <div className="mt-6 space-y-4">
              {loadingReviews && reviews.length === 0 ? (
                <div className="rounded-2xl border border-beige bg-cream p-10 text-center text-taupe">
                  Loading reviews&hellip;
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="rounded-2xl border border-beige bg-cream p-10 text-center">
                  <p className="font-serif text-xl text-brown">
                    No reviews in this category.
                  </p>
                  <p className="mt-1 text-sm text-taupe">
                    New customer submissions will appear here automatically.
                  </p>
                </div>
              ) : (
                filteredReviews.map((review) => {
                  const isBusy = busyId === review.id;
                  return (
                    <article
                      key={review.id}
                      className="rounded-2xl border border-beige bg-cream p-5 sm:p-7 shadow-xs transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-beige/80 pb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h2 className="font-serif text-xl sm:text-2xl text-brown font-normal">
                              {review.customer_name}
                            </h2>
                            <StatusBadge status={review.moderation_status} />
                          </div>

                          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-taupe">
                            <span className="inline-flex items-center gap-1 font-medium text-brown">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3.5 w-3.5 ${
                                    star <= review.rating
                                      ? "fill-champagne text-champagne"
                                      : "fill-transparent text-beige-dark"
                                  }`}
                                />
                              ))}
                              <span className="ml-1">({review.rating}/5)</span>
                            </span>
                            <span>&bull;</span>
                            <time dateTime={review.created_at}>
                              Submitted {formatAdminTimestamp(review.created_at)}
                            </time>
                          </div>
                        </div>

                        {/* Private Contact Information (Admin-only) */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft bg-sand/50 rounded-xl px-3 py-2 border border-beige">
                          <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-taupe">
                            Private Contact:
                          </span>
                          {review.contact_email && (
                            <a
                              href={`mailto:${review.contact_email}`}
                              className="inline-flex items-center gap-1 text-brown hover:text-champagne underline"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              <span>{review.contact_email}</span>
                            </a>
                          )}
                          {review.contact_phone && (
                            <a
                              href={`tel:${review.contact_phone}`}
                              className="inline-flex items-center gap-1 text-brown hover:text-champagne underline"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              <span>{review.contact_phone}</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Review Text */}
                      <p className="mt-4 text-base text-brown leading-relaxed whitespace-pre-line break-words">
                        {review.review_text}
                      </p>

                      {/* Moderation Action Buttons (Mobile-Friendly Touch Targets) */}
                      <div className="mt-5 pt-4 border-t border-beige/80 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                          {/* APPROVE */}
                          <button
                            type="button"
                            disabled={
                              isBusy || review.moderation_status === "approved"
                            }
                            onClick={() =>
                              handleUpdateStatus(review.id, "approved")
                            }
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-full border border-emerald-700 bg-emerald-700 px-4 py-2 text-xs font-semibold tracking-wider text-cream uppercase transition-colors hover:bg-emerald-800 disabled:opacity-40 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>APPROVE</span>
                          </button>

                          {/* REJECT */}
                          <button
                            type="button"
                            disabled={
                              isBusy || review.moderation_status === "rejected"
                            }
                            onClick={() =>
                              handleUpdateStatus(review.id, "rejected")
                            }
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-full border border-brown/40 bg-ivory px-4 py-2 text-xs font-semibold tracking-wider text-brown uppercase transition-colors hover:border-brown hover:bg-sand disabled:opacity-40 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>REJECT</span>
                          </button>

                          {/* HIDE */}
                          <button
                            type="button"
                            disabled={
                              isBusy || review.moderation_status === "hidden"
                            }
                            onClick={() =>
                              handleUpdateStatus(review.id, "hidden")
                            }
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-full border border-beige-dark bg-sand/60 px-4 py-2 text-xs font-semibold tracking-wider text-brown uppercase transition-colors hover:border-brown disabled:opacity-40 cursor-pointer"
                          >
                            <EyeOff className="h-3.5 w-3.5" />
                            <span>HIDE</span>
                          </button>
                        </div>

                        {/* DELETE */}
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => setDeleteTarget(review)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-rose/60 bg-blush-soft/70 px-4 py-2 text-xs font-semibold tracking-wider text-brown uppercase transition-colors hover:bg-rose hover:text-cream disabled:opacity-40 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>DELETE</span>
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* Permanent Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brown/75 p-4 backdrop-blur-xs animate-fade-in"
          onClick={() => !busyId && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-beige bg-ivory p-6 sm:p-7 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-brown">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush-soft text-brown border border-rose">
                <Trash2 className="h-5 w-5" />
              </span>
              <h3
                id="delete-confirm-title"
                className="font-serif text-2xl font-normal"
              >
                Permanently Delete Review?
              </h3>
            </div>

            <p className="mt-3 text-sm text-ink-soft leading-relaxed">
              Are you sure you want to permanently delete the review from{" "}
              <strong className="text-brown">
                {deleteTarget.customer_name}
              </strong>
              ? This action cannot be undone. (Tip: Use{" "}
              <strong>HIDE</strong> if you only want to remove it from the public website without deleting it.)
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={Boolean(busyId)}
                onClick={() => setDeleteTarget(null)}
                className="btn-outline !py-2.5 !px-5 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(busyId)}
                onClick={handleConfirmDelete}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-brown bg-brown px-5 py-2.5 text-xs font-semibold tracking-wider text-cream uppercase hover:bg-rose hover:border-rose transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{busyId ? "Deleting..." : "Confirm Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

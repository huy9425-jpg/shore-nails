import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  createAdminServerClient,
  verifyAdminRequest,
} from "@/lib/supabase/server";
import type { AdminReview, AdminReviewsSummary } from "@/lib/reviews/types";

/**
 * GET /api/admin/reviews
 * Protected endpoint for the salon administrator (/admin).
 * Requires a valid Supabase Auth Bearer token.
 */
export async function GET(request: Request) {
  await headers();

  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error ?? "Unauthorized" },
      { status: auth.status },
    );
  }

  const supabase = createAdminServerClient(auth.accessToken);
  if (!supabase) {
    return NextResponse.json(
      { error: "Database connection unavailable." },
      { status: 503 },
    );
  }

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        "id, customer_name, contact_email, contact_phone, rating, review_text, consent_to_publish, moderation_status, created_at, updated_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/admin/reviews] Query error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to load reviews." },
        { status: 500 },
      );
    }

    const reviews: AdminReview[] = (data ?? []) as AdminReview[];

    const pendingCount = reviews.filter(
      (r) => r.moderation_status === "pending",
    ).length;
    const approvedReviews = reviews.filter(
      (r) => r.moderation_status === "approved",
    );
    const approvedCount = approvedReviews.length;
    const rejectedCount = reviews.filter(
      (r) => r.moderation_status === "rejected",
    ).length;
    const hiddenCount = reviews.filter(
      (r) => r.moderation_status === "hidden",
    ).length;

    const averageRating =
      approvedCount > 0
        ? Number(
            (
              approvedReviews.reduce((sum, r) => sum + Number(r.rating), 0) /
              approvedCount
            ).toFixed(1),
          )
        : 0;

    const summary: AdminReviewsSummary = {
      pendingCount,
      approvedCount,
      rejectedCount,
      hiddenCount,
      totalCount: reviews.length,
      averageRating,
    };

    return NextResponse.json(
      {
        reviews,
        summary,
        adminEmail: auth.user?.email ?? "",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  } catch (err) {
    console.error("[GET /api/admin/reviews] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reviews for administration." },
      { status: 500 },
    );
  }
}


import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  createAdminServerClient,
  createPublicServerClient,
  checkSubmissionRateLimit,
  getSupabaseEnv,
} from "@/lib/supabase/server";
import {
  validateReviewSubmission,
  type PublicReview,
  type PublicReviewsResponse,
} from "@/lib/reviews/types";

/**
 * GET /api/reviews
 * Public endpoint returning ONLY approved reviews (`moderation_status = 'approved'`).
 * Never exposes `contact_email`, `contact_phone`, or non-approved reviews.
 */
export async function GET() {
  // Opt into dynamic request-time execution under Next.js 16 Cache Components
  await headers();

  const { isConfigured, serviceRoleKey } = getSupabaseEnv();
  if (!isConfigured) {
    const emptyResponse: PublicReviewsResponse = {
      configured: false,
      reviews: [],
      totalApproved: 0,
      averageRating: 0,
    };
    return NextResponse.json(emptyResponse, {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }

  try {
    let rawRows: Array<Record<string, unknown>> | null = null;

    if (serviceRoleKey) {
      const adminClient = createAdminServerClient();
      if (adminClient) {
        const { data, error } = await adminClient
          .from("reviews")
          .select("id, customer_name, rating, review_text, created_at")
          .eq("moderation_status", "approved")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }
        rawRows = data ?? [];
      }
    } else {
      const publicClient = createPublicServerClient();
      if (publicClient) {
        // Query the privacy-safe view `public_approved_reviews` first
        const viewRes = await publicClient
          .from("public_approved_reviews")
          .select("id, customer_name, rating, review_text, created_at")
          .order("created_at", { ascending: false });

        if (!viewRes.error) {
          rawRows = viewRes.data ?? [];
        } else {
          // Fallback if only the base table exists
          const tableRes = await publicClient
            .from("reviews")
            .select("id, customer_name, rating, review_text, created_at")
            .eq("moderation_status", "approved")
            .order("created_at", { ascending: false });

          if (tableRes.error) {
            throw tableRes.error;
          }
          rawRows = tableRes.data ?? [];
        }
      }
    }

    // Strictly whitelist public fields so private contact details can never leak
    const reviews: PublicReview[] = (rawRows ?? []).map((row) => ({
      id: String(row.id ?? ""),
      customer_name: String(row.customer_name ?? ""),
      rating: Number(row.rating ?? 5),
      review_text: String(row.review_text ?? ""),
      created_at: String(row.created_at ?? new Date().toISOString()),
    }));

    const totalApproved = reviews.length;
    const averageRating =
      totalApproved > 0
        ? Number(
            (
              reviews.reduce((sum, r) => sum + r.rating, 0) / totalApproved
            ).toFixed(1),
          )
        : 0;

    const payload: PublicReviewsResponse = {
      configured: true,
      reviews,
      totalApproved,
      averageRating,
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (err) {
    console.error("[GET /api/reviews] Error loading approved reviews:", err);
    return NextResponse.json(
      {
        configured: true,
        reviews: [],
        totalApproved: 0,
        averageRating: 0,
        error: "Unable to load customer reviews at this time.",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/reviews
 * Public endpoint for submitting a new customer review.
 * Forces `moderation_status = 'pending'` and validates all fields server-side.
 */
export async function POST(request: Request) {
  const reqHeaders = await headers();
  const { isConfigured, serviceRoleKey } = getSupabaseEnv();

  if (!isConfigured) {
    return NextResponse.json(
      {
        error:
          "The review database is not yet configured in this environment. Please contact the salon administrator.",
      },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 },
    );
  }

  const validation = validateReviewSubmission(body);
  if (!validation.valid || !validation.sanitized) {
    return NextResponse.json(
      { error: validation.error ?? "Invalid review submission." },
      { status: 400 },
    );
  }

  const { sanitized } = validation;

  // Extract client IP for rate limiting & duplicate submission prevention
  const forwardedFor = reqHeaders.get("x-forwarded-for");
  const clientIp =
    forwardedFor?.split(",")[0]?.trim() ||
    reqHeaders.get("x-real-ip") ||
    "unknown-ip";

  const duplicateSignature = `${sanitized.customer_name.toLowerCase()}|${sanitized.rating}|${sanitized.review_text.toLowerCase().slice(0, 120)}`;
  const rateCheck = checkSubmissionRateLimit(clientIp, duplicateSignature);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: rateCheck.error },
      { status: 429 },
    );
  }

  try {
    const client = serviceRoleKey
      ? createAdminServerClient()
      : createPublicServerClient();

    if (!client) {
      return NextResponse.json(
        { error: "Database service unavailable." },
        { status: 503 },
      );
    }

    // Check database for recent identical duplicate within the last 24 hours if service role is active
    if (serviceRoleKey) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: existing } = await client
        .from("reviews")
        .select("id")
        .ilike("customer_name", sanitized.customer_name)
        .eq("review_text", sanitized.review_text)
        .gte("created_at", oneDayAgo)
        .limit(1);

      if (existing && existing.length > 0) {
        return NextResponse.json(
          {
            error:
              "Your review has already been received and is awaiting moderation. Thank you!",
          },
          { status: 409 },
        );
      }
    }

    // Insert without chaining .select() so anon INSERT-only RLS succeeds without exposing private rows
    const { error } = await client.from("reviews").insert({
      customer_name: sanitized.customer_name,
      contact_email: sanitized.contact_email,
      contact_phone: sanitized.contact_phone,
      rating: sanitized.rating,
      review_text: sanitized.review_text,
      consent_to_publish: true,
      moderation_status: "pending",
    });

    if (error) {
      const msg = (error.message ?? "").toLowerCase();
      if (msg.includes("duplicate")) {
        return NextResponse.json(
          {
            error:
              "Your review has already been received and is awaiting moderation. Thank you!",
          },
          { status: 409 },
        );
      }
      if (msg.includes("rate limit") || msg.includes("too many")) {
        return NextResponse.json(
          {
            error:
              "Too many review submissions right now. Please wait a few minutes and try again.",
          },
          { status: 429 },
        );
      }
      console.error("[POST /api/reviews] Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save your review. Please try again shortly." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you for sharing your experience with Shore Nails! Your review has been received and will appear publicly once approved.",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/reviews] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while submitting your review." },
      { status: 500 },
    );
  }
}


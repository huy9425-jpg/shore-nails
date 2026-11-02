import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  createAdminServerClient,
  verifyAdminRequest,
} from "@/lib/supabase/server";
import type { ModerationStatus } from "@/lib/reviews/types";

const ALLOWED_STATUSES: ModerationStatus[] = [
  "pending",
  "approved",
  "rejected",
  "hidden",
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/reviews/[id]
 * Updates `moderation_status` ("approved" | "rejected" | "hidden" | "pending").
 * Protected by Supabase Auth JWT verification.
 */
export async function PATCH(request: Request, context: RouteContext) {
  await headers();

  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error ?? "Unauthorized" },
      { status: auth.status },
    );
  }

  const { id } = await context.params;
  if (!id || !UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: "Invalid review ID." },
      { status: 400 },
    );
  }

  let body: { moderation_status?: string };
  try {
    body = (await request.json()) as { moderation_status?: string };
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 },
    );
  }

  const nextStatus = body.moderation_status as ModerationStatus | undefined;
  if (!nextStatus || !ALLOWED_STATUSES.includes(nextStatus)) {
    return NextResponse.json(
      {
        error:
          "Invalid moderation_status. Must be 'approved', 'rejected', 'hidden', or 'pending'.",
      },
      { status: 400 },
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
      .update({
        moderation_status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        "id, customer_name, contact_email, contact_phone, rating, review_text, consent_to_publish, moderation_status, created_at, updated_at",
      )
      .single();

    if (error) {
      console.error("[PATCH /api/admin/reviews/[id]] Update error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update review status." },
        { status: 500 },
      );
    }

    return NextResponse.json({ review: data }, { status: 200 });
  } catch (err) {
    console.error("[PATCH /api/admin/reviews/[id]] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected error updating review." },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/reviews/[id]
 * Permanently deletes a review record.
 * Protected by Supabase Auth JWT verification.
 */
export async function DELETE(request: Request, context: RouteContext) {
  await headers();

  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error ?? "Unauthorized" },
      { status: auth.status },
    );
  }

  const { id } = await context.params;
  if (!id || !UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: "Invalid review ID." },
      { status: 400 },
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
    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      console.error("[DELETE /api/admin/reviews/[id]] Delete error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to delete review." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (err) {
    console.error("[DELETE /api/admin/reviews/[id]] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected error deleting review." },
      { status: 500 },
    );
  }
}


export type ModerationStatus = "pending" | "approved" | "rejected" | "hidden";

/**
 * Public-safe review structure.
 * Strictly omits contact_email, contact_phone, and internal moderation fields.
 */
export interface PublicReview {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export interface PublicReviewsResponse {
  configured: boolean;
  reviews: PublicReview[];
  totalApproved: number;
  averageRating: number;
}

/**
 * Full review record visible ONLY to authenticated administrators in /admin.
 */
export interface AdminReview {
  id: string;
  customer_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  rating: number;
  review_text: string;
  consent_to_publish: boolean;
  moderation_status: ModerationStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminReviewsSummary {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  hiddenCount: number;
  totalCount: number;
  averageRating: number;
}

export interface ReviewSubmissionPayload {
  customer_name: string;
  contact_email?: string;
  contact_phone?: string;
  rating: number;
  review_text: string;
  consent_to_publish: boolean;
  /** Honeypot anti-spam field — must remain empty */
  website?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: {
    customer_name: string;
    contact_email: string | null;
    contact_phone: string | null;
    rating: number;
    review_text: string;
    consent_to_publish: true;
  };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateReviewSubmission(
  payload: Partial<ReviewSubmissionPayload>,
): ValidationResult {
  // Honeypot spam check
  if (payload.website && String(payload.website).trim().length > 0) {
    return { valid: false, error: "Spam detected." };
  }

  const customerName = String(payload.customer_name ?? "")
    .replace(/\s+/g, " ")
    .trim();

  if (customerName.length < 2 || customerName.length > 80) {
    return {
      valid: false,
      error: "Please enter your name (between 2 and 80 characters).",
    };
  }

  const rawEmail = String(payload.contact_email ?? "").trim();
  const rawPhone = String(payload.contact_phone ?? "").trim();

  if (!rawEmail && !rawPhone) {
    return {
      valid: false,
      error:
        "Please provide either your email address or phone number (kept strictly private).",
    };
  }

  let contactEmail: string | null = null;
  if (rawEmail) {
    if (rawEmail.length > 255 || !EMAIL_REGEX.test(rawEmail)) {
      return {
        valid: false,
        error: "Please enter a valid email address.",
      };
    }
    contactEmail = rawEmail.toLowerCase();
  }

  let contactPhone: string | null = null;
  if (rawPhone) {
    const digitsOnly = rawPhone.replace(/\D/g, "");
    if (digitsOnly.length < 7 || digitsOnly.length > 15 || rawPhone.length > 40) {
      return {
        valid: false,
        error: "Please enter a valid phone number (at least 7 digits).",
      };
    }
    contactPhone = rawPhone;
  }

  const rating = Number(payload.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return {
      valid: false,
      error: "Please select a star rating between 1 and 5.",
    };
  }

  const reviewText = String(payload.review_text ?? "").trim();
  if (reviewText.length < 10 || reviewText.length > 1500) {
    return {
      valid: false,
      error: "Please write a review between 10 and 1,500 characters.",
    };
  }

  // Basic link spam guard
  const urlMatches = reviewText.match(/https?:\/\/|www\./gi);
  if (urlMatches && urlMatches.length > 1) {
    return {
      valid: false,
      error: "Reviews cannot contain promotional web links.",
    };
  }

  if (payload.consent_to_publish !== true) {
    return {
      valid: false,
      error:
        "Please check the consent box to allow Shore Nails to publish your review and display name.",
    };
  }

  return {
    valid: true,
    sanitized: {
      customer_name: customerName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      rating,
      review_text: reviewText,
      consent_to_publish: true,
    },
  };
}


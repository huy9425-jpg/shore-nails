"use client";

import { useEffect, useId, useState } from "react";
import {
  CheckCircle2,
  MessageSquarePlus,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import {
  validateReviewSubmission,
  type PublicReview,
  type PublicReviewsResponse,
} from "@/lib/reviews/types";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

function formatReviewDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      timeZone: siteConfig.contact.timezone,
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "";
  }
}

function StarRow({
  rating,
  sizeClass = "h-4 w-4",
}: {
  rating: number;
  sizeClass?: string;
}) {
  return (
    <div
      className="inline-flex items-center gap-1"
      aria-label={`Rated ${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(rating);
        return (
          <Star
            key={star}
            aria-hidden="true"
            className={`${sizeClass} ${
              filled
                ? "fill-champagne text-champagne"
                : "fill-transparent text-beige-dark"
            }`}
          />
        );
      })}
    </div>
  );
}

export function CustomerReviews() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [totalApproved, setTotalApproved] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.location.hash === "#write-review";
    }
    return false;
  });
  const [customerName, setCustomerName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [consentToPublish, setConsentToPublish] = useState<boolean>(false);
  const [honeypot, setHoneypot] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const formTitleId = useId();

  useEffect(() => {
    let mounted = true;

    fetch("/api/reviews", {
      method: "GET",
      cache: "no-store",
    })
      .then((res) => (res.ok ? (res.json() as Promise<PublicReviewsResponse>) : null))
      .then((data) => {
        if (!mounted) return;
        if (data) {
          setReviews(Array.isArray(data.reviews) ? data.reviews : []);
          setTotalApproved(Number(data.totalApproved ?? 0));
          setAverageRating(Number(data.averageRating ?? 0));
        } else {
          setReviews([]);
          setTotalApproved(0);
          setAverageRating(0);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setReviews([]);
        setTotalApproved(0);
        setAverageRating(0);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Auto-scroll to #reviews when accessed directly (e.g., via QR code or direct link)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    const isTarget = hash === "#reviews" || hash === "#write-review";

    const scrollToReviews = (behavior: ScrollBehavior) => {
      const el = document.getElementById("reviews");
      if (!el) return;
      el.scrollIntoView({ behavior, block: "start" });
    };

    if (isTarget) {
      // Initial scroll attempt
      scrollToReviews("auto");

      let userInteracted = false;
      const markInteracted = () => {
        userInteracted = true;
      };
      window.addEventListener("wheel", markInteracted, { passive: true, once: true });
      window.addEventListener("touchmove", markInteracted, { passive: true, once: true });

      const attemptScroll = (behavior: ScrollBehavior) => {
        if (!userInteracted) {
          scrollToReviews(behavior);
        }
      };

      // Handle post-hydration and image layout stabilization
      const t1 = setTimeout(() => attemptScroll("smooth"), 150);
      const t2 = setTimeout(() => attemptScroll("smooth"), 500);

      const onLoad = () => attemptScroll("smooth");
      if (document.readyState !== "complete") {
        window.addEventListener("load", onLoad, { once: true });
      }

      const onHashChange = () => {
        const curHash = window.location.hash;
        if (curHash === "#reviews" || curHash === "#write-review") {
          scrollToReviews("smooth");
          if (curHash === "#write-review") {
            setIsFormOpen(true);
          }
        }
      };
      window.addEventListener("hashchange", onHashChange);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        window.removeEventListener("load", onLoad);
        window.removeEventListener("wheel", markInteracted);
        window.removeEventListener("touchmove", markInteracted);
        window.removeEventListener("hashchange", onHashChange);
      };
    }

    const onHashChange = () => {
      const curHash = window.location.hash;
      if (curHash === "#reviews" || curHash === "#write-review") {
        scrollToReviews("smooth");
        if (curHash === "#write-review") {
          setIsFormOpen(true);
        }
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  // Lock body scroll when review modal is open
  useEffect(() => {
    if (!isFormOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) {
        setIsFormOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isFormOpen, submitting]);

  const openReviewModal = () => {
    setFormError(null);
    setSubmitSuccess(null);
    setIsFormOpen(true);
  };

  const closeReviewModal = () => {
    if (submitting) return;
    setIsFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    setFormError(null);
    setSubmitSuccess(null);

    const payload = {
      customer_name: customerName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      rating,
      review_text: reviewText,
      consent_to_publish: consentToPublish,
      website: honeypot,
    };

    const validation = validateReviewSubmission(payload);
    if (!validation.valid) {
      setFormError(validation.error ?? "Please check your review details.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await res.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok || !result.success) {
        setFormError(
          result.error ??
            "Unable to submit your review right now. Please try again shortly.",
        );
        return;
      }

      setSubmitSuccess(
        result.message ??
          "Thank you! Your review has been submitted and will appear publicly once approved by Shore Nails.",
      );
      setCustomerName("");
      setContactEmail("");
      setContactPhone("");
      setRating(5);
      setReviewText("");
      setConsentToPublish(false);
    } catch {
      setFormError(
        "A network error occurred while sending your review. Please check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="relative bg-ivory py-20 sm:py-28 lg:py-32 border-t border-beige scroll-mt-24 sm:scroll-mt-28 lg:scroll-mt-32"
    >
      <div className="container-lux">
        <SectionHeading
          eyebrow="Client Feedback"
          titleId="reviews-heading"
          title="CUSTOMER REVIEWS"
          description="We value every guest who visits Shore Nails in Northfield. Read genuine experiences shared by our clients, or leave a review after your salon visit."
        />

        {/* Summary Bar & WRITE A REVIEW Button */}
        <Reveal className="mt-10 sm:mt-12">
          <div className="mx-auto max-w-4xl rounded-2xl border border-beige bg-cream p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              {totalApproved > 0 ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center justify-center sm:justify-start gap-2.5">
                    <span className="font-serif text-3xl sm:text-4xl text-brown font-normal leading-none">
                      {averageRating.toFixed(1)}
                    </span>
                    <StarRow rating={averageRating} sizeClass="h-5 w-5" />
                  </div>
                  <div className="text-sm sm:text-base text-ink-soft">
                    Based on{" "}
                    <span className="font-semibold text-brown">
                      {totalApproved}{" "}
                      {totalApproved === 1
                        ? "approved customer review"
                        : "approved customer reviews"}
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-serif text-xl sm:text-2xl text-brown font-normal">
                    Share Your Shore Nails Experience
                  </p>
                  <p className="mt-1 text-sm sm:text-base text-ink-soft">
                    Visited us recently for a manicure, pedicure, nail enhancement, or waxing service?
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={openReviewModal}
              className="btn-primary !py-3.5 !px-7 text-[0.88rem] shrink-0 w-full sm:w-auto cursor-pointer"
            >
              <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
              <span>WRITE A REVIEW</span>
            </button>
          </div>
        </Reveal>

        {/* Approved Reviews Grid OR Honest Empty State */}
        <div className="mt-10 sm:mt-14">
          {loading ? (
            <div
              aria-live="polite"
              className="mx-auto max-w-2xl rounded-2xl border border-beige bg-cream/60 p-10 text-center text-taupe"
            >
              Loading customer reviews&hellip;
            </div>
          ) : reviews.length === 0 ? (
            <Reveal>
              <div className="mx-auto max-w-2xl rounded-2xl border border-beige bg-cream p-8 sm:p-12 text-center shadow-xs">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sand/70 border border-beige text-champagne">
                  <Star className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-5 font-serif text-2xl sm:text-[1.75rem] text-brown font-normal">
                  Be the first to share your Shore Nails experience.
                </p>
                <p className="mt-2.5 text-sm sm:text-base text-ink-soft max-w-md mx-auto leading-relaxed">
                  We welcome honest feedback from our salon guests. Click below to submit your review.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={openReviewModal}
                    className="btn-outline !py-3 !px-6 text-[0.85rem] cursor-pointer"
                  >
                    <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
                    <span>WRITE A REVIEW</span>
                  </button>
                </div>
              </div>
            </Reveal>
          ) : (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review, index) => (
                <li
                  key={review.id}
                  className="animate-fade-up flex flex-col justify-between rounded-2xl border border-beige bg-cream p-6 sm:p-7 shadow-xs"
                  style={{ animationDelay: `${(index % 6) * 60}ms` }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <StarRow rating={review.rating} sizeClass="h-4 w-4" />
                      <time
                        dateTime={review.created_at}
                        className="text-xs text-taupe font-medium"
                      >
                        {formatReviewDate(review.created_at)}
                      </time>
                    </div>

                    <p className="mt-4 text-[0.98rem] sm:text-[1.04rem] leading-relaxed text-brown whitespace-pre-line break-words">
                      &ldquo;{review.review_text}&rdquo;
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-beige/80 flex items-center justify-between">
                    <span className="font-serif text-lg text-brown font-medium">
                      {review.customer_name}
                    </span>
                    <span className="text-[0.7rem] tracking-[0.16em] text-taupe uppercase font-medium">
                      Customer Review
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Mobile-Friendly Review Submission Modal */}
      {isFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={formTitleId}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-brown/75 p-3 sm:p-6 backdrop-blur-xs animate-fade-in overflow-y-auto"
          onClick={closeReviewModal}
        >
          <div
            className="relative my-auto w-full max-w-xl rounded-2xl border border-beige bg-ivory p-6 sm:p-8 shadow-xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-beige pb-4">
              <div>
                <p className="text-[0.72rem] font-semibold tracking-[0.22em] text-taupe uppercase">
                  Shore Nails &bull; Northfield, NJ
                </p>
                <h3
                  id={formTitleId}
                  className="mt-1 font-serif text-2xl sm:text-3xl text-brown font-normal"
                >
                  Write a Customer Review
                </h3>
              </div>

              <button
                type="button"
                onClick={closeReviewModal}
                disabled={submitting}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-beige bg-cream text-brown transition-colors hover:border-champagne hover:text-champagne cursor-pointer"
                aria-label="Close review form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                </div>
                <h4 className="mt-4 font-serif text-2xl text-brown font-normal">
                  Thank You for Your Review
                </h4>
                <p className="mt-2.5 text-sm sm:text-base text-ink-soft leading-relaxed max-w-md mx-auto">
                  {submitSuccess}
                </p>
                <div className="mt-7">
                  <button
                    type="button"
                    onClick={closeReviewModal}
                    className="btn-primary !py-3 !px-8 text-[0.86rem] cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-5" noValidate>
                {/* Honeypot field hidden from human visitors */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="review-website-field">Website</label>
                  <input
                    id="review-website-field"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {/* 1. Star Rating */}
                <div>
                  <label className="block text-sm font-semibold tracking-wide text-brown uppercase">
                    Your Rating <span className="text-rose">*</span>
                  </label>
                  <div
                    role="radiogroup"
                    aria-label="Star rating from 1 to 5"
                    className="mt-2 flex items-center gap-2"
                  >
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const active = (hoverRating || rating) >= starValue;
                      return (
                        <button
                          key={starValue}
                          type="button"
                          role="radio"
                          aria-checked={rating === starValue}
                          aria-label={`${starValue} ${starValue === 1 ? "star" : "stars"}`}
                          onClick={() => setRating(starValue)}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1.5 rounded-lg focus:outline-hidden transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star
                            className={`h-7 w-7 sm:h-8 sm:w-8 transition-colors ${
                              active
                                ? "fill-champagne text-champagne"
                                : "fill-transparent text-beige-dark"
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-sm font-medium text-taupe">
                      {rating} out of 5 stars
                    </span>
                  </div>
                </div>

                {/* 2. Customer Display Name */}
                <div>
                  <label
                    htmlFor="review-customer-name"
                    className="block text-sm font-medium text-brown"
                  >
                    Your Name (Displayed Publicly){" "}
                    <span className="text-rose">*</span>
                  </label>
                  <input
                    id="review-customer-name"
                    type="text"
                    required
                    maxLength={80}
                    placeholder="e.g., Sarah M."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-beige bg-cream px-4 py-3 text-base text-brown placeholder:text-taupe-light focus:border-champagne focus:outline-hidden"
                  />
                </div>

                {/* 3. Private Contact Information (Email OR Phone) */}
                <div className="rounded-xl border border-beige bg-sand/40 p-4">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck
                      className="h-4.5 w-4.5 text-champagne shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-brown">
                        Private Contact Details (Provide Email or Phone){" "}
                        <span className="text-rose">*</span>
                      </p>
                      <p className="mt-0.5 text-xs text-taupe leading-relaxed">
                        Privacy Notice: Your email address and phone number are used strictly for internal review administration by Shore Nails and are never displayed publicly or shared.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3.5 grid gap-3.5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="review-contact-email"
                        className="block text-xs font-medium text-brown"
                      >
                        Email Address
                      </label>
                      <input
                        id="review-contact-email"
                        type="email"
                        maxLength={255}
                        placeholder="you@example.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-beige bg-cream px-3.5 py-2.5 text-base sm:text-sm text-brown placeholder:text-taupe-light focus:border-champagne focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="review-contact-phone"
                        className="block text-xs font-medium text-brown"
                      >
                        Phone Number
                      </label>
                      <input
                        id="review-contact-phone"
                        type="tel"
                        maxLength={40}
                        placeholder="(609) 555-0123"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-beige bg-cream px-3.5 py-2.5 text-base sm:text-sm text-brown placeholder:text-taupe-light focus:border-champagne focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Written Review */}
                <div>
                  <div className="flex items-baseline justify-between">
                    <label
                      htmlFor="review-text"
                      className="block text-sm font-medium text-brown"
                    >
                      Your Review <span className="text-rose">*</span>
                    </label>
                    <span className="text-xs text-taupe">
                      {reviewText.trim().length} / 1500
                    </span>
                  </div>
                  <textarea
                    id="review-text"
                    required
                    rows={4}
                    minLength={10}
                    maxLength={1500}
                    placeholder="Share your experience with our nail care, pedicure, or waxing services..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-beige bg-cream px-4 py-3 text-base text-brown placeholder:text-taupe-light focus:border-champagne focus:outline-hidden"
                  />
                </div>

                {/* 5. Explicit Publication Consent Checkbox */}
                <div className="rounded-xl border border-beige bg-cream p-3.5">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={consentToPublish}
                      onChange={(e) => setConsentToPublish(e.target.checked)}
                      className="mt-1 h-4.5 w-4.5 rounded border-beige text-brown accent-brown cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                      I confirm this review reflects my own genuine experience at Shore Nails, and I give permission for Shore Nails to publicly publish my review and display name on this website.{" "}
                      <span className="text-rose">*</span>
                    </span>
                  </label>
                </div>

                {formError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose bg-blush-soft px-4 py-3 text-sm text-brown font-medium"
                  >
                    {formError}
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeReviewModal}
                    disabled={submitting}
                    className="btn-outline w-full sm:w-auto !py-3 !px-6 text-[0.84rem] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full sm:w-auto !py-3 !px-7 text-[0.84rem] cursor-pointer disabled:opacity-60"
                  >
                    {submitting ? "Submitting Review..." : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

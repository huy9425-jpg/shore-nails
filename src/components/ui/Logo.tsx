interface LogoProps {
  /** Use the light variant on dark backgrounds (e.g. footer). */
  variant?: "dark" | "light";
  className?: string;
  showSubtitle?: boolean;
}

/**
 * Pure Typographic Wordmark for SHORE NAILS.
 * Built with refined CSS typography:
 * - "SHORE" in a sophisticated serif typeface
 * - "NAILS" in elegant letter-spaced uppercase
 * - Displays only "SHORE NAILS" in the header as requested.
 * - No illustrations, icons, hands, or cliparts
 */
export function Logo({
  variant = "dark",
  className = "",
  showSubtitle = false,
}: LogoProps) {
  const isLight = variant === "light";
  const textColor = isLight ? "text-cream" : "text-brown";
  const subColor = isLight ? "text-taupe-light" : "text-taupe";
  const accentColor = isLight ? "text-champagne-light" : "text-champagne";

  return (
    <span
      className={`inline-flex flex-col tracking-normal select-none transition-opacity duration-300 hover:opacity-90 ${className}`}
      aria-label="SHORE NAILS"
    >
      <span className="flex items-baseline gap-2 sm:gap-2.5 leading-none">
        <span
          className={`font-serif text-[1.45rem] sm:text-[1.8rem] md:text-[2rem] font-normal tracking-[0.08em] uppercase ${textColor}`}
        >
          SHORE
        </span>
        <span
          className={`font-sans text-[0.82rem] sm:text-[0.92rem] font-medium tracking-[0.32em] sm:tracking-[0.38em] uppercase ${accentColor}`}
        >
          NAILS
        </span>
      </span>

      {showSubtitle && (
        <span
          className={`mt-1.5 text-[0.6rem] sm:text-[0.66rem] font-medium tracking-[0.32em] sm:tracking-[0.36em] uppercase leading-none ${subColor}`}
        >
          Northfield, NJ
        </span>
      )}
    </span>
  );
}

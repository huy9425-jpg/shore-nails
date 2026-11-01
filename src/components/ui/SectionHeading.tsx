import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  /** Id placed on the <h2>, used by the section's `aria-labelledby`. */
  titleId?: string;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  titleId,
  description,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <Reveal
      className={`${centered ? "mx-auto max-w-2xl text-center" : "max-w-xl"} ${className}`}
    >
      <p className={`eyebrow ${centered ? "justify-center" : ""}`}>{eyebrow}</p>
      <h2 id={titleId} className="heading-lg mt-5">
        {title}
      </h2>
      {description ? (
        <p className="mt-6 text-base leading-relaxed text-ink-soft sm:text-lg">{description}</p>
      ) : null}
    </Reveal>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { galleryCategories, galleryItems, type GalleryCategory } from "@/data/gallery";
import { siteConfig } from "@/config/site";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Filter = "All" | GalleryCategory;
const filters: Filter[] = ["All", ...galleryCategories];

export function Gallery() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visibleItems = useMemo(
    () =>
      activeFilter === "All"
        ? galleryItems
        : galleryItems.filter((item) => item.category === activeFilter),
    [activeFilter],
  );

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="bg-sand/20 py-20 sm:py-28 lg:py-32 border-t border-beige"
    >
      <div className="container-lux">
        <SectionHeading
          eyebrow="Nail Portfolio"
          titleId="gallery-heading"
          title={
            <>
              Explore Our <span className="text-champagne italic">Nail Artistry</span>
            </>
          }
          description="Browse our curated collection of 45 salon-crafted designs across 15 specialties: dipping powder, sculpted acrylics, builder gels, French tips, ombre blends, spa pedicures, and waxing care. Tap any photo to enlarge."
        />

        {/* 15 Category Filter Pills with larger text and touch-friendly padding */}
        <Reveal className="mt-10 sm:mt-12">
          <div
            role="group"
            aria-label="Filter gallery by style"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 scrollbar-none"
          >
            {filters.map((filter) => {
              const active = filter === activeFilter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  aria-pressed={active}
                  className={`shrink-0 rounded-full border px-5 sm:px-6 py-2.5 text-[0.82rem] sm:text-[0.88rem] font-medium tracking-[0.08em] uppercase transition-all duration-300 ${
                    active
                      ? "border-brown bg-brown text-cream shadow-xs"
                      : "border-beige bg-cream text-brown hover:border-champagne hover:text-champagne"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Responsive Grid: 2 columns on mobile, 2 on tablet, 3 on desktop */}
        <ul
          key={activeFilter}
          className="mt-10 sm:mt-12 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6"
          aria-live="polite"
        >
          {visibleItems.map((item, index) => (
            <li
              key={item.id}
              className="animate-zoom-in group flex flex-col"
              style={{ animationDelay: `${(index % 6) * 60}ms` }}
            >
              <button
                type="button"
                onClick={() => setLightboxIndex(index)}
                className="relative block w-full overflow-hidden rounded-xl border border-beige bg-sand text-left cursor-pointer focus:outline-hidden aspect-[4/5]"
                aria-label={`Enlarge photo: ${item.title} (${item.category})`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1024px) 24rem, (min-width: 640px) 45vw, 48vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-brown/85 via-brown/25 to-transparent p-3 sm:p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  <span className="text-[0.68rem] sm:text-[0.74rem] tracking-[0.18em] text-champagne-light uppercase font-semibold">
                    {item.category}
                  </span>
                  <span className="mt-0.5 font-serif text-sm sm:text-lg lg:text-xl text-cream font-normal line-clamp-2">
                    {item.title}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex h-8 w-8 sm:h-9 sm:w-9 scale-75 items-center justify-center rounded-full bg-cream text-brown opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 shadow-xs"
                >
                  <Expand className="h-4 w-4" />
                </span>
              </button>

              <div className="mt-2.5 px-1 sm:px-1.5 flex items-baseline justify-between">
                <span className="font-serif text-[1.1rem] sm:text-[1.2rem] text-brown font-normal line-clamp-1">
                  {item.title}
                </span>
                <span className="text-[0.72rem] sm:text-[0.78rem] text-taupe font-medium tracking-wider uppercase shrink-0 ml-2">
                  {item.category}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* Instagram Link Banner */}
        <Reveal className="mt-12 sm:mt-16 text-center">
          <a
            href={siteConfig.social.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline !py-3.5 !px-7 text-[0.88rem]"
            aria-label={`View more photos on Instagram at ${siteConfig.social.instagram.handle}`}
          >
            <InstagramIcon className="h-4.5 w-4.5" />
            <span>Follow {siteConfig.social.instagram.handle} on Instagram</span>
          </a>
        </Reveal>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && visibleItems[lightboxIndex] && (
        <Lightbox
          items={visibleItems}
          index={lightboxIndex}
          onChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}

interface LightboxProps {
  items: typeof galleryItems;
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
}

function Lightbox({ items, index, onChange, onClose }: LightboxProps) {
  const item = items[index];
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  const showPrev = useCallback(
    () => onChange((index - 1 + items.length) % items.length),
    [index, items.length, onChange],
  );
  const showNext = useCallback(
    () => onChange((index + 1) % items.length),
    [index, items.length, onChange],
  );

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, showPrev, showNext]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title} — image ${index + 1} of ${items.length}`}
      className="fixed inset-0 z-[100] flex animate-fade-in items-center justify-center bg-brown/95 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 50) {
          if (delta > 0) showPrev();
          else showNext();
        }
        touchStartX.current = null;
      }}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 flex h-12 w-12 items-center justify-center rounded-full border border-cream/30 text-cream transition-colors hover:border-champagne hover:bg-champagne hover:text-brown"
        aria-label="Close image viewer"
      >
        <X className="h-6 w-6" />
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            className="absolute left-2.5 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-cream/30 bg-brown/60 text-cream transition-colors hover:border-champagne hover:bg-champagne hover:text-brown sm:left-6"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            className="absolute right-2.5 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-cream/30 bg-brown/60 text-cream transition-colors hover:border-champagne hover:bg-champagne hover:text-brown sm:right-6"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <figure
        key={item.id}
        className="flex max-h-full animate-zoom-in flex-col items-center select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-h-[72vh] max-w-full">
          <Image
            src={item.src}
            alt={item.alt}
            width={item.width}
            height={item.height}
            sizes="92vw"
            className="h-auto max-h-[72vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
          />
        </div>
        <figcaption className="mt-4 text-center max-w-xl">
          <p className="text-[0.74rem] tracking-[0.24em] text-champagne-light uppercase font-semibold">
            {item.category}
          </p>
          <p className="mt-1 font-serif text-xl sm:text-2xl text-cream font-normal">
            {item.title}
          </p>
          <p className="mt-1.5 text-xs text-cream/70">
            Image {index + 1} of {items.length} &bull; Photo by {item.author} ({item.license})
          </p>
        </figcaption>
      </figure>
    </div>
  );
}

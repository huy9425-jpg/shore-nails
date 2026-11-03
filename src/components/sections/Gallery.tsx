"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, Grid, X } from "lucide-react";
import {
  galleryCategories,
  galleryItems,
} from "@/data/gallery";
import type { PublicGalleryItem, PublicGalleryResponse } from "@/lib/gallery/types";
import { siteConfig } from "@/config/site";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Filter = "All" | string;

/**
 * 6 curated highlight IDs displayed initially on the homepage
 * so mobile and desktop visitors enjoy a compact, fast-loading preview.
 */
const HOMEPAGE_FEATURED_IDS = [
  "gallery-01", // Sculpted Coffin Acrylic Full Set
  "gallery-04", // Natural Almond Dip Powder
  "gallery-13", // Soft Pastel Ombre Blend
  "gallery-16", // Classic Pink & White French Set
  "gallery-22", // Modern Crisp French Tips
  "gallery-41", // Pearlescent Bridal Manicure
] as const;

export function Gallery() {
  const [items, setItems] = useState<PublicGalleryItem[]>(() =>
    galleryItems.map((item) => ({
      id: item.id,
      src: item.src,
      alt: item.alt,
      title: item.title,
      category: item.category,
      width: item.width,
      height: item.height,
      author: item.author,
      license: item.license,
      isCustom: false,
    })),
  );
  const [categories, setCategories] = useState<string[]>(() =>
    Array.from(galleryCategories),
  );
  const filters: Filter[] = useMemo(() => ["All", ...categories], [categories]);

  const [isExpandedOpen, setIsExpandedOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [lightboxState, setLightboxState] = useState<{
    items: PublicGalleryItem[];
    index: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch("/api/gallery", {
      method: "GET",
      cache: "no-store",
    })
      .then((res) => (res.ok ? (res.json() as Promise<PublicGalleryResponse>) : null))
      .then((data) => {
        if (!mounted || !data) return;
        if (Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        }
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch(() => {
        // Fallback silently to static gallery items
      });

    return () => {
      mounted = false;
    };
  }, []);

  const featuredItems = useMemo(() => {
    const customItems = items.filter((item) => item.isCustom);
    if (customItems.length > 0) {
      const topCustom = customItems.slice(0, 2);
      const remainingSlots = 6 - topCustom.length;
      const staticSelected = HOMEPAGE_FEATURED_IDS.map((id) =>
        items.find((item) => item.id === id),
      )
        .filter((item): item is PublicGalleryItem => Boolean(item))
        .slice(0, remainingSlots);

      return [...topCustom, ...staticSelected];
    }

    const selected = HOMEPAGE_FEATURED_IDS.map((id) =>
      items.find((item) => item.id === id),
    ).filter((item): item is PublicGalleryItem => Boolean(item));

    return selected.length === 6 ? selected : items.slice(0, 6);
  }, [items]);

  const filteredModalItems = useMemo(
    () =>
      activeFilter === "All"
        ? items
        : items.filter((item) => item.category === activeFilter),
    [items, activeFilter],
  );

  // Lock background page scroll when full gallery modal is open
  useEffect(() => {
    if (!isExpandedOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isExpandedOpen]);

  // Close expanded gallery on Escape only when Lightbox is not active
  useEffect(() => {
    if (!isExpandedOpen || lightboxState !== null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpandedOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isExpandedOpen, lightboxState]);

  const openExpandedGallery = (initialFilter: Filter = "All") => {
    setActiveFilter(initialFilter);
    setIsExpandedOpen(true);
  };

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
          description="A curated preview of our salon-crafted nail designs. Tap any photograph to enlarge, or view all 45 designs across 15 specialty categories."
        />

        {/* Compact Homepage Grid: 6 selected photographs (2 cols mobile, 3 cols desktop) */}
        <ul
          className="mt-10 sm:mt-12 grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6"
          aria-label="Featured nail designs"
        >
          {featuredItems.map((item, index) => (
            <li
              key={item.id}
              className="animate-zoom-in group flex flex-col"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <button
                type="button"
                onClick={() =>
                  setLightboxState({ items: featuredItems, index })
                }
                className="relative block w-full overflow-hidden rounded-xl border border-beige bg-sand text-left cursor-pointer focus:outline-hidden aspect-[4/5]"
                aria-label={`Enlarge photo: ${item.title} (${item.category})`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  loading="lazy"
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

              <div className="mt-2.5 px-1 sm:px-1.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-2">
                <span className="font-serif text-[1rem] sm:text-[1.2rem] text-brown font-normal line-clamp-1">
                  {item.title}
                </span>
                <span className="text-[0.68rem] sm:text-[0.76rem] text-taupe font-medium tracking-wider uppercase shrink-0">
                  {item.category}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* Primary CTA: VIEW ALL DESIGNS + Instagram Link */}
        <Reveal className="mt-10 sm:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => openExpandedGallery("All")}
            className="btn-primary !py-4 !px-8 text-[0.9rem] w-full sm:w-auto cursor-pointer"
          >
            <Grid className="h-4 w-4" aria-hidden="true" />
            <span>VIEW ALL DESIGNS</span>
            <span className="ml-1 rounded-full bg-cream/20 px-2.5 py-0.5 text-[0.74rem] font-normal tracking-wider">
              {items.length}
            </span>
          </button>

          <a
            href={siteConfig.social.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline !py-3.5 !px-7 text-[0.88rem] w-full sm:w-auto"
            aria-label={`View more photos on Instagram at ${siteConfig.social.instagram.handle}`}
          >
            <InstagramIcon className="h-4.5 w-4.5" />
            <span>Follow {siteConfig.social.instagram.handle}</span>
          </a>
        </Reveal>
      </div>

      {/* Expanded Full-Portfolio Modal (All 15 Categories & 45 Photographs) */}
      {isExpandedOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="expanded-gallery-title"
          className="fixed inset-0 z-[90] flex flex-col bg-ivory animate-fade-in overflow-y-auto"
        >
          {/* Sticky Modal Header & Category Filters */}
          <div className="sticky top-0 z-20 border-b border-beige bg-ivory/95 backdrop-blur-md shadow-xs">
            <div className="container-lux py-4 sm:py-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.72rem] font-semibold tracking-[0.22em] text-taupe uppercase">
                  Shore Nails Portfolio &bull; {filteredModalItems.length} of {items.length} Designs
                </p>
                <h3
                  id="expanded-gallery-title"
                  className="font-serif text-xl sm:text-2xl lg:text-3xl text-brown font-normal"
                >
                  Complete Nail &amp; Spa Gallery
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsExpandedOpen(false)}
                className="inline-flex items-center gap-2 rounded-full border border-brown/30 bg-cream px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-medium tracking-[0.1em] uppercase text-brown transition-colors hover:border-brown hover:bg-brown hover:text-cream cursor-pointer shrink-0"
                aria-label="Close full gallery and return to homepage"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span>Close Gallery</span>
              </button>
            </div>

            {/* 15 Category Filter Pills */}
            <div className="border-t border-beige/60 bg-cream/60 py-3">
              <div className="container-lux">
                <div
                  role="group"
                  aria-label="Filter gallery by style"
                  className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 scrollbar-none"
                >
                  {filters.map((filter) => {
                    const active = filter === activeFilter;
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setActiveFilter(filter)}
                        aria-pressed={active}
                        className={`shrink-0 rounded-full border px-4 sm:px-5 py-2 text-[0.78rem] sm:text-[0.84rem] font-medium tracking-[0.08em] uppercase transition-all duration-200 cursor-pointer ${
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
              </div>
            </div>
          </div>

          {/* Expanded Gallery Grid */}
          <div className="container-lux py-8 sm:py-12 flex-1">
            <ul
              key={activeFilter}
              className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6"
              aria-live="polite"
            >
              {filteredModalItems.map((item, index) => (
                <li
                  key={item.id}
                  className="animate-zoom-in group flex flex-col"
                  style={{ animationDelay: `${(index % 6) * 40}ms` }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxState({ items: filteredModalItems, index })
                    }
                    className="relative block w-full overflow-hidden rounded-xl border border-beige bg-sand text-left cursor-pointer focus:outline-hidden aspect-[4/5]"
                    aria-label={`Enlarge photo: ${item.title} (${item.category})`}
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      loading="lazy"
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

                  <div className="mt-2.5 px-1 sm:px-1.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-2">
                    <span className="font-serif text-[1rem] sm:text-[1.18rem] text-brown font-normal line-clamp-1">
                      {item.title}
                    </span>
                    <span className="text-[0.68rem] sm:text-[0.76rem] text-taupe font-medium tracking-wider uppercase shrink-0">
                      {item.category}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-12 pt-8 border-t border-beige text-center">
              <button
                type="button"
                onClick={() => setIsExpandedOpen(false)}
                className="btn-outline !py-3.5 !px-8 text-[0.86rem] cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span>Return to Homepage</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxState !== null && lightboxState.items[lightboxState.index] && (
        <Lightbox
          items={lightboxState.items}
          index={lightboxState.index}
          onChange={(newIndex) =>
            setLightboxState((prev) =>
              prev ? { ...prev, index: newIndex } : null,
            )
          }
          onClose={() => setLightboxState(null)}
        />
      )}
    </section>
  );
}

interface LightboxProps {
  items: PublicGalleryItem[];
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
        className="absolute top-4 right-4 flex h-12 w-12 items-center justify-center rounded-full border border-cream/30 text-cream transition-colors hover:border-champagne hover:bg-champagne hover:text-brown cursor-pointer"
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
            className="absolute left-2.5 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-cream/30 bg-brown/60 text-cream transition-colors hover:border-champagne hover:bg-champagne hover:text-brown sm:left-6 cursor-pointer"
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
            className="absolute right-2.5 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-cream/30 bg-brown/60 text-cream transition-colors hover:border-champagne hover:bg-champagne hover:text-brown sm:right-6 cursor-pointer"
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
            Image {index + 1} of {items.length} &bull;{" "}
            {item.author
              ? `Photo by ${item.author} (${item.license})`
              : "Shore Nails Client Portfolio"}
          </p>
        </figcaption>
      </figure>
    </div>
  );
}

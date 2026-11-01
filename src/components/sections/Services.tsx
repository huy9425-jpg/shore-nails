"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowDown, Check, Sparkles } from "lucide-react";
import { coreServices11, serviceCategories } from "@/data/services";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Services() {
  const [viewMode, setViewMode] = useState<"services" | "categories">("services");

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative bg-sand/30 py-20 sm:py-28 lg:py-32 border-y border-beige"
    >
      <div className="container-lux">
        <SectionHeading
          eyebrow="Our Salon Services"
          titleId="services-heading"
          title={
            <>
              Comprehensive Care for <span className="text-champagne italic">Hands, Feet &amp; Skin</span>
            </>
          }
          description="From soothing spa pedicures and gentle manicures to precision builder gels, dipping systems, and smooth waxing treatments."
        />

        {/* View Toggle (11 Core Services vs Full Service Categories) */}
        <div className="mt-10 sm:mt-12 flex justify-center">
          <div className="inline-flex rounded-full border border-beige bg-cream p-1.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("services")}
              className={`rounded-full px-5 sm:px-7 py-2.5 text-[0.84rem] sm:text-[0.9rem] font-medium tracking-[0.08em] uppercase transition-all duration-300 ${
                viewMode === "services"
                  ? "bg-brown text-cream shadow-xs"
                  : "text-brown/80 hover:text-brown"
              }`}
            >
              11 Core Services
            </button>
            <button
              type="button"
              onClick={() => setViewMode("categories")}
              className={`rounded-full px-5 sm:px-7 py-2.5 text-[0.84rem] sm:text-[0.9rem] font-medium tracking-[0.08em] uppercase transition-all duration-300 ${
                viewMode === "categories"
                  ? "bg-brown text-cream shadow-xs"
                  : "text-brown/80 hover:text-brown"
              }`}
            >
              Category Overview
            </button>
          </div>
        </div>

        {/* VIEW 1: 11 Core Services Grid */}
        {viewMode === "services" && (
          <div className="mt-12 sm:mt-14 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {coreServices11.map((service, idx) => (
              <Reveal
                key={service.id}
                delay={(idx % 3) * 80}
                className="flex flex-col rounded-2xl border border-beige bg-cream overflow-hidden shadow-xs transition-all duration-300 hover:border-champagne"
              >
                {/* Photo Header */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    sizes="(min-width: 1024px) 24rem, (min-width: 640px) 45vw, 92vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-brown/65 via-transparent to-transparent"
                  />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span className="text-[0.74rem] font-medium tracking-[0.16em] text-cream uppercase">
                      {service.category}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-brown/40 px-2 py-0.5 text-[0.68rem] text-cream backdrop-blur-xs">
                      <Sparkles className="h-3 w-3 text-champagne-light" />
                      <span>Shore Nails</span>
                    </span>
                  </div>
                </div>

                {/* Details (Titles 21-24px, readable body text 16-18px) */}
                <div className="flex flex-col flex-1 p-6 sm:p-7">
                  <h3 className="font-serif text-[1.38rem] sm:text-[1.55rem] text-brown font-normal leading-snug">
                    {service.name}
                  </h3>
                  <p className="mt-1 text-[0.8rem] tracking-[0.14em] text-taupe uppercase font-medium">
                    {service.tagline}
                  </p>
                  <p className="mt-3.5 text-[1rem] sm:text-[1.0625rem] leading-relaxed text-ink-soft flex-1">
                    {service.description}
                  </p>
                  <div className="mt-6 pt-4 border-t border-beige flex items-center justify-between text-sm text-brown">
                    <a
                      href="#prices"
                      className="inline-flex items-center gap-1.5 font-medium text-champagne hover:text-brown transition-colors text-[0.92rem]"
                    >
                      <span>Check menu &amp; pricing</span>
                      <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {/* VIEW 2: 5 Categorized Overview Cards */}
        {viewMode === "categories" && (
          <div className="mt-12 sm:mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {serviceCategories.map((category, idx) => (
              <Reveal
                key={category.id}
                delay={idx * 80}
                className={`flex flex-col rounded-2xl border border-beige bg-cream overflow-hidden shadow-xs transition-all duration-300 hover:border-champagne ${
                  idx === 0 ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-sand">
                  <Image
                    src={category.image.src}
                    alt={category.image.alt}
                    fill
                    sizes="(min-width: 1024px) 24rem, (min-width: 768px) 45vw, 92vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-brown/60 via-transparent to-transparent"
                  />
                  <span className="absolute bottom-3 left-4 text-[0.74rem] font-medium tracking-[0.18em] text-cream uppercase">
                    {category.tagline}
                  </span>
                </div>

                <div className="flex flex-col flex-1 p-6 sm:p-7">
                  <h3 className="font-serif text-[1.48rem] sm:text-[1.65rem] text-brown font-normal">
                    {category.title}
                  </h3>
                  <p className="mt-2.5 text-[1rem] leading-relaxed text-ink-soft">
                    {category.description}
                  </p>

                  <ul className="mt-6 space-y-2.5 border-t border-beige pt-5 text-[0.95rem] sm:text-[1rem] text-brown">
                    {category.items.map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-champagne shrink-0" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {/* Callout to Dedicated Price List */}
        <Reveal className="mt-14 sm:mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-beige bg-cream px-7 py-4.5 shadow-2xs">
            <p className="text-[1rem] sm:text-[1.0625rem] text-ink-soft">
              Looking for exact service costs? View our complete price breakdown below.
            </p>
            <a href="#prices" className="btn-primary !px-6 !py-3 text-[0.84rem]">
              <span>View Price List</span>
              <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

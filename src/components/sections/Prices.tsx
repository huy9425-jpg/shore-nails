"use client";

import { useEffect, useState } from "react";
import { Phone, Info } from "lucide-react";
import { priceList, unlistedPriceNotice, type PriceCategory } from "@/data/prices";
import type { PublicPricingResponse } from "@/lib/pricing/types";
import { siteConfig } from "@/config/site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Prices() {
  const [categories, setCategories] = useState<PriceCategory[]>(() => priceList);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    let mounted = true;

    fetch("/api/prices", {
      method: "GET",
      cache: "no-store",
    })
      .then((res) => (res.ok ? (res.json() as Promise<PublicPricingResponse>) : null))
      .then((data) => {
        if (!mounted || !data) return;
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch(() => {
        // Fallback silently to static priceList
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredCategories =
    activeTab === "all"
      ? categories
      : categories.filter((cat) => cat.id === activeTab);

  return (
    <section
      id="prices"
      aria-labelledby="prices-heading"
      className="relative bg-ivory py-20 sm:py-28 lg:py-32"
    >
      <div className="container-lux">
        <SectionHeading
          eyebrow="Transparent Pricing"
          titleId="prices-heading"
          title={
            <>
              Salon Menu &amp; <span className="text-champagne italic">Price List</span>
            </>
          }
          description="Clear, honest pricing for all our nail care, spa pedicure, waxing, and men's grooming services. Confirmed prices in USD."
        />

        {/* Category Tabs for Fast Mobile & Desktop Filtering */}
        <Reveal className="mt-10 sm:mt-12">
          <div
            role="tablist"
            aria-label="Filter price categories"
            className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 scrollbar-none"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              className={`shrink-0 rounded-full border px-5 sm:px-6 py-2.5 text-[0.84rem] sm:text-[0.9rem] font-medium tracking-[0.08em] uppercase transition-all duration-300 ${
                activeTab === "all"
                  ? "border-brown bg-brown text-cream shadow-xs"
                  : "border-beige bg-cream text-brown hover:border-champagne hover:text-champagne"
              }`}
            >
              All Services
            </button>
            {categories.map((cat) => {
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(cat.id)}
                  className={`shrink-0 rounded-full border px-5 sm:px-6 py-2.5 text-[0.84rem] sm:text-[0.9rem] font-medium tracking-[0.08em] uppercase transition-all duration-300 ${
                    isActive
                      ? "border-brown bg-brown text-cream shadow-xs"
                      : "border-beige bg-cream text-brown hover:border-champagne hover:text-champagne"
                  }`}
                >
                  {cat.category}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Price Tables Grid */}
        <div className="mt-12 sm:mt-16 grid gap-8 lg:grid-cols-2 items-start">
          {filteredCategories.map((cat, idx) => (
            <Reveal
              key={cat.id}
              delay={idx * 60}
              className="rounded-2xl border border-beige bg-cream p-6 sm:p-8 shadow-xs"
            >
              {/* Category Header */}
              <div className="border-b border-beige pb-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-serif text-[1.65rem] sm:text-[1.9rem] text-brown font-normal">
                    {cat.category}
                  </h3>
                  <span className="text-[0.78rem] tracking-[0.18em] text-taupe uppercase font-semibold">
                    USD
                  </span>
                </div>
                {cat.description && (
                  <p className="mt-2 text-[0.98rem] sm:text-[1.04rem] text-ink-soft leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              {/* Price Items List (17-19px item names, 22-26px price numbers) */}
              <ul className="mt-6 divide-y divide-beige/80">
                {cat.items.map((item) => {
                  const isContactPrice =
                    item.isUnconfirmed ||
                    item.price.toLowerCase().includes("contact");
                  return (
                    <li
                      key={item.name}
                      className="flex flex-col sm:flex-row sm:items-baseline justify-between py-4 gap-1.5 sm:gap-4 group"
                    >
                      <div className="flex-1">
                        <span className="text-[1.08rem] sm:text-[1.16rem] font-medium text-brown">
                          {item.name}
                        </span>
                        {item.duration && (
                          <span className="block text-xs sm:text-sm text-taupe mt-0.5">
                            {item.duration}
                          </span>
                        )}
                        {item.note && (
                          <span className="block text-xs sm:text-sm text-taupe italic mt-0.5">
                            {item.note}
                          </span>
                        )}
                      </div>

                      {/* Dotted leader for tablet/desktop */}
                      <div
                        aria-hidden="true"
                        className="hidden sm:block flex-1 border-b border-dotted border-beige-dark mb-1.5"
                      />

                      {/* Price Display */}
                      {isContactPrice ? (
                        <span className="inline-flex items-center rounded-full bg-blush-soft border border-blush/80 px-3.5 py-1 text-xs sm:text-[0.84rem] font-medium text-brown tracking-normal self-start sm:self-auto">
                          Contact us for pricing
                        </span>
                      ) : (
                        <span className="font-serif text-[1.38rem] sm:text-[1.625rem] font-normal text-brown tracking-tight self-start sm:self-auto">
                          {item.price}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          ))}
        </div>

        {/* Notice for unconfirmed services */}
        <Reveal className="mt-12 sm:mt-16 mx-auto max-w-3xl">
          <div className="rounded-2xl border border-beige bg-cream p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand/60 text-champagne mt-0.5 border border-beige">
                <Info className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[1rem] sm:text-[1.08rem] font-medium text-brown">
                  {unlistedPriceNotice.text}
                </p>
                <p className="text-xs sm:text-sm text-ink-soft mt-1 leading-relaxed">
                  {unlistedPriceNotice.phonePrompt}
                </p>
              </div>
            </div>

            <a
              href={`tel:${siteConfig.contact.phoneLink}`}
              className="btn-primary !px-6 !py-3 text-[0.84rem] shrink-0 w-full sm:w-auto"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span>Call For Pricing</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

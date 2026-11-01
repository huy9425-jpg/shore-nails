import Image from "next/image";
import { ArrowRight, Phone, MapPin } from "lucide-react";
import { siteConfig } from "@/config/site";
import { images } from "@/config/images";

export function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-gradient-to-b from-sand/30 via-ivory to-ivory pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28"
    >
      {/* Calm, soft ambient background tones */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-sand/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-8rem] bottom-[-6rem] h-[28rem] w-[28rem] rounded-full bg-sand/30 blur-3xl"
      />

      <div className="container-lux relative">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 xl:col-span-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-beige bg-cream px-4 py-1.5 text-[0.8rem] font-medium tracking-[0.18em] text-taupe uppercase animate-fade-up">
              <MapPin className="h-3.5 w-3.5 text-champagne" aria-hidden="true" />
              <span>{siteConfig.shortLocation}</span>
            </div>

            <h1
              id="hero-heading"
              className="heading-xl mt-5 animate-fade-up [animation-delay:100ms]"
            >
              Beautiful Nails.{" "}
              <span className="font-serif italic font-normal text-champagne">
                Beautiful Moments.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[1.0625rem] sm:text-[1.2rem] leading-relaxed text-ink-soft animate-fade-up [animation-delay:200ms]">
              Discover professional nail care, elegant custom designs, and relaxing
              spa pedicure experiences at Shore Nails in Northfield, New Jersey.
            </p>

            {/* Three primary buttons with touch-friendly dimensions */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3.5 animate-fade-up [animation-delay:300ms]">
              <a href="#services" className="btn-primary group">
                <span>Explore Our Services</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>

              <a href="#gallery" className="btn-outline">
                <span>View Our Gallery</span>
              </a>

              <a
                href={`tel:${siteConfig.contact.phoneLink}`}
                className="btn-champagne"
                aria-label={`Call Shore Nails at ${siteConfig.contact.phoneDisplay}`}
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>Call Us</span>
              </a>
            </div>

            {/* Salon Highlights Strip */}
            <dl className="mt-12 grid grid-cols-3 gap-4 sm:gap-6 border-t border-beige pt-6 animate-fade-up [animation-delay:400ms]">
              <div>
                <dt className="font-serif text-xl sm:text-[1.7rem] text-brown">Manicures</dt>
                <dd className="mt-1 text-[0.78rem] sm:text-[0.85rem] tracking-[0.16em] text-taupe uppercase font-medium">
                  &amp; Pedicures
                </dd>
              </div>
              <div>
                <dt className="font-serif text-xl sm:text-[1.7rem] text-brown">Full Sets</dt>
                <dd className="mt-1 text-[0.78rem] sm:text-[0.85rem] tracking-[0.16em] text-taupe uppercase font-medium">
                  &amp; Refills
                </dd>
              </div>
              <div>
                <dt className="font-serif text-xl sm:text-[1.7rem] text-brown">Waxing</dt>
                <dd className="mt-1 text-[0.78rem] sm:text-[0.85rem] tracking-[0.16em] text-taupe uppercase font-medium">
                  Face &amp; Body
                </dd>
              </div>
            </dl>
          </div>

          {/* Hero Image Presentation */}
          <div className="lg:col-span-5 xl:col-span-6">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm sm:max-w-md lg:max-w-lg animate-fade-in">
              {/* Subtle architectural border frame */}
              <div
                aria-hidden="true"
                className="absolute -inset-2.5 sm:-inset-3.5 rounded-t-[10rem] rounded-b-3xl border border-champagne/40"
              />

              <div className="relative h-full w-full overflow-hidden rounded-t-[10rem] rounded-b-3xl bg-sand shadow-sm">
                <Image
                  src={images.hero.src}
                  alt={images.hero.alt}
                  fill
                  priority
                  sizes="(min-width: 1280px) 32rem, (min-width: 1024px) 26rem, 90vw"
                  className="animate-slow-zoom object-cover object-[50%_35%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-brown/30 via-transparent to-transparent"
                />
              </div>

              {/* Floating address badge */}
              <div className="absolute -bottom-4 -left-3 sm:-bottom-5 sm:-left-6 rounded-xl border border-beige bg-cream p-4.5 sm:p-5.5 shadow-xs">
                <p className="font-serif text-lg sm:text-xl text-brown font-normal">
                  Shore Nails
                </p>
                <p className="mt-1 text-[0.75rem] tracking-[0.16em] text-taupe uppercase font-medium">
                  512 New Road &bull; Northfield, NJ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

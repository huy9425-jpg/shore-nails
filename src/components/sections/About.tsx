import Image from "next/image";
import { ShieldCheck, Sparkles, Sofa, HeartHandshake } from "lucide-react";
import { siteConfig } from "@/config/site";
import { images } from "@/config/images";
import { Reveal } from "@/components/ui/Reveal";

const values = [
  {
    icon: Sparkles,
    title: "Thoughtful Technique",
    text: "Precise shaping, clean cuticle maintenance, and careful polish application tailored to your personal aesthetic.",
  },
  {
    icon: ShieldCheck,
    title: "Cleanliness First",
    text: "Every workstation and tool is thoroughly cleaned, prepared, and sanitized with meticulous attention.",
  },
  {
    icon: Sofa,
    title: "Comfortable Environment",
    text: "A serene, calming ambiance designed for you to slow down, unwind, and enjoy personal pampering.",
  },
  {
    icon: HeartHandshake,
    title: "Attentive Service",
    text: "A friendly, welcoming team that listens to your preferences and ensures you leave feeling refreshed.",
  },
];

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative bg-ivory py-20 sm:py-28 lg:py-32"
    >
      <div className="container-lux">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Images Presentation */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <Reveal className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative aspect-[4/3] sm:aspect-[5/4] w-full overflow-hidden rounded-2xl bg-sand border border-beige shadow-xs">
                <Image
                  src={images.aboutMain.src}
                  alt={images.aboutMain.alt}
                  fill
                  sizes="(min-width: 1024px) 34rem, 90vw"
                  className="object-cover transition-transform duration-[1.5s] ease-out hover:scale-105"
                />
              </div>

              {/* Inset detail photo */}
              <div className="absolute -right-2 -bottom-8 sm:-right-4 sm:-bottom-10 w-36 sm:w-48 overflow-hidden rounded-xl border-4 border-ivory shadow-xs">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={images.aboutDetail.src}
                    alt={images.aboutDetail.alt}
                    fill
                    sizes="12rem"
                    className="object-cover"
                  />
                </div>
              </div>
            </Reveal>
          </div>

          {/* About Copy */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <Reveal>
              <p className="eyebrow">About Our Salon</p>
              <h2 id="about-heading" className="heading-lg mt-3 sm:mt-4">
                Local Nail Care in{" "}
                <span className="font-serif italic text-champagne">
                  Northfield, New Jersey
                </span>
              </h2>

              <p className="mt-6 text-[1.0625rem] sm:text-[1.1875rem] leading-relaxed text-ink-soft">
                At {siteConfig.shortName}, we believe beautiful nails begin with thoughtful care
                and attention to detail. From classic manicures to elegant nail enhancements
                and relaxing spa pedicures, we are here to help you feel confident and refreshed.
              </p>

              <p className="mt-4 text-[1rem] sm:text-[1.08rem] leading-relaxed text-ink-soft">
                Located conveniently on New Road in Northfield, our salon offers a welcoming,
                tranquil setting where guests can relax while receiving professional nail and
                waxing treatments.
              </p>
            </Reveal>

            {/* 4 Pillars Grid */}
            <div className="mt-10 grid gap-6 sm:grid-cols-2 border-t border-beige pt-8">
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <Reveal key={v.title} delay={i * 80} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream text-brown border border-beige shadow-2xs">
                      <Icon className="h-5 w-5 text-champagne" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-serif text-[1.25rem] sm:text-[1.38rem] text-brown font-normal leading-snug">
                        {v.title}
                      </h3>
                      <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-soft">
                        {v.text}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

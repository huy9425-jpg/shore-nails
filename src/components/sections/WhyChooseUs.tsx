import Image from "next/image";
import {
  Sparkles,
  ShieldCheck,
  Gem,
  Palette,
  HeartHandshake,
  Coffee,
} from "lucide-react";
import { images } from "@/config/images";
import { siteConfig } from "@/config/site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const highlights = [
  {
    icon: Sparkles,
    title: "Professional Nail Care",
    description:
      "Skillful technique and attentive care focused on supporting healthy natural nails, smooth cuticles, and durable finishes.",
  },
  {
    icon: Gem,
    title: "Attention to Detail",
    description:
      "Careful shaping, clean edges, and balanced symmetry in every manicure, full set, and pedicure from start to finish.",
  },
  {
    icon: Coffee,
    title: "Relaxing Spa Experience",
    description:
      "A peaceful environment designed to help you slow down, enjoy a soothing pedicure foot soak, and unwind from a busy week.",
  },
  {
    icon: Palette,
    title: "Beautiful Nail Designs",
    description:
      "From understated neutral tones and crisp French tips to dipping powder, ombre fades, and customized hand-painted art.",
  },
  {
    icon: HeartHandshake,
    title: "Friendly Customer Service",
    description:
      "A warm, welcoming local team that values your comfort and takes the time to understand the look you want.",
  },
  {
    icon: ShieldCheck,
    title: "Clean and Comfortable Environment",
    description:
      "A clean, tranquil setting where tools and workstations are thoroughly sanitized for your comfort and peace of mind.",
  },
];

export function WhyChooseUs() {
  return (
    <section
      id="why-us"
      aria-labelledby="why-us-heading"
      className="relative bg-sand/30 py-20 sm:py-28 lg:py-32 border-t border-beige"
    >
      <div className="container-lux">
        <SectionHeading
          eyebrow="The Shore Nails Experience"
          titleId="why-us-heading"
          title={
            <>
              Thoughtful Details. <span className="text-champagne italic">Lasting Quality.</span>
            </>
          }
          description={`Discover what makes visiting ${siteConfig.shortName} in Northfield a refreshing and enjoyable experience.`}
        />

        <div className="mt-14 sm:mt-18 grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* 6 Core Pillars Grid */}
          <div className="lg:col-span-7">
            <ul className="grid sm:grid-cols-2 gap-5 sm:gap-6">
              {highlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Reveal
                    as="li"
                    key={item.title}
                    delay={index * 60}
                    className="flex flex-col rounded-xl border border-beige bg-cream p-6 shadow-xs transition-all duration-300 hover:border-champagne"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sand/60 text-champagne border border-beige mb-4">
                      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <h3 className="font-serif text-[1.28rem] sm:text-[1.42rem] font-normal text-brown leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[0.98rem] sm:text-[1.04rem] leading-relaxed text-ink-soft">
                      {item.description}
                    </p>
                  </Reveal>
                );
              })}
            </ul>
          </div>

          {/* Photo Showcase */}
          <div className="lg:col-span-5">
            <Reveal delay={150} className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-2xl border border-champagne/40"
              />
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-sand shadow-xs">
                <Image
                  src={images.whyChooseUs.src}
                  alt={images.whyChooseUs.alt}
                  fill
                  sizes="(min-width: 1024px) 26rem, 90vw"
                  className="object-cover transition-transform duration-[1.5s] ease-out hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-brown/70 via-transparent to-transparent"
                />
                <div className="absolute inset-x-6 bottom-6 text-cream">
                  <p className="text-[0.74rem] tracking-[0.22em] text-champagne-light uppercase font-semibold">
                    Northfield, New Jersey
                  </p>
                  <p className="mt-1 font-serif text-xl sm:text-2xl font-normal">
                    Dedicated to your beauty, comfort &amp; relaxation
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

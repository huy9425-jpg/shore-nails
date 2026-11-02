import { Phone, MapPin, Clock, ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InstagramIcon, FacebookIcon } from "@/components/ui/SocialIcons";
import { OpenStatusBadge } from "@/components/ui/OpenStatusBadge";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative bg-sand/30 py-20 sm:py-28 lg:py-32 border-t border-beige"
    >
      <div className="container-lux">
        <SectionHeading
          eyebrow="Get in Touch"
          titleId="contact-heading"
          title={
            <>
              Connect with <span className="text-champagne italic">Shore Nails</span>
            </>
          }
          description="Have questions about our nail styles, designs, or services? We would love to hear from you. Give us a call or visit our social pages."
        />

        <div className="mt-14 sm:mt-18 grid gap-6 md:grid-cols-3">
          {/* Contact Card 1: Phone */}
          <Reveal delay={0}>
            <div className="flex h-full flex-col justify-between rounded-2xl border border-beige bg-cream p-7 sm:p-9 shadow-xs hover:border-champagne transition-all">
              <div>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand/60 text-champagne border border-beige mb-6">
                  <Phone className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="font-serif text-[1.48rem] sm:text-[1.68rem] text-brown font-normal">
                  Call Shore Nails
                </h3>
                <p className="mt-2.5 text-[0.98rem] sm:text-[1.04rem] text-ink-soft leading-relaxed">
                  Call our front desk directly for pricing inquiries, group questions, or custom nail consultation.
                </p>
                <p className="mt-5 font-serif text-[1.85rem] sm:text-[2.15rem] font-normal tracking-tight text-brown">
                  {siteConfig.contact.phoneDisplay}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-beige">
                <a
                  href={`tel:${siteConfig.contact.phoneLink}`}
                  className="btn-primary w-full justify-center !py-3.5 text-[0.86rem]"
                  aria-label={`Call ${siteConfig.shortName} at ${siteConfig.contact.phoneDisplay}`}
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  <span>Call +1 (609) 407-0072</span>
                </a>
              </div>
            </div>
          </Reveal>

          {/* Contact Card 2: Location */}
          <Reveal delay={80}>
            <div className="flex h-full flex-col justify-between rounded-2xl border border-beige bg-cream p-7 sm:p-9 shadow-xs hover:border-champagne transition-all">
              <div>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand/60 text-champagne border border-beige mb-6">
                  <MapPin className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="font-serif text-[1.48rem] sm:text-[1.68rem] text-brown font-normal">
                  Salon Location
                </h3>
                <p className="mt-2.5 text-[0.98rem] sm:text-[1.04rem] text-ink-soft leading-relaxed">
                  Conveniently situated in Northfield with direct road access and adjacent customer parking.
                </p>
                <div className="mt-5 font-serif text-xl sm:text-[1.4rem] text-brown leading-snug">
                  <p>{siteConfig.contact.address.street}</p>
                  <p className="text-taupe text-lg mt-0.5">
                    {siteConfig.contact.address.city}, {siteConfig.contact.address.stateAbbr} {siteConfig.contact.address.zip}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-beige">
                <a
                  href={siteConfig.contact.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full justify-center !py-3.5 text-[0.86rem]"
                >
                  <span>Directions on Google Maps</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </Reveal>

          {/* Contact Card 3: Opening Hours & Social */}
          <Reveal delay={160}>
            <div className="flex h-full flex-col justify-between rounded-2xl border border-beige bg-cream p-7 sm:p-9 shadow-xs hover:border-champagne transition-all">
              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand/60 text-champagne border border-beige">
                    <Clock className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <OpenStatusBadge variant="light" />
                </div>

                <h3 className="font-serif text-[1.35rem] sm:text-[1.5rem] tracking-[0.08em] text-brown font-normal uppercase">
                  OPENING HOURS
                </h3>

                <dl className="mt-4 divide-y divide-beige/70 border-y border-beige/80 text-[0.92rem] sm:text-[0.96rem]">
                  {siteConfig.contact.openingHours.map((entry) => (
                    <div
                      key={entry.day}
                      className="flex items-center justify-between py-2 gap-3"
                    >
                      <dt className="font-medium text-brown">{entry.day}</dt>
                      <dd className="text-ink-soft font-normal tabular-nums">
                        {entry.hours}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 space-y-2.5">
                  <a
                    href={siteConfig.social.instagram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-beige bg-sand/40 text-brown hover:border-champagne hover:bg-cream transition-colors text-sm font-medium"
                    aria-label={`Follow Shore Nails on Instagram (${siteConfig.social.instagram.handle})`}
                  >
                    <span className="flex items-center gap-3">
                      <InstagramIcon className="h-4.5 w-4.5 text-champagne" />
                      <span>{siteConfig.social.instagram.handle}</span>
                    </span>
                    <span className="text-[0.74rem] tracking-wider text-taupe uppercase font-semibold">Instagram</span>
                  </a>

                  <a
                    href={siteConfig.social.facebook.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-beige bg-sand/40 text-brown hover:border-champagne hover:bg-cream transition-colors text-sm font-medium"
                    aria-label={`Visit Shore Nails on Facebook (${siteConfig.social.facebook.name})`}
                  >
                    <span className="flex items-center gap-3">
                      <FacebookIcon className="h-4.5 w-4.5 text-champagne" />
                      <span>{siteConfig.social.facebook.name}</span>
                    </span>
                    <span className="text-[0.74rem] tracking-wider text-taupe uppercase font-semibold">Facebook</span>
                  </a>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-beige">
                <a
                  href={`tel:${siteConfig.contact.phoneLink}`}
                  className="btn-champagne w-full justify-center !py-3.5 text-[0.86rem]"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  <span>Call to Inquire</span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

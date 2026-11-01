import { MapPin, Navigation, Phone, ExternalLink } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function LocationMap() {
  const addr = siteConfig.contact.address;

  return (
    <section
      id="location"
      aria-labelledby="location-heading"
      className="relative bg-ivory py-20 sm:py-28 lg:py-32"
    >
      <div className="container-lux">
        <SectionHeading
          eyebrow="Visit Our Studio"
          titleId="location-heading"
          title={
            <>
              Convenient Location in <span className="text-champagne italic">Northfield, NJ</span>
            </>
          }
          description="We are located on New Road in Northfield, New Jersey. Convenient access and nearby parking for a smooth and relaxing visit."
        />

        <div className="mt-14 sm:mt-18 grid items-stretch gap-8 lg:grid-cols-12">
          {/* Address & Quick Actions Card */}
          <Reveal className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-beige bg-cream p-7 sm:p-9 shadow-xs">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-sand/60 border border-beige px-3.5 py-1.5 text-[0.78rem] font-medium tracking-[0.16em] text-taupe uppercase">
                <MapPin className="h-3.5 w-3.5 text-champagne" aria-hidden="true" />
                <span>Northfield, NJ</span>
              </div>

              {/* Exact Business Address */}
              <div className="mt-6 border-b border-beige pb-6">
                <p className="font-serif text-[1.7rem] sm:text-[2rem] font-normal tracking-wide text-brown uppercase">
                  {addr.businessName}
                </p>
                <div className="mt-3 text-[1.1rem] sm:text-[1.2rem] text-brown leading-relaxed font-sans">
                  <p>{addr.street}</p>
                  <p>
                    {addr.city}, {addr.stateAbbr} {addr.zip}
                  </p>
                  <p className="text-taupe font-medium">{addr.country}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-base text-ink-soft">
                <p className="flex items-center gap-3">
                  <Phone className="h-4.5 w-4.5 text-champagne shrink-0" aria-hidden="true" />
                  <a
                    href={`tel:${siteConfig.contact.phoneLink}`}
                    className="font-medium text-brown hover:text-champagne transition-colors text-lg sm:text-xl"
                  >
                    {siteConfig.contact.phoneDisplay}
                  </a>
                </p>
                <p className="text-sm text-taupe leading-relaxed">
                  {siteConfig.contact.hoursNotice}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-beige flex flex-col gap-3">
              <a
                href={siteConfig.contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full justify-center !py-3.5 text-[0.86rem]"
                aria-label="Get directions with Google Maps"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" />
                <span>Get Directions (Google Maps)</span>
              </a>

              <a
                href={siteConfig.contact.appleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline w-full justify-center !py-3.5 text-[0.86rem]"
                aria-label="Open location in Apple Maps"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span>Open in Apple Maps</span>
              </a>

              <a
                href={`tel:${siteConfig.contact.phoneLink}`}
                className="btn-champagne w-full justify-center !py-3.5 text-[0.86rem]"
                aria-label={`Call Shore Nails at ${siteConfig.contact.phoneDisplay}`}
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>Call Shore Nails</span>
              </a>
            </div>
          </Reveal>

          {/* Embedded Interactive Map */}
          <Reveal delay={100} className="lg:col-span-7 flex flex-col">
            <div className="relative min-h-[360px] sm:min-h-[440px] w-full flex-1 overflow-hidden rounded-2xl border border-beige bg-sand shadow-xs">
              <iframe
                title="Shore Nails Salon Location - 512 New Road, Northfield, NJ"
                src={siteConfig.contact.embedMapUrl}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <p className="mt-3 text-right text-xs sm:text-sm text-taupe">
              Interactive map centered at 512 New Road, Northfield, NJ 08225
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

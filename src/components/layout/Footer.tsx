"use client";

import { Phone, MapPin, ArrowUp } from "lucide-react";
import { siteConfig } from "@/config/site";
import { navLinks } from "@/data/navigation";
import { Logo } from "@/components/ui/Logo";
import { InstagramIcon, FacebookIcon } from "@/components/ui/SocialIcons";

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="relative bg-brown text-cream/90 border-t-2 border-champagne">
      <div className="container-lux pt-16 pb-12 sm:pt-20 sm:pb-14">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-5">
            <a href="#home" aria-label="SHORE NAILS — return to top">
              <Logo variant="light" />
            </a>

            <p className="mt-5 max-w-sm text-sm sm:text-base leading-relaxed text-cream/75">
              {siteConfig.description}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={siteConfig.social.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream transition-colors hover:border-champagne hover:bg-champagne hover:text-brown"
                aria-label={`Shore Nails Instagram (${siteConfig.social.instagram.handle})`}
              >
                <InstagramIcon className="h-4.5 w-4.5" />
              </a>
              <a
                href={siteConfig.social.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream transition-colors hover:border-champagne hover:bg-champagne hover:text-brown"
                aria-label={`Shore Nails Facebook (${siteConfig.social.facebook.name})`}
              >
                <FacebookIcon className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="lg:col-span-3 lg:col-start-7">
            <p className="text-[0.78rem] font-semibold tracking-[0.24em] text-champagne-light uppercase">
              Navigation
            </p>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block py-1 text-sm sm:text-base text-cream/80 transition-colors hover:text-champagne-light"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Location & Phone */}
          <div className="lg:col-span-4">
            <p className="text-[0.78rem] font-semibold tracking-[0.24em] text-champagne-light uppercase">
              Visit Shore Nails
            </p>
            <div className="mt-4 space-y-3.5 text-sm sm:text-base text-cream/85">
              <p className="flex items-start gap-3">
                <MapPin className="mt-1 h-4.5 w-4.5 shrink-0 text-champagne-light" aria-hidden="true" />
                <span className="leading-relaxed">
                  {siteConfig.contact.address.street}
                  <br />
                  {siteConfig.contact.address.city}, {siteConfig.contact.address.stateAbbr} {siteConfig.contact.address.zip}
                </span>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="h-4.5 w-4.5 shrink-0 text-champagne-light" aria-hidden="true" />
                <a
                  href={`tel:${siteConfig.contact.phoneLink}`}
                  className="font-medium text-cream hover:text-champagne-light transition-colors text-base sm:text-lg"
                >
                  {siteConfig.contact.phoneDisplay}
                </a>
              </p>
              <p className="text-xs sm:text-sm text-taupe-light italic pt-1">
                {siteConfig.contact.hoursNotice}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 sm:mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-cream/15 pt-8 text-xs sm:text-sm text-cream/60">
          <p>
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline">512 New Road, Northfield, NJ 08225</span>
            <a
              href="#home"
              className="inline-flex items-center gap-1.5 text-cream/80 transition-colors hover:text-champagne-light font-medium"
              aria-label="Back to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

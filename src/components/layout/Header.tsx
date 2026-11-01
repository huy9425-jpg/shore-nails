"use client";

import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { navLinks } from "@/data/navigation";
import { Logo } from "@/components/ui/Logo";
import { InstagramIcon, FacebookIcon } from "@/components/ui/SocialIcons";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock scroll when mobile menu is active
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? "border-b border-beige/80 bg-ivory/95 shadow-[0_4px_24px_-10px_rgba(74,64,58,0.12)] backdrop-blur-md"
          : "border-b border-transparent bg-ivory/80 backdrop-blur-xs sm:bg-transparent"
      }`}
    >
      <div
        className={`container-lux flex items-center justify-between transition-all duration-300 ${
          scrolled ? "h-20 sm:h-22" : "h-22 sm:h-26"
        }`}
      >
        {/* Typographic Logo (displays only "SHORE NAILS") */}
        <a
          href="#home"
          aria-label="SHORE NAILS — return to top"
          onClick={closeMenu}
          className="focus:outline-hidden"
        >
          <Logo showSubtitle={false} />
        </a>

        {/* Desktop Navigation (16-18px with generous touch spacing) */}
        <nav aria-label="Main navigation" className="hidden lg:block">
          <ul className="flex items-center gap-7 xl:gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="link-underline py-2 text-[1rem] xl:text-[1.0625rem] font-medium tracking-[0.06em] text-brown transition-colors hover:text-champagne"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Social Icons (Desktop) */}
          <div className="hidden sm:flex items-center gap-2 pr-1 border-r border-beige">
            <a
              href={siteConfig.social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow Shore Nails on Instagram (${siteConfig.social.instagram.handle})`}
              className="flex h-10 w-10 items-center justify-center rounded-full text-brown/80 transition-colors hover:text-champagne hover:bg-beige/40"
            >
              <InstagramIcon className="h-4.5 w-4.5" />
            </a>
            <a
              href={siteConfig.social.facebook.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit Shore Nails on Facebook (${siteConfig.social.facebook.name})`}
              className="flex h-10 w-10 items-center justify-center rounded-full text-brown/80 transition-colors hover:text-champagne hover:bg-beige/40"
            >
              <FacebookIcon className="h-4.5 w-4.5" />
            </a>
          </div>

          {/* Call Us Button */}
          <a
            href={`tel:${siteConfig.contact.phoneLink}`}
            className="btn-primary !px-5 sm:!px-7 !py-3 text-[0.85rem] sm:text-[0.9rem]"
            aria-label={`Call Shore Nails at ${siteConfig.contact.phoneDisplay}`}
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span>Call Us</span>
          </a>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-brown/30 text-brown transition-colors hover:border-champagne hover:text-champagne lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6 text-brown" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        id="mobile-menu"
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out lg:hidden bg-ivory border-b border-beige ${
          menuOpen ? "max-h-[36rem] opacity-100" : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <nav aria-label="Mobile navigation" className="container-lux py-6 space-y-6">
          <ul className="flex flex-col divide-y divide-beige/80 border-t border-beige/80">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={closeMenu}
                  tabIndex={menuOpen ? 0 : -1}
                  className="flex items-center justify-between py-4 font-serif text-[1.4rem] sm:text-[1.6rem] text-brown transition-colors hover:text-champagne"
                >
                  <span>{link.label}</span>
                  <span aria-hidden="true" className="text-sm text-champagne">
                    &rarr;
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="pt-2 space-y-4">
            <a
              href={`tel:${siteConfig.contact.phoneLink}`}
              onClick={closeMenu}
              tabIndex={menuOpen ? 0 : -1}
              className="btn-primary w-full !py-4 text-base"
            >
              <Phone className="h-4.5 w-4.5" aria-hidden="true" />
              <span>Call +1 (609) 407-0072</span>
            </a>

            <div className="flex items-center justify-center gap-6 pt-2 text-[0.95rem] text-brown/90 font-medium">
              <a
                href={siteConfig.social.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="flex items-center gap-2 hover:text-champagne"
              >
                <InstagramIcon className="h-4.5 w-4.5" />
                <span>{siteConfig.social.instagram.handle}</span>
              </a>
              <a
                href={siteConfig.social.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="flex items-center gap-2 hover:text-champagne"
              >
                <FacebookIcon className="h-4.5 w-4.5" />
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

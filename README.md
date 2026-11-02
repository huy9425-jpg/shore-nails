# SHORE NAILS — Official Promotional Website

A modern, elegant, and mobile-first promotional website designed and built for **Shore Nails**, an established nail salon and waxing studio in **Northfield, New Jersey**.

---

## 1. Official Salon Details

- **Business Name:** SHORE NAILS
- **Address:** 512 New Road, Northfield, New Jersey 08225, USA
- **Phone:** +1 (609) 407-0072 (`tel:+16094070072`)
- **Instagram:** [@hannah.shorenails](https://www.instagram.com/hannah.shorenails/)
- **Facebook:** [ShoreNails Waxing](https://www.facebook.com/profile.php?id=61591942442581)
- **Google Maps Directions:** [Directions on Google Maps](https://www.google.com/maps/dir/?api=1&destination=512+New+Road,+Northfield,+NJ+08225)
- **Apple Maps:** [Directions on Apple Maps](https://maps.apple.com/?address=512%20New%20Road,%20Northfield,%20NJ%2008225)

---

## 2. Visual Palette & Brand Identity

Designed with a calming, comfortable luxury aesthetic:
- **Warm Ivory:** `#F7F4EF` (Base backdrop)
- **Soft Beige:** `#E9DFD3` (Card outlines & alternating sections)
- **Muted Blush:** `#D8BFC0` (Badges & soft accents)
- **Warm Taupe:** `#9C887A` (Secondary labels & eyebrows)
- **Deep Brown:** `#463B35` (Primary typography with high contrast)
- **Subtle Champagne Gold:** `#B59A73` (Accents, active states & highlights)

### Typographic Logo (Wordmark)
Constructed using pure CSS typography (no cliparts, icons, illustrations, or bottles):
- **"SHORE"** rendered in refined serif typography.
- **"NAILS"** rendered in tracked uppercase letter-spacing.
- Scalable, lightweight, and responsive across all mobile screens.

---

## 3. Website Sections & Features

1. **Header:** Typographic SHORE NAILS wordmark, complete navigation links, direct "Call Us" button (+1 (609) 407-0072), Instagram/Facebook shortcuts, and mobile drawer menu.
2. **Hero:** Headline *"Beautiful Nails. Beautiful Moments."*, local Northfield NJ badge, 3 action buttons (*Explore Our Services*, *View Our Gallery*, *Call Us*), and luxury manicure visual.
3. **About Shore Nails:** Introduction to the local Northfield studio, focusing on thoughtful technique, hygiene, comfort, and attentive service without unverified claims.
4. **Services:** 5 organized categories with photography:
   - *Nail Enhancements* (Acrylic Powder, Dipping Powder, Tap Gel, Builder Gel, Pink & White, Ombre, Color Powder, French Tips, Custom Art)
   - *Manicure* (Classic, Gel, Polish Change, Gel Polish Change, Nail Removal)
   - *Pedicure* (Regular, Deluxe, Luxury Spa Pedicure, Pedicure with Gel Polish)
   - *Waxing* (Eyebrows, Lip, Chin, Sideburn, Full Facial, Bikini Line, Legs, Underarms, Brazilian Bikini, Back Waxing)
   - *Men's Services* (Sport Manicure, Sport Pedicure, Back Waxing)
5. **Dedicated Price List:** Exact official USD prices with mobile dotted leaders and category tabs (*Nail Services*, *Pedicure*, *Waxing*, *Men's Services*), with a clear notice for unlisted custom services (*"For Dipping Powder, Tap Gel, and Builder Gel, please contact us for pricing"*).
6. **Nail Portfolio Gallery:** 10 style categories with category filters and full-screen lightbox image viewer:
   - *Acrylic Nails*, *Dipping Powder*, *Gel Nails*, *Builder Gel*, *Pink & White*, *Ombre Nails*, *French Tips*, *Minimalist Nails*, *Nail Art*, *Spa Pedicure*.
7. **Why Choose Shore Nails:** 6 core salon values highlighting care, precision, comfort, and cleanliness.
8. **Location & Interactive Map:** Interactive embedded Google Map without private API key exposure, official address display (`SHORENAILS, 512 New Road, Northfield, NJ 08225, USA`), Google Maps directions button, Apple Maps link, and direct phone button.
9. **Contact & Social Media:** Direct contact cards with phone, location, and social links to Facebook (*ShoreNails Waxing*) and Instagram (*@hannah.shorenails*).
10. **Footer:** Brand wordmark, navigation links, address, phone number, social links, and copyright notice.
11. **Local Business SEO & JSON-LD:** Structured schema (`@type: NailSalon`), canonical metadata, and Open Graph tags.

---

## 4. Customer Review System & Admin Dashboard (`/admin`)

The Shore Nails website includes a privacy-preserving customer review submission and moderation system backed by **Supabase** and **Supabase Auth**.

### Database Migration
Run the SQL migration file in your **Supabase Dashboard &rarr; SQL Editor**:
- [`supabase/migrations/20261102000000_create_reviews_system.sql`](supabase/migrations/20261102000000_create_reviews_system.sql)

This migration creates:
1. `public.reviews` table with validation constraints, automatic `updated_at` trigger, and `moderation_status` (`pending`, `approved`, `rejected`, `hidden`).
2. Strict Row Level Security (RLS) policies ensuring public visitors can only submit `pending` reviews with explicit publication consent (`consent_to_publish = true`).
3. `public.public_approved_reviews` view exposing only `id`, `customer_name`, `rating`, `review_text`, and `created_at` for `approved` reviews (`contact_email` and `contact_phone` are never exposed publicly).
4. Supabase Realtime publication on `public.reviews` for live admin dashboard updates.

### Required Environment Variables
Create a `.env.local` file locally (see [`.env.example`](.env.example)) and add the same variables in **Vercel &rarr; Project Settings &rarr; Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase Publishable / Anon Key
- `SUPABASE_SERVICE_ROLE_KEY` — *(Optional / Recommended)* Server-only Service Role Key
- `ADMIN_ALLOWED_EMAILS` — *(Optional)* Comma-separated list of authorized administrator emails

### Creating the First Administrator Account
1. Open your **Supabase Dashboard &rarr; Authentication &rarr; Providers &rarr; Email** and disable **"Allow new users to sign up"** so only accounts you create can log in.
2. Go to **Authentication &rarr; Users &rarr; Add User &rarr; Create New User**.
3. Enter the salon owner's email address and strong password, check **"Auto Confirm User"**, and click **Create User**.
4. Open `/admin` on the website, sign in with that email and password, and manage all customer reviews (`APPROVE`, `REJECT`, `HIDE`, `DELETE`).

---

## 5. Running the Website Locally

### Development Server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Production Build & Test:
```bash
npm run build
npm start
```

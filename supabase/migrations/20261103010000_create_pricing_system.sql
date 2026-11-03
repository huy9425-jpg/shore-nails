-- ============================================================================
-- SHORE NAILS — PRICING & SERVICE MANAGEMENT SYSTEM MIGRATION
-- ============================================================================
-- Creates:
-- 1. `pricing_categories` table pre-seeded with all 5 Shore Nails service categories
-- 2. `pricing_services` table pre-seeded with all 45 official audited prices
-- 3. Automatic updated_at trigger
-- 4. Privacy-safe public view `public_pricing_services`
-- 5. Row Level Security (RLS) policies for public visitors and authenticated admins
-- 6. Supabase Realtime publication for instant synchronization
-- ============================================================================

-- Ensure pgcrypto is available for UUIDs
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Create pricing_categories table
-- ----------------------------------------------------------------------------
create table if not exists public.pricing_categories (
  id text primary key,
  category text not null unique check (char_length(btrim(category)) between 2 and 80),
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Seed the 5 confirmed categories
insert into public.pricing_categories (id, category, description, display_order)
values
  ('nail-services', 'Nail Services', 'Full sets, refills, manicures, and polish care crafted with precision and long-lasting finishes.', 1),
  ('pedicure', 'Pedicure', 'Relaxing foot soaks, exfoliation, cuticle grooming, and rejuvenating massage treatments.', 2),
  ('waxing', 'Waxing Services', 'Smooth, professional facial and body waxing performed in a hygienic, tranquil environment.', 3),
  ('mens-services', 'Men''s Services', 'Essential grooming treatments tailored for clean, healthy nails and relaxing foot care.', 4),
  ('specialty-services', 'Specialty & Powder Systems', 'Specialty enhancement services with custom consultation. Call our salon directly for custom quotes.', 5)
on conflict (id) do update
set category = excluded.category,
    description = excluded.description,
    display_order = excluded.display_order;

-- ----------------------------------------------------------------------------
-- 2. Create pricing_services table
-- ----------------------------------------------------------------------------
create table if not exists public.pricing_services (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  category_id text not null references public.pricing_categories(id) on update cascade on delete cascade,
  category_name text not null,
  price text not null check (char_length(btrim(price)) between 1 and 60),
  price_format text not null default 'fixed' check (price_format in ('fixed', 'starting', 'range', 'custom', 'contact')),
  price_amount numeric(10,2) check (price_amount is null or price_amount >= 0),
  price_max numeric(10,2) check (price_max is null or price_max >= 0),
  duration text check (duration is null or char_length(btrim(duration)) <= 100),
  description text check (description is null or char_length(btrim(description)) <= 500),
  is_unconfirmed boolean not null default false,
  is_published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for instant public menu queries and admin filtering
create index if not exists idx_pricing_services_published
  on public.pricing_services (is_published, category_id, display_order asc);

create index if not exists idx_pricing_services_category
  on public.pricing_services (category_id, display_order asc);

-- ----------------------------------------------------------------------------
-- 3. Automatic updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function public.handle_pricing_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_pricing_services_updated_at on public.pricing_services;
create trigger trg_pricing_services_updated_at
  before update on public.pricing_services
  for each row
  execute function public.handle_pricing_updated_at();

-- ----------------------------------------------------------------------------
-- 4. Pre-seed all 45 official audited Shore Nails services
-- ----------------------------------------------------------------------------
-- Only insert if table is empty to preserve any edits made subsequently
do $$
begin
  if not exists (select 1 from public.pricing_services limit 1) then
    -- Nail Services (22 items)
    insert into public.pricing_services (name, category_id, category_name, price, price_format, price_amount, display_order)
    values
      ('Pre-Designed Full Set', 'nail-services', 'Nail Services', '$45', 'fixed', 45, 1),
      ('Acrylic Full Set', 'nail-services', 'Nail Services', '$40', 'fixed', 40, 2),
      ('Color Tip Full Set', 'nail-services', 'Nail Services', '$45', 'fixed', 45, 3),
      ('French Tip Full Set', 'nail-services', 'Nail Services', '$45', 'fixed', 45, 4),
      ('Pink & White Full Set', 'nail-services', 'Nail Services', '$65', 'fixed', 65, 5),
      ('Color Gel Powder Full Set', 'nail-services', 'Nail Services', '$55', 'fixed', 55, 6),
      ('Sparkle Tip Full Set', 'nail-services', 'Nail Services', '$45', 'fixed', 45, 7),
      ('Regular Refill', 'nail-services', 'Nail Services', '$30', 'fixed', 30, 8),
      ('Color Tip / French Tip Refill', 'nail-services', 'Nail Services', '$35', 'fixed', 35, 9),
      ('Gel Powder Refill', 'nail-services', 'Nail Services', '$40', 'fixed', 40, 10),
      ('Pink Refill', 'nail-services', 'Nail Services', '$40', 'fixed', 40, 11),
      ('Pink & White Refill', 'nail-services', 'Nail Services', '$55', 'fixed', 55, 12),
      ('Gel Manicure', 'nail-services', 'Nail Services', '$35', 'fixed', 35, 13),
      ('Nail Take Off & Manicure', 'nail-services', 'Nail Services', '$25', 'fixed', 25, 14),
      ('Nails Removal with New Set', 'nail-services', 'Nail Services', '$5 Extra', 'custom', 5, 15),
      ('Regular Polish Change - Hands', 'nail-services', 'Nail Services', '$10', 'fixed', 10, 16),
      ('Regular Polish Change - Feet', 'nail-services', 'Nail Services', '$15', 'fixed', 15, 17),
      ('Gel Polish Change - Hands', 'nail-services', 'Nail Services', '$25', 'fixed', 25, 18),
      ('Gel Polish Change - Feet', 'nail-services', 'Nail Services', '$30', 'fixed', 30, 19),
      ('Polish Change with French', 'nail-services', 'Nail Services', '$5 Extra', 'custom', 5, 20),
      ('Nail Design', 'nail-services', 'Nail Services', '$5+', 'starting', 5, 21),
      ('Manicure', 'nail-services', 'Nail Services', '$20', 'fixed', 20, 22);

    -- Pedicure (4 items)
    insert into public.pricing_services (name, category_id, category_name, price, price_format, price_amount, duration, display_order)
    values
      ('Luxury Spa Pedicure (Approximately 45 Minutes)', 'pedicure', 'Pedicure', '$65', 'fixed', 65, 'Approximately 45 Minutes', 1),
      ('Deluxe Pedicure', 'pedicure', 'Pedicure', '$55', 'fixed', 55, null, 2),
      ('Regular Pedicure', 'pedicure', 'Pedicure', '$38', 'fixed', 38, null, 3),
      ('Pedicure with Gel Polish', 'pedicure', 'Pedicure', '$53', 'fixed', 53, null, 4);

    -- Waxing Services (11 items)
    insert into public.pricing_services (name, category_id, category_name, price, price_format, price_amount, display_order)
    values
      ('Eyebrows', 'waxing', 'Waxing Services', '$10', 'fixed', 10, 1),
      ('Upper Lip', 'waxing', 'Waxing Services', '$7', 'fixed', 7, 2),
      ('Chin', 'waxing', 'Waxing Services', '$10+', 'starting', 10, 3),
      ('Sideburn', 'waxing', 'Waxing Services', '$15+', 'starting', 15, 4),
      ('Full Facial', 'waxing', 'Waxing Services', '$40+', 'starting', 40, 5),
      ('Bikini Line', 'waxing', 'Waxing Services', '$40+', 'starting', 40, 6),
      ('Half Legs', 'waxing', 'Waxing Services', '$45+', 'starting', 45, 7),
      ('Full Legs', 'waxing', 'Waxing Services', '$80+', 'starting', 80, 8),
      ('Underarms', 'waxing', 'Waxing Services', '$25+', 'starting', 25, 9),
      ('Brazilian Bikini', 'waxing', 'Waxing Services', '$55+', 'starting', 55, 10),
      ('Back Waxing', 'waxing', 'Waxing Services', '$70+', 'starting', 70, 11);

    -- Men's Services (3 items)
    insert into public.pricing_services (name, category_id, category_name, price, price_format, price_amount, display_order)
    values
      ('Sport Manicure', 'mens-services', 'Men''s Services', '$20', 'fixed', 20, 1),
      ('Sport Pedicure', 'mens-services', 'Men''s Services', '$38', 'fixed', 38, 2),
      ('Back Waxing', 'mens-services', 'Men''s Services', '$70+', 'starting', 70, 3);

    -- Specialty & Powder Systems (5 items)
    insert into public.pricing_services (name, category_id, category_name, price, price_format, is_unconfirmed, display_order)
    values
      ('Dipping Powder', 'specialty-services', 'Specialty & Powder Systems', 'Contact us for pricing', 'contact', true, 1),
      ('Tap Gel', 'specialty-services', 'Specialty & Powder Systems', 'Contact us for pricing', 'contact', true, 2),
      ('Builder Gel', 'specialty-services', 'Specialty & Powder Systems', 'Contact us for pricing', 'contact', true, 3),
      ('Ombre Nails', 'specialty-services', 'Specialty & Powder Systems', 'Contact us for pricing', 'contact', true, 4),
      ('Powder Color', 'specialty-services', 'Specialty & Powder Systems', 'Contact us for pricing', 'contact', true, 5);
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- 5. Privacy-safe public view
-- ----------------------------------------------------------------------------
create or replace view public.public_pricing_services as
select
  s.id,
  s.name,
  s.category_id,
  c.category as category_name,
  c.description as category_description,
  c.display_order as category_order,
  s.price,
  s.price_format,
  s.duration,
  s.description as service_note,
  s.is_unconfirmed,
  s.display_order as service_order
from public.pricing_services s
join public.pricing_categories c on s.category_id = c.id
where s.is_published = true
order by c.display_order asc, s.display_order asc, s.created_at asc;

-- ----------------------------------------------------------------------------
-- 6. Row Level Security (RLS) Policies
-- ----------------------------------------------------------------------------
alter table public.pricing_categories enable row level security;
alter table public.pricing_services enable row level security;

-- Categories: Public can view all categories
drop policy if exists "Public visitors can view pricing categories" on public.pricing_categories;
create policy "Public visitors can view pricing categories"
  on public.pricing_categories
  for select
  to anon, authenticated
  using (true);

-- Categories: Authenticated admins can manage categories
drop policy if exists "Admins can manage pricing categories" on public.pricing_categories;
create policy "Admins can manage pricing categories"
  on public.pricing_categories
  for all
  to authenticated
  using (true)
  with check (true);

-- Services: Public visitors can view ONLY published services
drop policy if exists "Public visitors can view published services" on public.pricing_services;
create policy "Public visitors can view published services"
  on public.pricing_services
  for select
  to anon, authenticated
  using (is_published = true);

-- Services: Authenticated admins can view, insert, update, delete all services
drop policy if exists "Admins can manage all pricing services" on public.pricing_services;
create policy "Admins can manage all pricing services"
  on public.pricing_services
  for all
  to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------
-- 7. Supabase Realtime Publication
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'pricing_services'
  ) then
    alter publication supabase_realtime add table public.pricing_services;
  end if;
end;
$$;


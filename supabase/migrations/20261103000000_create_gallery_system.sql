-- ============================================================================
-- SHORE NAILS — GALLERY & PHOTO MANAGEMENT SYSTEM MIGRATION
-- ============================================================================
-- Creates:
-- 1. `gallery_categories` table pre-seeded with all 15 Shore Nails categories
-- 2. `gallery_images` table with metadata, display order, and published status
-- 3. Automatic updated_at trigger
-- 4. Privacy-safe public view `public_gallery_images`
-- 5. Row Level Security (RLS) policies for public and authenticated admin access
-- 6. Storage bucket policies for the public 'gallery' bucket
-- 7. Supabase Realtime publication for instant admin synchronization
-- ============================================================================

-- Ensure pgcrypto is available for UUIDs
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Create gallery_categories table
-- ----------------------------------------------------------------------------
create table if not exists public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(btrim(name)) between 2 and 60),
  slug text not null unique check (char_length(btrim(slug)) between 2 and 60),
  display_order integer not null default 0,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

-- Pre-seed all 15 official Shore Nails categories
insert into public.gallery_categories (name, slug, display_order, is_system)
values
  ('Acrylic Powder Nails', 'acrylic-powder-nails', 1, true),
  ('Dipping Powder Nails', 'dipping-powder-nails', 2, true),
  ('Tap Gel Nails', 'tap-gel-nails', 3, true),
  ('Builder Gel Nails', 'builder-gel-nails', 4, true),
  ('Ombre Nails', 'ombre-nails', 5, true),
  ('Pink & White', 'pink-and-white', 6, true),
  ('Color Powder Nails', 'color-powder-nails', 7, true),
  ('French & Color Tip', 'french-and-color-tip', 8, true),
  ('Gel Manicure', 'gel-manicure', 9, true),
  ('Classic Manicure', 'classic-manicure', 10, true),
  ('Spa Pedicure', 'spa-pedicure', 11, true),
  ('Nail Art & Design', 'nail-art-and-design', 12, true),
  ('Minimalist & Clean', 'minimalist-and-clean', 13, true),
  ('Luxury & Bridal Nails', 'luxury-and-bridal-nails', 14, true),
  ('Waxing Services', 'waxing-services', 15, true)
on conflict (name) do update
set display_order = excluded.display_order,
    is_system = excluded.is_system;

-- ----------------------------------------------------------------------------
-- 2. Create gallery_images table
-- ----------------------------------------------------------------------------
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique check (char_length(btrim(storage_path)) > 0),
  image_url text not null check (image_url like 'http%'),
  title text not null check (char_length(btrim(title)) between 2 and 120),
  alt_text text check (alt_text is null or char_length(btrim(alt_text)) <= 250),
  category text not null check (char_length(btrim(category)) between 2 and 60),
  width integer not null default 1200 check (width > 0),
  height integer not null default 1200 check (height > 0),
  file_size integer check (file_size is null or file_size > 0),
  mime_type text not null default 'image/webp',
  display_order integer not null default 0,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for lightning-fast public portfolio loads and admin management
create index if not exists idx_gallery_images_published_order
  on public.gallery_images (is_published, display_order, created_at desc);

create index if not exists idx_gallery_images_category
  on public.gallery_images (category, is_published);

create index if not exists idx_gallery_images_created_at
  on public.gallery_images (created_at desc);

-- ----------------------------------------------------------------------------
-- 3. Automatic updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function public.handle_gallery_updated_at()
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

drop trigger if exists trg_gallery_updated_at on public.gallery_images;
create trigger trg_gallery_updated_at
  before update on public.gallery_images
  for each row
  execute function public.handle_gallery_updated_at();

-- ----------------------------------------------------------------------------
-- 4. Privacy-safe public view
-- ----------------------------------------------------------------------------
create or replace view public.public_gallery_images as
select
  id,
  image_url,
  title,
  coalesce(alt_text, title) as alt_text,
  category,
  width,
  height,
  display_order,
  is_featured,
  created_at
from public.gallery_images
where is_published = true
order by display_order asc, created_at desc;

-- ----------------------------------------------------------------------------
-- 5. Row Level Security (RLS) Policies
-- ----------------------------------------------------------------------------
alter table public.gallery_categories enable row level security;
alter table public.gallery_images enable row level security;

-- Categories: Public can read all categories
drop policy if exists "Public visitors can view gallery categories" on public.gallery_categories;
create policy "Public visitors can view gallery categories"
  on public.gallery_categories
  for select
  to anon, authenticated
  using (true);

-- Categories: Authenticated admins can manage categories
drop policy if exists "Admins can manage gallery categories" on public.gallery_categories;
create policy "Admins can manage gallery categories"
  on public.gallery_categories
  for all
  to authenticated
  using (true)
  with check (true);

-- Images: Public visitors can view ONLY published photos
drop policy if exists "Public visitors can view published gallery images" on public.gallery_images;
create policy "Public visitors can view published gallery images"
  on public.gallery_images
  for select
  to anon, authenticated
  using (is_published = true);

-- Images: Authenticated admins can view, insert, update, delete all images
drop policy if exists "Admins can manage all gallery images" on public.gallery_images;
create policy "Admins can manage all gallery images"
  on public.gallery_images
  for all
  to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------
-- 6. Storage Bucket Configuration & RLS
-- ----------------------------------------------------------------------------
-- Ensure the 'gallery' public bucket exists in storage.buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery',
  'gallery',
  true,
  10485760, -- 10MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = true,
    file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

-- Storage RLS: Public can read objects from 'gallery' bucket
drop policy if exists "Public can view gallery images" on storage.objects;
create policy "Public can view gallery images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'gallery');

-- Storage RLS: Authenticated admins can upload, update, delete objects
drop policy if exists "Admins can upload gallery images" on storage.objects;
create policy "Admins can upload gallery images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'gallery');

drop policy if exists "Admins can update gallery images" on storage.objects;
create policy "Admins can update gallery images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'gallery');

drop policy if exists "Admins can delete gallery images" on storage.objects;
create policy "Admins can delete gallery images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'gallery');

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
      and tablename = 'gallery_images'
  ) then
    alter publication supabase_realtime add table public.gallery_images;
  end if;
end;
$$;


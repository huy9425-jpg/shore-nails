-- ============================================================================
-- SHORE NAILS — CUSTOMER REVIEW & MODERATION SYSTEM MIGRATION
-- ============================================================================
-- Creates the persistent `reviews` table, strict data validation constraints,
-- persistent database-level rate-limiting/duplicate trigger, automatic
-- `updated_at` trigger, Row Level Security (RLS) policies, privacy-preserving
-- public view, and Supabase Realtime publication.
-- ============================================================================

-- Enable UUID generation if not already active
create extension if not exists "pgcrypto";

-- 1. Create the reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null
    check (char_length(btrim(customer_name)) between 2 and 80),
  contact_email text
    check (contact_email is null or char_length(btrim(contact_email)) <= 255),
  contact_phone text
    check (contact_phone is null or char_length(btrim(contact_phone)) <= 40),
  rating smallint not null
    check (rating between 1 and 5),
  review_text text not null
    check (char_length(btrim(review_text)) between 10 and 1500),
  consent_to_publish boolean not null default false
    check (consent_to_publish = true),
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'approved', 'rejected', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_contact_required check (
    (contact_email is not null and char_length(btrim(contact_email)) > 0)
    or (contact_phone is not null and char_length(btrim(contact_phone)) > 0)
  )
);

-- 2. Indexes for fast public queries, admin filtering, and rate-limit checks
create index if not exists idx_reviews_status_created_at
  on public.reviews (moderation_status, created_at desc);

create index if not exists idx_reviews_created_at
  on public.reviews (created_at desc);

-- 3. Automatic updated_at timestamp trigger
create or replace function public.handle_reviews_updated_at()
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

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
  before update on public.reviews
  for each row
  execute function public.handle_reviews_updated_at();

-- 4. Persistent Database-Level Rate Limit & Duplicate Submission Trigger
-- Works across all Vercel serverless cold starts and instances without external Redis.
create or replace function public.enforce_review_submission_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_duplicate_count integer;
  recent_contact_count integer;
  recent_global_burst integer;
begin
  -- Force new submissions to start as pending with explicit consent
  new.moderation_status := 'pending';
  if new.consent_to_publish is distinct from true then
    raise exception 'Publication consent is required to submit a review.'
      using errcode = '23514';
  end if;

  -- Check for duplicate review content within the last 24 hours
  select count(*)
    into recent_duplicate_count
    from public.reviews
   where lower(btrim(customer_name)) = lower(btrim(new.customer_name))
     and lower(btrim(review_text)) = lower(btrim(new.review_text))
     and created_at > (now() - interval '24 hours');

  if recent_duplicate_count > 0 then
    raise exception 'Duplicate review submission detected.'
      using errcode = 'P0001';
  end if;

  -- Check per-contact rate limit (max 3 submissions per hour per email or phone)
  select count(*)
    into recent_contact_count
    from public.reviews
   where created_at > (now() - interval '1 hour')
     and (
       (new.contact_email is not null and lower(btrim(contact_email)) = lower(btrim(new.contact_email)))
       or (new.contact_phone is not null and btrim(contact_phone) = btrim(new.contact_phone))
     );

  if recent_contact_count >= 3 then
    raise exception 'Rate limit exceeded for this contact. Please try again later.'
      using errcode = 'P0001';
  end if;

  -- Global burst protection (max 20 submissions across the salon within 5 minutes)
  select count(*)
    into recent_global_burst
    from public.reviews
   where created_at > (now() - interval '5 minutes');

  if recent_global_burst >= 20 then
    raise exception 'Too many submissions right now. Please try again in a few minutes.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_review_submission_guard on public.reviews;
create trigger trg_enforce_review_submission_guard
  before insert on public.reviews
  for each row
  execute function public.enforce_review_submission_guard();

-- 5. Helper function to verify admin role in JWT app_metadata for direct RLS access
create or replace function public.is_shore_nails_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- 6. Enable Row Level Security (RLS)
alter table public.reviews enable row level security;

-- Revoke broad privileges from public/anon so private contact columns are never exposed
revoke all on table public.reviews from public;
revoke all on table public.reviews from anon;
grant insert (
  customer_name,
  contact_email,
  contact_phone,
  rating,
  review_text,
  consent_to_publish,
  moderation_status
) on table public.reviews to anon;

grant select, insert, update, delete on table public.reviews to authenticated;
grant all on table public.reviews to service_role;

-- RLS Policy 1: Public visitors can only insert new pending reviews with explicit consent
drop policy if exists "Public can submit pending reviews" on public.reviews;
create policy "Public can submit pending reviews"
  on public.reviews
  for insert
  to anon, authenticated
  with check (
    moderation_status = 'pending'
    and consent_to_publish = true
  );

-- RLS Policy 2: Only verified administrators (via app_metadata.role = 'admin' or service_role)
-- can view, approve, reject, hide, or delete rows in public.reviews.
drop policy if exists "Authenticated admins manage all reviews" on public.reviews;
create policy "Authenticated admins manage all reviews"
  on public.reviews
  for all
  to authenticated
  using (public.is_shore_nails_admin())
  with check (public.is_shore_nails_admin());

-- 7. Privacy-Safe Public View for Approved Reviews
-- Exposes ONLY approved reviews and strictly omits contact_email and contact_phone.
create or replace view public.public_approved_reviews
with (security_invoker = false)
as
  select
    id,
    customer_name,
    rating,
    review_text,
    created_at
  from public.reviews
  where moderation_status = 'approved'
  order by created_at desc;

revoke all on public.public_approved_reviews from public;
grant select on public.public_approved_reviews to anon, authenticated, service_role;

-- 8. Enable Supabase Realtime for live admin dashboard updates
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'reviews'
    ) then
      alter publication supabase_realtime add table public.reviews;
    end if;
  end if;
end
$$;

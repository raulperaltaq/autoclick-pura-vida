create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  make text not null,
  model text not null,
  year integer not null check (year between 1900 and 2100),
  price numeric not null check (price > 0),
  currency text not null check (currency in ('CRC', 'USD')),
  km integer check (km is null or km >= 0),
  fuel text not null,
  transmission text not null,
  body text not null,
  province text not null,
  style text not null,
  condition text not null,
  doors integer,
  financing boolean,
  trade boolean,
  image_url text not null,
  image_urls text[] not null default '{}',
  plan text not null default 'free' check (plan in ('free', 'featured', 'premium', 'premium-plus')),
  requested_plan text not null default 'free' check (requested_plan in ('free', 'featured', 'premium', 'premium-plus')),
  published_at timestamptz,
  status text not null default 'pending_review' check (status in ('pending_review', 'published')),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id),
  seller text not null default '',
  phone text not null,
  description text not null default '',
  details jsonb not null default '{}'::jsonb,
  whatsapp_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_owner_id_idx on public.listings (owner_id);
create index listings_published_at_idx on public.listings (published_at desc) where status = 'published';

alter table public.listings enable row level security;

create policy "Anyone can read published listings"
  on public.listings for select
  using (status = 'published' or owner_id = (select auth.uid()));

create policy "Users can submit their own listings"
  on public.listings for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and plan = 'free'
    and status = 'pending_review'
    and published_at is null
    and whatsapp_enabled = false
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
);

create policy "Users can upload their own listing images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and lower(storage.extension(name)) = any (array['jpg', 'jpeg', 'png', 'webp', 'avif'])
  );

create policy "Users can delete their own listing images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

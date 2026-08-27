-- CMS for wedding invitation content & gallery
-- Run this in Supabase SQL Editor once

create table if not exists public.site_content (
  id bigint primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
create policy "Public can read site content" on public.site_content for select using (true);
create policy "Auth can upsert site content" on public.site_content for insert with check (auth.role() = 'authenticated');
create policy "Auth can update site content" on public.site_content for update using (auth.role() = 'authenticated');

create table if not exists public.gallery_images (
  id text primary key,
  src text not null,
  alt text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.gallery_images enable row level security;
create policy "Public can read gallery" on public.gallery_images for select using (true);
create policy "Auth can write gallery" on public.gallery_images for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage bucket for CMS uploads (create via dashboard or SQL)
insert into storage.buckets (id, name, public) values ('wedding-assets', 'wedding-assets', true)
on conflict (id) do nothing;

create policy "Public can read wedding assets" on storage.objects for select using (bucket_id = 'wedding-assets');
create policy "Auth can upload wedding assets" on storage.objects for insert with check (bucket_id = 'wedding-assets' and auth.role() = 'authenticated');
create policy "Auth can update wedding assets" on storage.objects for update using (bucket_id = 'wedding-assets' and auth.role() = 'authenticated');
create policy "Auth can delete wedding assets" on storage.objects for delete using (bucket_id = 'wedding-assets' and auth.role() = 'authenticated');

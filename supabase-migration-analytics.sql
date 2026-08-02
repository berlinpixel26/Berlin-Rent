-- Page visits analytics table for privacy-friendly visitor tracking
-- Records: timestamp, visitor session ID, page path, referrer
-- No personal data, no IP address logging

create table if not exists page_visits (
    id uuid primary key default gen_random_uuid(),
    visitor_id text not null,
    path text default '/',
    referrer text,
    user_agent text,
    created_at timestamptz not null default now()
);

alter table page_visits enable row level security;

-- Anyone can submit a visit record (anon)
create policy "Public can insert page visits"
    on page_visits for insert
    to anon
    with check (true);

-- No public read — view stats yourself in Supabase Dashboard
-- (optional: you can add a read policy later if you want to expose stats to visitors)

-- Index on created_at for faster analytics queries
create index if not exists idx_page_visits_created_at on page_visits(created_at desc);

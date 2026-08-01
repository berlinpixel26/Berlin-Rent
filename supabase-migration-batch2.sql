-- ============================================================================
-- Migration for: report pins, browser-token edit/delete, optional email.
-- Run this in the Supabase SQL editor BEFORE the updated index-gmaps.html
-- goes live, otherwise report/edit/delete/email will fail silently.
-- ============================================================================

-- New columns on rents
alter table rents add column if not exists edit_token text;
alter table rents add column if not exists email text;

-- Reports table (moderation queue — reviewed manually via Table Editor, like feature_requests)
create table if not exists reports (
  id bigint generated always as identity primary key,
  rent_id uuid references rents(id) on delete cascade,
  reason text not null,
  created_at timestamptz default now()
);
alter table reports enable row level security;

create policy "anon can insert reports"
  on reports for insert
  to anon
  with check (true);

-- ============================================================================
-- IMPORTANT: do NOT add a public SELECT policy on edit_token or email.
-- The website's client-side queries explicitly avoid selecting these two
-- columns (see rowToRent() in index-gmaps.html) so they never leave the
-- server in a page's normal "load all pins" response. Edit/delete instead
-- go through the two SECURITY DEFINER functions below, which check the
-- token server-side without ever returning it to the browser.
-- ============================================================================

create or replace function update_rent_with_token(
  p_id uuid, p_token text, p_warm numeric, p_cold numeric, p_deposit numeric,
  p_bhk int, p_district text, p_furnished boolean, p_privacy text, p_household text,
  p_people_allowed int, p_parking text, p_utilities_included text, p_stay_rating int,
  p_area numeric, p_one_liner text, p_letterbox text, p_pets text, p_smoking text,
  p_neighbourhood_rating int, p_anmeldung_provided text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update rents set
    warm = p_warm, cold = p_cold, deposit = p_deposit, bhk = p_bhk, district = p_district,
    furnished = p_furnished, privacy = p_privacy, household = p_household,
    people_allowed = p_people_allowed, parking = p_parking, utilities_included = p_utilities_included,
    stay_rating = p_stay_rating, area = p_area, one_liner = p_one_liner, letterbox = p_letterbox,
    pets = p_pets, smoking = p_smoking, neighbourhood_rating = p_neighbourhood_rating,
    anmeldung_provided = p_anmeldung_provided
  where id = p_id and edit_token = p_token;
  return found;
end;
$$;

grant execute on function update_rent_with_token(
  uuid, text, numeric, numeric, numeric, int, text, boolean, text, text,
  int, text, text, int, numeric, text, text, text, text, int, text
) to anon;

create or replace function delete_rent_with_token(p_id uuid, p_token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from rents where id = p_id and edit_token = p_token;
  return found;
end;
$$;

grant execute on function delete_rent_with_token(uuid, text) to anon;

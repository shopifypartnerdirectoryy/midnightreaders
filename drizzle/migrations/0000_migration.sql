create type public.app_role as enum ('admin','moderator','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, display_name text, is_author boolean not null default false, created_at timestamptz not null default now());
grant select, insert, update on public.profiles to authenticated; grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "update own profile" on public.profiles for update to authenticated using (id = auth.uid());
create policy "insert own profile" on public.profiles for insert to authenticated with check (id = auth.uid());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  insert into public.user_roles(user_id, role) values (new.id,'user');
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id,'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.books (id uuid primary key default gen_random_uuid(), title text not null, author_name text not null, genre text, description text, cover_url text, program text, featured boolean not null default false, created_at timestamptz not null default now());
grant select on public.books to anon, authenticated; grant insert, update, delete on public.books to authenticated; grant all on public.books to service_role;
alter table public.books enable row level security;
create policy "books public" on public.books for select using (true);
create policy "admins write books" on public.books for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.book_submissions (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade, title text not null, author_name text not null, genre text, description text, cover_url text, buy_link text, programs text[] not null default '{}', status text not null default 'pending', admin_note text, created_at timestamptz not null default now());
grant select, insert, update on public.book_submissions to authenticated; grant all on public.book_submissions to service_role;
alter table public.book_submissions enable row level security;
create policy "own or admin read subs" on public.book_submissions for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "insert own subs" on public.book_submissions for insert to authenticated with check (user_id = auth.uid() and status='pending');
create policy "admin update subs" on public.book_submissions for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.challenge_enrollments (user_id uuid primary key references auth.users(id) on delete cascade, goal int not null default 12, joined_at timestamptz not null default now());
grant select, insert, update, delete on public.challenge_enrollments to authenticated; grant all on public.challenge_enrollments to service_role;
alter table public.challenge_enrollments enable row level security;
create policy "own enrollment" on public.challenge_enrollments for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin read enrollments" on public.challenge_enrollments for select to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.shelf (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade, book_id uuid not null references public.books(id) on delete cascade, status text not null default 'want', updated_at timestamptz not null default now(), unique(user_id, book_id));
grant select, insert, update, delete on public.shelf to authenticated; grant all on public.shelf to service_role;
alter table public.shelf enable row level security;
create policy "own shelf" on public.shelf for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.spikes (id uuid primary key default gen_random_uuid(), title text not null, category text not null default 'Prompt', body text not null, published boolean not null default true, created_at timestamptz not null default now());
grant select on public.spikes to anon, authenticated; grant insert, update, delete on public.spikes to authenticated; grant all on public.spikes to service_role;
alter table public.spikes enable row level security;
create policy "published spikes" on public.spikes for select using (published or public.has_role(auth.uid(),'admin'));
create policy "admins write spikes" on public.spikes for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.inquiries (id uuid primary key default gen_random_uuid(), user_id uuid default auth.uid(), program text not null, name text not null, email text not null, message text, created_at timestamptz not null default now());
grant insert on public.inquiries to anon, authenticated; grant select on public.inquiries to authenticated; grant all on public.inquiries to service_role;
alter table public.inquiries enable row level security;
create policy "anyone can submit inquiry" on public.inquiries for insert with check (length(name) between 1 and 200 and length(email) between 3 and 255);
create policy "admins read inquiries" on public.inquiries for select to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.awards (id uuid primary key default gen_random_uuid(), title text not null, recipient text not null, category text, year int not null default 2026, note text, created_at timestamptz not null default now());
grant select on public.awards to anon, authenticated; grant insert, update, delete on public.awards to authenticated; grant all on public.awards to service_role;
alter table public.awards enable row level security;
create policy "awards public" on public.awards for select using (true);
create policy "admins write awards" on public.awards for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.spikes(title, category, body) values
('Read the first line only','Prompt','Open the next book on your shelf and read just the first line. Would you keep going? Why?'),
('Quiet books for loud weeks','Pick','Three slow, luminous novels for when everything else is noisy.'),
('The 20-page rule','Reading tip','Give every book twenty pages before you decide. Then decide without guilt.');
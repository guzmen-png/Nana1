create table if not exists projects (
  id text primary key,
  owner text not null,
  name text not null,
  color text not null default '#0F6B5C',
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists day_entries (
  id text primary key,
  owner text not null,
  day date not null,
  memo text not null default '',
  project_id text references projects(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (owner, day)
);

create table if not exists photos (
  id text primary key,
  owner text not null,
  day date not null,
  data_url text not null,
  caption text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists photos_owner_day_idx on photos (owner, day);
create index if not exists projects_owner_idx on projects (owner);
create index if not exists day_entries_owner_day_idx on day_entries (owner, day);

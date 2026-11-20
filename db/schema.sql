-- ============================================================
-- BHAR INOX — Schéma PostgreSQL
-- Exécution : npm run db:setup (lit DATABASE_URL)
-- Compatible PostgreSQL 14+ (local) et Neon (Vercel)
-- ============================================================

CREATE TABLE IF NOT EXISTS projects (
  id          text PRIMARY KEY,
  slug        text NOT NULL UNIQUE,
  title       text NOT NULL,
  description text NOT NULL DEFAULT '',
  category    text NOT NULL DEFAULT 'Autre',
  location    text,
  sort_order  integer NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_images (
  id         bigserial PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  image_path text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_project_images_project
  ON project_images (project_id, sort_order);

CREATE TABLE IF NOT EXISTS services (
  id          text PRIMARY KEY,
  name        text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  image       text,
  sort_order  integer NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS site_settings (
  id              smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_title      text NOT NULL DEFAULT '',
  hero_subtitle   text NOT NULL DEFAULT '',
  about_intro     text NOT NULL DEFAULT '',
  phone           text NOT NULL DEFAULT '',
  email           text NOT NULL DEFAULT '',
  address         text NOT NULL DEFAULT '',
  hours           text NOT NULL DEFAULT '',
  seo_title       text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  map_lat         double precision NOT NULL DEFAULT 0,
  map_lng         double precision NOT NULL DEFAULT 0,
  map_zoom        smallint NOT NULL DEFAULT 16
);

INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS quote_requests (
  id           text PRIMARY KEY,
  reference    text NOT NULL UNIQUE,
  project_type text NOT NULL,
  description  text NOT NULL DEFAULT '',
  location     text NOT NULL DEFAULT '',
  dimensions   text,
  quantity     integer,
  finish       text,
  budget       text,
  deadline     text,
  full_name    text NOT NULL,
  company      text,
  phone        text NOT NULL,
  email        text NOT NULL,
  status       text NOT NULL DEFAULT 'nouveau'
               CHECK (status IN ('nouveau', 'en_cours', 'devis_envoye', 'accepte', 'refuse', 'archive')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotes_status ON quote_requests (status);
CREATE INDEX IF NOT EXISTS idx_quotes_created ON quote_requests (created_at DESC);

CREATE TABLE IF NOT EXISTS quote_files (
  id              bigserial PRIMARY KEY,
  quote_reference text NOT NULL REFERENCES quote_requests (reference) ON DELETE CASCADE,
  file_name       text NOT NULL,
  file_size       bigint NOT NULL DEFAULT 0,
  file_type       text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_quote_files_reference ON quote_files (quote_reference);

CREATE TABLE IF NOT EXISTS contact_messages (
  id         text PRIMARY KEY,
  name       text NOT NULL,
  email      text NOT NULL,
  phone      text,
  message    text NOT NULL,
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_created ON contact_messages (created_at DESC);

CREATE TABLE IF NOT EXISTS counters (
  name  text PRIMARY KEY,
  value integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS uploaded_images (
  id         text PRIMARY KEY,
  mime       text NOT NULL,
  data       bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

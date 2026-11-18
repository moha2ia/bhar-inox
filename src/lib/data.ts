import "server-only";
import { randomBytes } from "node:crypto";
import type {
  Project,
  Service,
  QuoteRequest,
  SiteSettings,
  ContactMessage,
} from "./types";
import {
  QUOTE_STATUS_ORDER,
  type QuoteStatus as StatusType,
} from "./types";
import { query, withTransaction } from "./db";

/* ============================================================
   Couche de données — BHAR INOX (PostgreSQL)
   Fonctionne en local (PostgreSQL) et sur Vercel (Neon).
   ============================================================ */

interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  sort_order: number;
  published: boolean;
  created_at: Date;
  images: string[] | null;
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    location: row.location,
    images: row.images ?? [],
    sort_order: row.sort_order,
    published: row.published,
    created_at: row.created_at.toISOString(),
  };
}

const PROJECT_SELECT = `
  SELECT p.*, (
    SELECT array_agg(pi.image_path ORDER BY pi.sort_order, pi.id)
    FROM project_images pi
    WHERE pi.project_id = p.id
  ) AS images
  FROM projects p`;

/* ------------------------------------------------------------
   Contenus publics
   ------------------------------------------------------------ */

export async function listProjects(opts?: {
  publishedOnly?: boolean;
  category?: string;
}): Promise<Project[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (opts?.publishedOnly !== false) conditions.push("p.published = true");
  if (opts?.category && opts.category !== "Toutes") {
    params.push(opts.category);
    conditions.push(`p.category = $${params.length}`);
  }
  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await query<ProjectRow>(
    `${PROJECT_SELECT}${where} ORDER BY p.sort_order, p.created_at`,
    params,
  );
  return rows.map(toProject);
}

export async function getProjectBySlug(
  slug: string,
  opts?: { publishedOnly?: boolean },
): Promise<Project | null> {
  const publishedOnly = opts?.publishedOnly !== false;
  const { rows } = await query<ProjectRow>(
    `${PROJECT_SELECT} WHERE p.slug = $1${publishedOnly ? " AND p.published = true" : ""} LIMIT 1`,
    [slug],
  );
  return rows[0] ? toProject(rows[0]) : null;
}

export async function listCategories(): Promise<string[]> {
  const { rows } = await query<{ category: string }>(
    "SELECT DISTINCT category FROM projects WHERE published = true",
  );
  return rows
    .map((r) => r.category)
    .sort((a, b) => a.localeCompare(b, "fr"));
}

export async function listServices(opts?: {
  publishedOnly?: boolean;
}): Promise<Service[]> {
  const where = opts?.publishedOnly === false ? "" : " WHERE published = true";
  const { rows } = await query<Service>(
    `SELECT id, name, description, image, sort_order, published
     FROM services${where} ORDER BY sort_order, name`,
  );
  return rows;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const { rows } = await query<SiteSettings>(
    `SELECT hero_title, hero_subtitle, about_intro, phone, email, address, hours,
            seo_title, seo_description, map_lat, map_lng, map_zoom
     FROM site_settings WHERE id = 1`,
  );
  return (
    rows[0] ?? {
      hero_title: "",
      hero_subtitle: "",
      about_intro: "",
      phone: "",
      email: "",
      address: "",
      hours: "",
      seo_title: "",
      seo_description: "",
      map_lat: 0,
      map_lng: 0,
      map_zoom: 16,
    }
  );
}

/* ------------------------------------------------------------
   Demandes de devis
   ------------------------------------------------------------ */

export async function createQuoteRequest(input: {
  draft: Record<string, unknown>;
  files: { name: string; size: number; type: string }[];
}): Promise<{ reference: string }> {
  const d = input.draft;
  const year = new Date().getFullYear();

  return withTransaction(async (client) => {
    const counter = await client.query<{ value: number }>(
      `INSERT INTO counters (name, value) VALUES ($1, 1)
       ON CONFLICT (name) DO UPDATE SET value = counters.value + 1
       RETURNING value`,
      [`quote_counter_${year}`],
    );
    const reference = `BI-${year}-${String(counter.rows[0].value).padStart(4, "0")}`;
    const id = `q-${Date.now()}-${randomBytes(3).toString("hex")}`;

    await client.query(
      `INSERT INTO quote_requests (
         id, reference, project_type, description, location, dimensions,
         quantity, finish, budget, deadline, full_name, company, phone, email, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'nouveau')`,
      [
        id,
        reference,
        String(d.project_type ?? ""),
        String(d.description ?? ""),
        String(d.location ?? ""),
        d.dimensions ? String(d.dimensions) : null,
        d.quantity ? Number(d.quantity) : null,
        d.finish ? String(d.finish) : null,
        d.budget ? String(d.budget) : null,
        d.deadline ? String(d.deadline) : null,
        String(d.full_name ?? ""),
        d.company ? String(d.company) : null,
        String(d.phone ?? ""),
        String(d.email ?? ""),
      ],
    );

    for (const file of input.files) {
      await client.query(
        `INSERT INTO quote_files (quote_reference, file_name, file_size, file_type)
         VALUES ($1, $2, $3, $4)`,
        [reference, file.name, file.size, file.type],
      );
    }

    return { reference };
  });
}

export async function listQuoteRequests(opts?: {
  status?: StatusType;
  search?: string;
}): Promise<QuoteRequest[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (opts?.status) {
    params.push(opts.status);
    conditions.push(`status = $${params.length}`);
  }
  if (opts?.search) {
    params.push(`%${opts.search}%`);
    const i = params.length;
    conditions.push(
      `(reference ILIKE $${i} OR full_name ILIKE $${i} OR email ILIKE $${i} OR project_type ILIKE $${i})`,
    );
  }
  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await query<Omit<QuoteRequest, "created_at"> & { created_at: Date }>(
    `SELECT id, reference, project_type, description, location, dimensions, quantity,
            finish, budget, deadline, full_name, company, phone, email, status, created_at
     FROM quote_requests${where} ORDER BY created_at DESC`,
    params,
  );
  return rows.map((row) => ({ ...row, created_at: row.created_at.toISOString() }));
}

export async function updateQuoteStatus(
  id: string,
  status: StatusType,
): Promise<void> {
  const { rowCount } = await query(
    "UPDATE quote_requests SET status = $2 WHERE id = $1",
    [id, status],
  );
  if (!rowCount) throw new Error("Demande introuvable.");
}

export async function listQuoteFiles(
  reference: string,
): Promise<{ file_name: string; file_size: number; file_type: string }[]> {
  const { rows } = await query<{
    file_name: string;
    file_size: string;
    file_type: string;
  }>(
    `SELECT file_name, file_size, file_type FROM quote_files
     WHERE quote_reference = $1 ORDER BY id`,
    [reference],
  );
  return rows.map((row) => ({
    file_name: row.file_name,
    file_size: Number(row.file_size),
    file_type: row.file_type,
  }));
}

/* ------------------------------------------------------------
   Messages de contact
   ------------------------------------------------------------ */

export async function createContactMessage(input: {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}): Promise<{ id: string }> {
  const id = `msg-${Date.now()}-${randomBytes(3).toString("hex")}`;
  await query(
    `INSERT INTO contact_messages (id, name, email, phone, message)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, input.name, input.email, input.phone || null, input.message],
  );
  return { id };
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  const { rows } = await query<Omit<ContactMessage, "created_at"> & { created_at: Date }>(
    `SELECT id, name, email, phone, message, read, created_at
     FROM contact_messages ORDER BY created_at DESC`,
  );
  return rows.map((row) => ({ ...row, created_at: row.created_at.toISOString() }));
}

export async function deleteContactMessage(id: string): Promise<void> {
  await query("DELETE FROM contact_messages WHERE id = $1", [id]);
}

export async function markContactMessageRead(
  id: string,
  read = true,
): Promise<void> {
  await query("UPDATE contact_messages SET read = $2 WHERE id = $1", [id, read]);
}

/* ------------------------------------------------------------
   Mutations contenus (admin)
   ------------------------------------------------------------ */

export type ProjectInput = Omit<Project, "id" | "created_at"> & {
  id?: string;
};

export async function upsertProject(
  input: ProjectInput,
): Promise<{ id: string }> {
  return withTransaction(async (client) => {
    let existing: { id: string } | undefined;
    if (input.id) {
      const byId = await client.query<{ id: string }>(
        "SELECT id FROM projects WHERE id = $1",
        [input.id],
      );
      existing = byId.rows[0];
    }
    if (!existing) {
      const bySlug = await client.query<{ id: string }>(
        "SELECT id FROM projects WHERE slug = $1",
        [input.slug],
      );
      existing = bySlug.rows[0];
    }

    let id: string;
    if (existing) {
      id = existing.id;
      await client.query(
        `UPDATE projects SET slug = $2, title = $3, description = $4, category = $5,
           location = $6, sort_order = $7, published = $8 WHERE id = $1`,
        [
          id,
          input.slug,
          input.title,
          input.description,
          input.category,
          input.location,
          input.sort_order,
          input.published,
        ],
      );
    } else {
      id = input.id || `p-${Date.now()}`;
      await client.query(
        `INSERT INTO projects (id, slug, title, description, category, location, sort_order, published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          id,
          input.slug,
          input.title,
          input.description,
          input.category,
          input.location,
          input.sort_order,
          input.published,
        ],
      );
    }

    await client.query("DELETE FROM project_images WHERE project_id = $1", [id]);
    for (const [index, image] of (input.images ?? []).entries()) {
      await client.query(
        "INSERT INTO project_images (project_id, image_path, sort_order) VALUES ($1, $2, $3)",
        [id, image, index],
      );
    }
    return { id };
  });
}

export async function deleteProject(id: string): Promise<void> {
  await query("DELETE FROM projects WHERE id = $1", [id]);
}

export async function upsertService(
  input: Omit<Service, "id"> & { id?: string },
): Promise<{ id: string }> {
  return withTransaction(async (client) => {
    let existing: { id: string } | undefined;
    if (input.id) {
      const byId = await client.query<{ id: string }>(
        "SELECT id FROM services WHERE id = $1",
        [input.id],
      );
      existing = byId.rows[0];
    }
    if (!existing) {
      const byName = await client.query<{ id: string }>(
        "SELECT id FROM services WHERE name = $1",
        [input.name],
      );
      existing = byName.rows[0];
    }

    let id: string;
    if (existing) {
      id = existing.id;
      await client.query(
        `UPDATE services SET name = $2, description = $3, image = $4,
           sort_order = $5, published = $6 WHERE id = $1`,
        [
          id,
          input.name,
          input.description,
          input.image,
          input.sort_order,
          input.published,
        ],
      );
    } else {
      id = input.id || `s-${Date.now()}`;
      await client.query(
        `INSERT INTO services (id, name, description, image, sort_order, published)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          id,
          input.name,
          input.description,
          input.image,
          input.sort_order,
          input.published,
        ],
      );
    }
    return { id };
  });
}

export async function deleteService(id: string): Promise<void> {
  await query("DELETE FROM services WHERE id = $1", [id]);
}

export async function updateSiteSettings(
  patch: Partial<SiteSettings>,
): Promise<void> {
  const current = await getSiteSettings();
  const next = { ...current, ...patch };
  await query(
    `UPDATE site_settings SET
       hero_title = $1, hero_subtitle = $2, about_intro = $3, phone = $4,
       email = $5, address = $6, hours = $7, seo_title = $8,
       seo_description = $9, map_lat = $10, map_lng = $11, map_zoom = $12
     WHERE id = 1`,
    [
      next.hero_title,
      next.hero_subtitle,
      next.about_intro,
      next.phone,
      next.email,
      next.address,
      next.hours,
      next.seo_title,
      next.seo_description,
      next.map_lat,
      next.map_lng,
      next.map_zoom,
    ],
  );
}

export { QUOTE_STATUS_ORDER };

export function statusIndex(status: StatusType): number {
  return QUOTE_STATUS_ORDER.indexOf(status);
}

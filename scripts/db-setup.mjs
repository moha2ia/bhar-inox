import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

function loadEnvFile(name) {
  const file = resolve(root, name);
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, raw] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = raw.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "DATABASE_URL manquant. Exemple local : postgresql://postgres:postgres@127.0.0.1:5432/bhar_inox",
  );
  process.exit(1);
}

const schema = readFileSync(resolve(root, "db/schema.sql"), "utf8");
const seed = JSON.parse(readFileSync(resolve(root, "db/seed-data.json"), "utf8"));

const client = new pg.Client({ connectionString });

try {
  await client.connect();
  await client.query(schema);

  const { rows: projectRows } = await client.query("SELECT count(*)::int AS n FROM projects");
  if (projectRows[0].n === 0) {
    for (const project of seed.projects) {
      await client.query(
        `INSERT INTO projects (id, slug, title, description, category, location, sort_order, published, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          project.id,
          project.slug,
          project.title,
          project.description,
          project.category,
          project.location ?? null,
          project.sort_order ?? 0,
          Boolean(project.published),
          project.created_at ?? new Date().toISOString(),
        ],
      );
      const images = Array.isArray(project.images) ? project.images : [];
      for (const [index, image] of images.entries()) {
        await client.query(
          "INSERT INTO project_images (project_id, image_path, sort_order) VALUES ($1, $2, $3)",
          [project.id, image, index],
        );
      }
    }
    console.log(`Projets importés : ${seed.projects.length}`);
  } else {
    console.log(`Projets déjà présents (${projectRows[0].n}) — import ignoré.`);
  }

  const { rows: serviceRows } = await client.query("SELECT count(*)::int AS n FROM services");
  if (serviceRows[0].n === 0) {
    for (const service of seed.services) {
      await client.query(
        `INSERT INTO services (id, name, description, image, sort_order, published)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          service.id,
          service.name,
          service.description,
          service.image ?? null,
          service.sort_order ?? 0,
          Boolean(service.published),
        ],
      );
    }
    console.log(`Services importés : ${seed.services.length}`);
  } else {
    console.log(`Services déjà présents (${serviceRows[0].n}) — import ignoré.`);
  }

  const { rows: settingsRows } = await client.query(
    "SELECT hero_title FROM site_settings WHERE id = 1",
  );
  if (!settingsRows[0]?.hero_title) {
    const s = seed.settings;
    await client.query(
      `UPDATE site_settings SET
         hero_title = $1, hero_subtitle = $2, about_intro = $3, phone = $4, email = $5,
         address = $6, hours = $7, seo_title = $8, seo_description = $9,
         map_lat = $10, map_lng = $11, map_zoom = $12
       WHERE id = 1`,
      [
        s.hero_title,
        s.hero_subtitle,
        s.about_intro,
        s.phone,
        s.email,
        s.address,
        s.hours,
        s.seo_title,
        s.seo_description,
        s.map_lat,
        s.map_lng,
        s.map_zoom,
      ],
    );
    console.log("Paramètres du site importés.");
  } else {
    console.log("Paramètres déjà renseignés — import ignoré.");
  }

  console.log("Base prête.");
} catch (error) {
  console.error("Échec de l'initialisation :", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}

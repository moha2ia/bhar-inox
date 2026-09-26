import type { MetadataRoute } from "next";
import { listProjects } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bhar-inox.example";

  const statics: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/services`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/realisations`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/a-propos`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/devis`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/confidentialite`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const projects = await listProjects({ publishedOnly: true });
    return [
      ...statics,
      ...projects.map((p) => ({
        url: `${base}/realisations/${p.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return statics;
  }
}

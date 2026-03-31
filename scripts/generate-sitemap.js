import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL = "https://yidatsai.com";
const today = new Date().toISOString().split("T")[0];

const projects = JSON.parse(
  readFileSync(join(__dirname, "../src/data/projects.json"), "utf-8")
);

// Only include real projects (exclude test placeholders)
const realProjects = projects.filter((p) => !p.id.startsWith("test-project-"));

const staticPages = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/projects", changefreq: "weekly", priority: "0.8" },
  { path: "/playground", changefreq: "monthly", priority: "0.5" },
  { path: "/contact", changefreq: "yearly", priority: "0.4" },
];

const projectPages = realProjects.map((p) => ({
  path: `/projects/${p.id}`,
  changefreq: "monthly",
  priority: "0.8",
}));

const allPages = [...staticPages, ...projectPages];

const urls = allPages
  .map(
    ({ path, changefreq, priority }) => `  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const outPath = join(__dirname, "../public/sitemap.xml");
writeFileSync(outPath, sitemap, "utf-8");
console.log(`Sitemap generated: ${outPath} (${allPages.length} URLs)`);

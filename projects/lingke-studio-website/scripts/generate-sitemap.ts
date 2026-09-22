/**
 * 构建前生成 public/sitemap.xml 与 public/robots.txt（域名来自 VITE_SITE_URL）
 */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WORK_CASES } from "../src/data/workCases.ts";
import { MINI_CASES } from "../src/data/miniCases.ts";
import { APP_CASES } from "../src/data/appCases.ts";
import { H5_CASES } from "../src/data/h5Cases.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

const site = (process.env.VITE_SITE_URL ?? "https://lkqt.top").replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);

const paths = [
  "/",
  ...WORK_CASES.map((c) => `/work/${c.slug}`),
  ...MINI_CASES.map((c) => `/mini/${c.slug}`),
  ...APP_CASES.map((c) => `/app/${c.slug}`),
  ...H5_CASES.map((c) => `/h5/${c.slug}`),
];

const urls = paths
  .map(
    (p) => `  <url>
    <loc>${site}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p === "/" ? "weekly" : "monthly"}</changefreq>
    <priority>${p === "/" ? "1.0" : "0.7"}</priority>
  </url>`,
  )
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const robots = `User-agent: *
Allow: /

User-agent: Baiduspider
Allow: /

Disallow: /admin

Sitemap: ${site}/sitemap.xml
`;

mkdirSync(publicDir, { recursive: true });
writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap, "utf8");
writeFileSync(path.join(publicDir, "robots.txt"), robots, "utf8");

console.log(`[sitemap] ${paths.length} URLs → ${site}/sitemap.xml`);

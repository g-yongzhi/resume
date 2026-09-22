import type { Response } from "express";
import fs from "node:fs";
import path from "node:path";

export function siteBaseUrl() {
  return (process.env.VITE_SITE_URL ?? "https://lkqt.top").replace(/\/$/, "");
}

export function sendRobotsTxt(res: Response, distDir: string) {
  const fp = path.join(distDir, "robots.txt");
  res.type("text/plain; charset=utf-8");
  if (fs.existsSync(fp)) {
    res.sendFile(fp);
    return;
  }
  const site = siteBaseUrl();
  res.send(
    `User-agent: *\nAllow: /\n\nUser-agent: Baiduspider\nAllow: /\n\nDisallow: /admin\n\nSitemap: ${site}/sitemap.xml\n`,
  );
}

export function sendSitemapXml(res: Response, distDir: string) {
  const fp = path.join(distDir, "sitemap.xml");
  res.type("application/xml; charset=utf-8");
  if (fs.existsSync(fp)) {
    res.sendFile(fp);
    return;
  }
  const site = siteBaseUrl();
  const today = new Date().toISOString().slice(0, 10);
  res.send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${site}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>\n</urlset>\n`,
  );
}

/** 线上站点根 URL（构建 / 运行时常用） */
export const DEFAULT_SITE = "https://lkqt.top";

export function getSiteBaseUrl() {
  return (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || DEFAULT_SITE;
}

export function absoluteSiteUrl(path: string, base = getSiteBaseUrl()) {
  if (path.startsWith("http")) return path;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

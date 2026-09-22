export const DEFAULT_SITE_EMAIL = "hello@lingke.studio";
export const DEFAULT_SITE_PHONE = "+86 21 6888 0000";

export type SiteContact = {
  email: string;
  phone: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseSiteContactInput(body: unknown): { ok: true; data: SiteContact } | { ok: false; message: string } {
  if (body == null || typeof body !== "object") {
    return { ok: false, message: "请求格式无效" };
  }
  const raw = body as Record<string, unknown>;
  const email = String(raw.email ?? "").trim().slice(0, 120);
  const phone = String(raw.phone ?? "").trim().slice(0, 40);

  if (!email || !EMAIL_RE.test(email)) return { ok: false, message: "请填写有效的邮箱" };
  if (!phone || phone.length < 6) return { ok: false, message: "请填写有效的电话" };

  return { ok: true, data: { email, phone } };
}

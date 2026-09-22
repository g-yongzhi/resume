export type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  brief: string;
  /** 蜜罐字段：正常用户应留空 */
  website?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trim(s: unknown, max: number): string {
  return String(s ?? "")
    .trim()
    .slice(0, max);
}

export function parseContactBody(body: unknown): { ok: true; data: ContactPayload } | { ok: false; message: string } {
  if (body == null || typeof body !== "object") {
    return { ok: false, message: "请求格式无效" };
  }

  const raw = body as Record<string, unknown>;
  const name = trim(raw.name, 80);
  const email = trim(raw.email, 120);
  const phone = trim(raw.phone, 40);
  const brief = trim(raw.brief, 4000);
  const website = trim(raw.website, 200);

  if (!name) return { ok: false, message: "请填写姓名" };
  if (!email || !EMAIL_RE.test(email)) return { ok: false, message: "请填写有效的电子邮箱" };
  if (!phone) return { ok: false, message: "请填写手机" };
  if (brief.length < 10) return { ok: false, message: "合作需求请至少 10 个字" };

  return {
    ok: true,
    data: { name, email, phone, brief, website: website || undefined },
  };
}

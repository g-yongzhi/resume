export type ContactFormInput = {
  name: string;
  email: string;
  phone: string;
  brief: string;
  website?: string;
};

export type ContactSubmitResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

export async function submitContactForm(input: ContactFormInput): Promise<ContactSubmitResult> {
  const res = await fetch(`${API_BASE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });

  let data: { ok?: boolean; message?: string } = {};
  try {
    data = (await res.json()) as typeof data;
  } catch {
    return { ok: false, message: "服务器响应异常，请稍后重试。" };
  }

  if (!res.ok || !data.ok) {
    return { ok: false, message: data.message ?? "提交失败，请稍后重试。" };
  }

  return { ok: true, message: data.message ?? "已收到您的咨询。" };
}

import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  bulkUpdateStatus,
  deleteContactSubmission,
  getExtendedStats,
  getSiteContact,
  isContactStatus,
  listContactSubmissions,
  setSiteContact,
  updateContactSubmission,
  type ContactStatus,
} from "../db.js";
import { parseSiteContactInput } from "../lib/siteDefaults.js";
import {
  ADMIN_COOKIE,
  adminConfigured,
  createSession,
  destroySession,
  verifyPassword,
  verifySession,
} from "../lib/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "尝试次数过多，请稍后再试" },
});

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const adminRouter = Router();

adminRouter.get("/config", (_req, res) => {
  res.json({ ok: true, loginEnabled: adminConfigured() });
});

adminRouter.post("/login", loginLimiter, (req, res) => {
  if (!adminConfigured()) {
    res.status(503).json({
      ok: false,
      message: "未配置 ADMIN_PASSWORD，请在服务器 .env 中设置管理密码",
    });
    return;
  }

  const password = String(req.body?.password ?? "");
  if (!verifyPassword(password)) {
    res.status(401).json({ ok: false, message: "密码错误" });
    return;
  }

  const token = createSession();
  res.cookie(ADMIN_COOKIE, token, COOKIE_OPTS);
  res.json({ ok: true, message: "登录成功" });
});

adminRouter.post("/logout", (req, res) => {
  destroySession(req.cookies?.[ADMIN_COOKIE]);
  res.clearCookie(ADMIN_COOKIE, { path: "/" });
  res.json({ ok: true });
});

adminRouter.get("/me", (req, res) => {
  if (!verifySession(req.cookies?.[ADMIN_COOKIE])) {
    res.status(401).json({ ok: false, authenticated: false });
    return;
  }
  res.json({ ok: true, authenticated: true });
});

adminRouter.use(requireAdmin);

adminRouter.get("/stats", (_req, res) => {
  res.json({ ok: true, stats: getExtendedStats() });
});

adminRouter.get("/site-contact", (_req, res) => {
  res.json({ ok: true, contact: getSiteContact() });
});

adminRouter.patch("/site-contact", (req, res) => {
  const parsed = parseSiteContactInput(req.body);
  if (!parsed.ok) {
    res.status(400).json({ ok: false, message: parsed.message });
    return;
  }
  setSiteContact(parsed.data);
  res.json({ ok: true, message: "联系方式已更新", contact: parsed.data });
});

adminRouter.get("/submissions", (req, res) => {
  try {
    const statusRaw = String(req.query.status ?? "");
    const status = statusRaw && isContactStatus(statusRaw) ? (statusRaw as ContactStatus) : undefined;
    const q = String(req.query.q ?? "");
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const periodRaw = String(req.query.period ?? "");
    const period = periodRaw === "today" || periodRaw === "week" ? periodRaw : undefined;
    const starred = req.query.starred === "1" || req.query.starred === "true";

    const data = listContactSubmissions({ status, q, page, limit, period, starred });
    res.json({ ok: true, ...data });
  } catch (err) {
    console.error("[admin] list submissions failed:", err);
    res.status(500).json({ ok: false, message: "读取咨询列表失败，请重启后端服务" });
  }
});

adminRouter.patch("/submissions/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    res.status(400).json({ ok: false, message: "无效 ID" });
    return;
  }

  const patch: { status?: ContactStatus; notes?: string; starred?: boolean } = {};
  if (req.body?.status !== undefined) {
    const status = String(req.body.status);
    if (!isContactStatus(status)) {
      res.status(400).json({ ok: false, message: "无效状态" });
      return;
    }
    patch.status = status;
  }
  if (req.body?.notes !== undefined) patch.notes = String(req.body.notes);
  if (req.body?.starred !== undefined) patch.starred = Boolean(req.body.starred);

  const updated = updateContactSubmission(id, patch);
  if (!updated) {
    res.status(404).json({ ok: false, message: "记录不存在或无变更" });
    return;
  }
  res.json({ ok: true, message: "已保存" });
});

adminRouter.post("/submissions/bulk-status", (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number).filter((n: number) => n > 0) : [];
  const status = String(req.body?.status ?? "");
  if (!ids.length) {
    res.status(400).json({ ok: false, message: "请选择记录" });
    return;
  }
  if (!isContactStatus(status)) {
    res.status(400).json({ ok: false, message: "无效状态" });
    return;
  }
  const count = bulkUpdateStatus(ids, status);
  res.json({ ok: true, message: `已更新 ${count} 条`, count });
});

adminRouter.delete("/submissions/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    res.status(400).json({ ok: false, message: "无效 ID" });
    return;
  }

  const deleted = deleteContactSubmission(id);
  if (!deleted) {
    res.status(404).json({ ok: false, message: "记录不存在" });
    return;
  }
  res.json({ ok: true, message: "已删除" });
});

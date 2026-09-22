import { Router } from "express";
import rateLimit from "express-rate-limit";
import { insertContactSubmission } from "../db.js";
import { notifyNewContact } from "../lib/notify.js";
import { parseContactBody } from "../lib/validateContact.js";

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "提交过于频繁，请稍后再试" },
});

export const contactRouter = Router();

contactRouter.post("/", contactLimiter, async (req, res) => {
  const parsed = parseContactBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ ok: false, message: parsed.message });
    return;
  }

  if (parsed.data.website) {
    res.status(200).json({ ok: true, message: "已收到您的咨询，我们将在两个工作日内与您联系。" });
    return;
  }

  try {
    const id = insertContactSubmission({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      brief: parsed.data.brief,
      ip: req.ip ?? null,
      userAgent: req.get("user-agent") ?? null,
    });

    notifyNewContact(parsed.data, id).catch((err) => {
      console.error("[contact] notify failed:", err);
    });

    res.status(201).json({
      ok: true,
      message: "已收到您的咨询，我们将在两个工作日内与您联系。",
    });
  } catch (err) {
    console.error("[contact] insert failed:", err);
    res.status(500).json({ ok: false, message: "提交失败，请稍后重试或直接邮件联系我们。" });
  }
});

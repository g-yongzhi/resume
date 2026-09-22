import type { NextFunction, Request, Response } from "express";
import { ADMIN_COOKIE, verifySession } from "../lib/auth.js";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[ADMIN_COOKIE];
  if (!verifySession(token)) {
    res.status(401).json({ ok: false, message: "未登录或会话已过期" });
    return;
  }
  next();
}

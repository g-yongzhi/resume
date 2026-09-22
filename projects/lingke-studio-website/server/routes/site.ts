import { Router } from "express";
import { getSiteContact } from "../db.js";

export const siteRouter = Router();

siteRouter.get("/contact", (_req, res) => {
  res.json({ ok: true, contact: getSiteContact() });
});

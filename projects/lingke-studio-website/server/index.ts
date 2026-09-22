import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { adminRouter } from "./routes/admin.js";
import { contactRouter } from "./routes/contact.js";
import { sendRobotsTxt, sendSitemapXml } from "./lib/seoFiles.js";
import { siteRouter } from "./routes/site.js";

const PORT = Number(process.env.PORT ?? 3001);
const DIST_DIR = path.resolve(process.cwd(), "dist");

const allowedOrigins = (
  process.env.CORS_ORIGINS ?? "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "lingke-api" });
});

app.use("/api/contact", contactRouter);
app.use("/api/site", siteRouter);
app.use("/api/admin", adminRouter);

/** 必须在 SPA 回退之前；Nginx 反代到 Node 时由这里返回纯文本/XML */
app.get("/robots.txt", (_req, res) => sendRobotsTxt(res, DIST_DIR));
app.get("/sitemap.xml", (_req, res) => sendSitemapXml(res, DIST_DIR));

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      res.status(404).json({ ok: false, message: "接口不存在" });
      return;
    }
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
}

app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof Error && err.message === "Not allowed by CORS") {
    res.status(403).json({ ok: false, message: "来源不被允许" });
    return;
  }
  next(err);
});

const server = app.listen(PORT, () => {
  console.log(`[lingke-api] API http://localhost:${PORT}`);
  console.log(`[lingke-api] 管理后台 → 先运行 npm run dev，再打开 http://localhost:5173/admin`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n[lingke-api] 端口 ${PORT} 已被占用。执行 npm run stop:api 后重试。\n`);
    process.exit(1);
  }
  throw err;
});

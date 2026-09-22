import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_SITE_EMAIL, DEFAULT_SITE_PHONE, type SiteContact } from "./lib/siteDefaults.js";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "lingke.db");

export type ContactStatus = "pending" | "read" | "archived";

export type ContactRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  brief: string;
  status: ContactStatus;
  notes: string;
  starred: number;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
};

export type ExtendedStats = {
  pending: number;
  read: number;
  archived: number;
  total: number;
  today: number;
  week: number;
  starred: number;
  trend: { date: string; count: number }[];
};

const VALID_STATUS = new Set<ContactStatus>(["pending", "read", "archived"]);

let db: Database.Database | null = null;

function tableColumns(database: Database.Database) {
  return (database.pragma("table_info(contact_submissions)") as { name: string }[]).map((c) => c.name);
}

function runMigrations(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      brief TEXT NOT NULL,
      ip TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_contact_created_at
      ON contact_submissions (created_at DESC);
  `);

  let cols = tableColumns(database);

  if (!cols.includes("status")) {
    database.exec(`ALTER TABLE contact_submissions ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'`);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions (status)`);
    cols = tableColumns(database);
  }
  if (!cols.includes("notes")) {
    database.exec(`ALTER TABLE contact_submissions ADD COLUMN notes TEXT NOT NULL DEFAULT ''`);
    cols = tableColumns(database);
  }
  if (!cols.includes("starred")) {
    database.exec(`ALTER TABLE contact_submissions ADD COLUMN starred INTEGER NOT NULL DEFAULT 0`);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_contact_starred ON contact_submissions (starred)`);
    cols = tableColumns(database);
  }
  if (!cols.includes("updated_at")) {
    // SQLite 仅允许常量 DEFAULT；不能用 datetime('now')
    database.exec(`ALTER TABLE contact_submissions ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''`);
    database.exec(`UPDATE contact_submissions SET updated_at = created_at WHERE updated_at = ''`);
    cols = tableColumns(database);
  }

  database.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT ''
    );
  `);

  const emailRow = database.prepare(`SELECT value FROM site_settings WHERE key = 'site_email'`).get() as
    | { value: string }
    | undefined;
  const phoneRow = database.prepare(`SELECT value FROM site_settings WHERE key = 'site_phone'`).get() as
    | { value: string }
    | undefined;

  if (!emailRow) {
    database
      .prepare(`INSERT INTO site_settings (key, value, updated_at) VALUES ('site_email', @v, datetime('now'))`)
      .run({ v: DEFAULT_SITE_EMAIL });
  }
  if (!phoneRow) {
    database
      .prepare(`INSERT INTO site_settings (key, value, updated_at) VALUES ('site_phone', @v, datetime('now'))`)
      .run({ v: DEFAULT_SITE_PHONE });
  }
}

export function getDb() {
  if (db) return db;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const conn = new Database(DB_PATH);
  conn.pragma("journal_mode = WAL");

  try {
    runMigrations(conn);
    db = conn;
    return db;
  } catch (err) {
    conn.close();
    throw err;
  }
}

export function isContactStatus(value: string): value is ContactStatus {
  return VALID_STATUS.has(value as ContactStatus);
}

export function insertContactSubmission(input: {
  name: string;
  email: string;
  phone: string;
  brief: string;
  ip: string | null;
  userAgent: string | null;
}) {
  const stmt = getDb().prepare(`
    INSERT INTO contact_submissions (name, email, phone, brief, ip, user_agent)
    VALUES (@name, @email, @phone, @brief, @ip, @userAgent)
  `);
  const result = stmt.run({
    name: input.name,
    email: input.email,
    phone: input.phone,
    brief: input.brief,
    ip: input.ip,
    userAgent: input.userAgent,
  });
  return Number(result.lastInsertRowid);
}

export function listContactSubmissions(opts: {
  status?: ContactStatus;
  q?: string;
  page: number;
  limit: number;
  period?: "today" | "week";
  starred?: boolean;
}) {
  const limit = Math.min(Math.max(opts.limit, 1), 5000);
  const page = Math.max(opts.page, 1);
  const offset = (page - 1) * limit;

  const where: string[] = [];
  const params: Record<string, string | number> = { limit, offset };

  if (opts.status) {
    where.push("status = @status");
    params.status = opts.status;
  }

  if (opts.starred) {
    where.push("starred = 1");
  }

  if (opts.period === "today") {
    where.push("date(created_at) = date('now', 'localtime')");
  } else if (opts.period === "week") {
    where.push("created_at >= datetime('now', '-7 days', 'localtime')");
  }

  const q = opts.q?.trim();
  if (q) {
    where.push("(name LIKE @q OR email LIKE @q OR phone LIKE @q OR brief LIKE @q)");
    params.q = `%${q}%`;
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total = (
    getDb()
      .prepare(`SELECT COUNT(*) AS c FROM contact_submissions ${whereSql}`)
      .get(params) as { c: number }
  ).c;

  const items = getDb()
    .prepare(
      `SELECT id, name, email, phone, brief, status, notes, starred, ip, user_agent, created_at, updated_at
       FROM contact_submissions ${whereSql}
       ORDER BY datetime(created_at) DESC
       LIMIT @limit OFFSET @offset`,
    )
    .all(params) as ContactRow[];

  return { items, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
}

export function getContactStats() {
  const rows = getDb()
    .prepare(`SELECT status, COUNT(*) AS c FROM contact_submissions GROUP BY status`)
    .all() as { status: ContactStatus; c: number }[];

  const stats = { pending: 0, read: 0, archived: 0, total: 0 };
  for (const row of rows) {
    if (row.status in stats) stats[row.status as keyof typeof stats] = row.c;
    stats.total += row.c;
  }
  return stats;
}

export function getExtendedStats(): ExtendedStats {
  const base = getContactStats();
  const dbi = getDb();

  const today = (dbi.prepare(
    `SELECT COUNT(*) AS c FROM contact_submissions WHERE date(created_at) = date('now', 'localtime')`,
  ).get() as { c: number }).c;

  const week = (dbi.prepare(
    `SELECT COUNT(*) AS c FROM contact_submissions WHERE created_at >= datetime('now', '-7 days', 'localtime')`,
  ).get() as { c: number }).c;

  const starred = (dbi.prepare(`SELECT COUNT(*) AS c FROM contact_submissions WHERE starred = 1`).get() as {
    c: number;
  }).c;

  const trendRows = dbi
    .prepare(
      `SELECT date(created_at, 'localtime') AS d, COUNT(*) AS c
       FROM contact_submissions
       WHERE created_at >= datetime('now', '-6 days', 'localtime')
       GROUP BY date(created_at, 'localtime')
       ORDER BY d ASC`,
    )
    .all() as { d: string; c: number }[];

  const trendMap = new Map(trendRows.map((r) => [r.d, r.c]));
  const trend: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    trend.push({ date: key, count: trendMap.get(key) ?? 0 });
  }

  return { ...base, today, week, starred, trend };
}

export function updateContactSubmission(
  id: number,
  patch: { status?: ContactStatus; notes?: string; starred?: boolean },
) {
  const fields: string[] = [`updated_at = datetime('now')`];
  const params: Record<string, string | number> = { id };

  if (patch.status) {
    fields.push("status = @status");
    params.status = patch.status;
  }
  if (patch.notes !== undefined) {
    fields.push("notes = @notes");
    params.notes = patch.notes.slice(0, 4000);
  }
  if (patch.starred !== undefined) {
    fields.push("starred = @starred");
    params.starred = patch.starred ? 1 : 0;
  }

  if (fields.length === 1) return false;

  const result = getDb()
    .prepare(`UPDATE contact_submissions SET ${fields.join(", ")} WHERE id = @id`)
    .run(params);
  return result.changes > 0;
}

export function updateContactStatus(id: number, status: ContactStatus) {
  return updateContactSubmission(id, { status });
}

export function bulkUpdateStatus(ids: number[], status: ContactStatus) {
  if (!ids.length) return 0;
  const stmt = getDb().prepare(
    `UPDATE contact_submissions SET status = @status, updated_at = datetime('now') WHERE id = @id`,
  );
  let n = 0;
  const tx = getDb().transaction((rows: number[]) => {
    for (const id of rows) {
      if (stmt.run({ id, status }).changes) n++;
    }
  });
  tx(ids);
  return n;
}

export function deleteContactSubmission(id: number) {
  const result = getDb().prepare(`DELETE FROM contact_submissions WHERE id = @id`).run({ id });
  return result.changes > 0;
}

export function getSiteContact(): SiteContact {
  const dbi = getDb();
  const email =
    (dbi.prepare(`SELECT value FROM site_settings WHERE key = 'site_email'`).get() as { value: string } | undefined)
      ?.value ?? DEFAULT_SITE_EMAIL;
  const phone =
    (dbi.prepare(`SELECT value FROM site_settings WHERE key = 'site_phone'`).get() as { value: string } | undefined)
      ?.value ?? DEFAULT_SITE_PHONE;
  return { email, phone };
}

export function setSiteContact(data: SiteContact) {
  const upsert = getDb().prepare(`
    INSERT INTO site_settings (key, value, updated_at) VALUES (@key, @value, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `);
  upsert.run({ key: "site_email", value: data.email });
  upsert.run({ key: "site_phone", value: data.phone });
}

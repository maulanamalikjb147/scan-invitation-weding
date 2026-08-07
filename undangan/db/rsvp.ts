import { env } from "cloudflare:workers";

export type RsvpRecord = { id: number; name: string; guests: number; attendance: "hadir" | "tidak"; message: string; createdAt: string };

async function ensureRsvpTable() {
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS rsvps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      guests INTEGER NOT NULL DEFAULT 1,
      attendance TEXT NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at DESC)"),
  ]);
}

export async function listRsvpRecords() {
  await ensureRsvpTable();
  const { results } = await env.DB.prepare("SELECT id, name, guests, attendance, message, created_at AS createdAt FROM rsvps ORDER BY created_at DESC, id DESC LIMIT 30").all<RsvpRecord>();
  return results;
}

export async function createRsvpRecord(input: Omit<RsvpRecord, "id" | "createdAt">) {
  await ensureRsvpTable();
  await env.DB.prepare("INSERT INTO rsvps (name, guests, attendance, message) VALUES (?, ?, ?, ?)").bind(input.name, input.guests, input.attendance, input.message).run();
}

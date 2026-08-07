export type Rsvp = { id: number; name: string; guests: number; attendance: "hadir" | "tidak"; message: string; createdAt: string };
export type RsvpInput = Omit<Rsvp, "id" | "createdAt">;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseHeaders = supabaseKey ? { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } : undefined;

export async function listRsvps(): Promise<Rsvp[]> {
  if (supabaseUrl && supabaseHeaders) {
    const response = await fetch(`${supabaseUrl}/rest/v1/rsvps?select=*&order=created_at.desc&limit=30`, { headers: supabaseHeaders, cache: "no-store" });
    if (!response.ok) throw new Error("Gagal memuat ucapan");
    const rows = await response.json() as Array<Record<string, unknown>>;
    return rows.map((row) => ({ id: Number(row.id), name: String(row.name), guests: Number(row.guests), attendance: row.attendance as Rsvp["attendance"], message: String(row.message ?? ""), createdAt: String(row.created_at) }));
  }
  const response = await fetch("/api/rsvp", { cache: "no-store" });
  if (!response.ok) throw new Error("Gagal memuat ucapan");
  const data = await response.json() as { rsvps: Rsvp[] };
  return data.rsvps;
}

export async function submitRsvp(input: RsvpInput) {
  const normalizedInput = {
    ...input,
    guests: Math.min(2, Math.max(1, Number(input.guests) || 1)),
    message: input.message.trim().slice(0, 500),
  };
  if (supabaseUrl && supabaseHeaders) {
    const response = await fetch(`${supabaseUrl}/rest/v1/rsvps`, { method: "POST", headers: { ...supabaseHeaders, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(normalizedInput) });
    if (!response.ok) throw new Error("RSVP belum terkirim");
    return;
  }
  const response = await fetch("/api/rsvp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(normalizedInput) });
  if (!response.ok) throw new Error("RSVP belum terkirim");
}

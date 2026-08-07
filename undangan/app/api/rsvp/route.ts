const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function supabaseHeaders(extra?: Record<string, string>) {
  if (!supabaseKey) return undefined;
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    ...extra,
  };
}

function unavailable() {
  return Response.json(
    { error: "Supabase belum dikonfigurasi" },
    { status: 503 },
  );
}

export async function GET() {
  const headers = supabaseHeaders();
  if (!supabaseUrl || !headers) return unavailable();

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rsvps?select=*&order=created_at.desc&limit=30`,
      { headers, cache: "no-store" },
    );
    if (!response.ok) throw new Error("Supabase request failed");

    const rows = await response.json() as Array<{
      id: number;
      name: string;
      guests: number;
      attendance: "hadir" | "tidak";
      message: string;
      created_at: string;
    }>;

    return Response.json({
      rsvps: rows.map(({ created_at, ...row }) => ({
        ...row,
        createdAt: created_at,
      })),
    });
  } catch {
    return Response.json(
      { error: "Ucapan belum dapat dimuat" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const headers = supabaseHeaders({
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  });
  if (!supabaseUrl || !headers) return unavailable();

  try {
    const payload = await request.json() as { name?: string; guests?: number; attendance?: string; message?: string };
    const name = payload.name?.trim().slice(0, 80) ?? "";
    const guests = Math.min(5, Math.max(1, Number(payload.guests) || 1));
    const attendance = payload.attendance === "tidak" ? "tidak" : "hadir";
    const message = payload.message?.trim().slice(0, 500) ?? "";
    if (name.length < 2) return Response.json({ error: "Nama wajib diisi" }, { status: 400 });

    const response = await fetch(`${supabaseUrl}/rest/v1/rsvps`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name, guests, attendance, message }),
    });
    if (!response.ok) throw new Error("Supabase request failed");

    return Response.json({ ok: true }, { status: 201 });
  } catch { return Response.json({ error: "RSVP belum dapat dikirim" }, { status: 500 }); }
}

import { getDatabase } from "@/lib/database";
import { isValidIsoDate } from "@/lib/date-validation";
import { isResponse, requireOwner } from "@/lib/server-auth";
import { del } from "@vercel/blob";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ownerId = await requireOwner();
  if (isResponse(ownerId)) return ownerId;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const birthday = body?.birthday;
  if (!body || typeof body.id !== "string" || typeof body.name !== "string" || body.name.trim().length < 2 ||
    (birthday !== null && birthday !== undefined && birthday !== "" && (typeof birthday !== "string" || !isValidIsoDate(birthday)))) {
    return Response.json({ error: "Dados do cliente inválidos." }, { status: 400 });
  }
  const normalizedBirthday = typeof birthday === "string" && birthday ? birthday : null;

  try {
    const sql = getDatabase();
    const saved = await sql`INSERT INTO clients (id, owner_id, full_name, email, phone, birth_date, company)
      VALUES (${body.id}, ${ownerId}, ${body.name.trim()}, ${String(body.email ?? "").trim()}, ${String(body.phone ?? "").trim()}, ${normalizedBirthday}, ${String(body.company ?? "").trim()})
      ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email, phone = EXCLUDED.phone, birth_date = EXCLUDED.birth_date, company = EXCLUDED.company, updated_at = now()
      WHERE clients.owner_id = ${ownerId} RETURNING id`;
    if (!saved.length) return Response.json({ error: "Cliente não encontrado." }, { status: 404 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Não foi possível salvar o cliente." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const ownerId = await requireOwner();
  if (isResponse(ownerId)) return ownerId;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "ID do cliente obrigatório." }, { status: 400 });

  try {
    const sql = getDatabase();
    const attachments = await sql`SELECT pdf_pathname FROM policies WHERE client_id = ${id} AND owner_id = ${ownerId} AND pdf_pathname IS NOT NULL`;
    const paths = attachments.map((attachment) => attachment.pdf_pathname as string);
    if (paths.length) await del(paths);
    await sql`DELETE FROM clients WHERE id = ${id} AND owner_id = ${ownerId}`;
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Não foi possível excluir o cliente." }, { status: 503 });
  }
}
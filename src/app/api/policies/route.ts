import { getDatabase } from "@/lib/database";
import { isValidIsoDate } from "@/lib/date-validation";
import { isResponse, requireOwner } from "@/lib/server-auth";
import { del } from "@vercel/blob";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ownerId = await requireOwner();
  if (isResponse(ownerId)) return ownerId;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body.id !== "string" || typeof body.clientId !== "string" || typeof body.number !== "string" || typeof body.insurer !== "string" || typeof body.type !== "string" || !Number.isFinite(Number(body.premium)) || Number(body.premium) < 0 || !isValidIsoDate(body.startDate) || !isValidIsoDate(body.endDate) || body.endDate < body.startDate) {
    return Response.json({ error: "Dados da apólice inválidos." }, { status: 400 });
  }

  try {
    const sql = getDatabase();
    const saved = await sql`INSERT INTO policies (id, owner_id, client_id, policy_number, insurer, coverage, premium, start_date, end_date, notes)
      VALUES (${body.id}, ${ownerId}, ${body.clientId}, ${body.number.trim()}, ${body.insurer.trim()}, ${body.type}, ${Number(body.premium)}, ${body.startDate}, ${body.endDate}, ${String(body.notes ?? "").trim()})
      ON CONFLICT (id) DO UPDATE SET client_id = EXCLUDED.client_id, policy_number = EXCLUDED.policy_number, insurer = EXCLUDED.insurer, coverage = EXCLUDED.coverage, premium = EXCLUDED.premium, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date, notes = EXCLUDED.notes, updated_at = now()
      WHERE policies.owner_id = ${ownerId} RETURNING id`;
    if (!saved.length) return Response.json({ error: "Apólice não encontrada." }, { status: 404 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Não foi possível salvar a apólice. Confira se o cliente existe." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const ownerId = await requireOwner();
  if (isResponse(ownerId)) return ownerId;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "ID da apólice obrigatório." }, { status: 400 });

  try {
    const sql = getDatabase();
    const policies = await sql`SELECT pdf_pathname FROM policies WHERE id = ${id} AND owner_id = ${ownerId}`;
    if (policies[0]?.pdf_pathname) await del(policies[0].pdf_pathname as string);
    await sql`DELETE FROM policies WHERE id = ${id} AND owner_id = ${ownerId}`;
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Não foi possível excluir a apólice." }, { status: 503 });
  }
}
import { getDatabase } from "@/lib/database";
import { isValidIsoDate } from "@/lib/date-validation";
import { isResponse, requireOwner } from "@/lib/server-auth";
import { del } from "@vercel/blob";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ownerId = await requireOwner();
  if (isResponse(ownerId)) return ownerId;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const validOptionalText = (value: unknown) => value === null || value === undefined || value === "" || typeof value === "string";
  const validOptionalDate = (value: unknown) => value === null || value === undefined || value === "" || isValidIsoDate(value);
  const premiumValue = body?.premium;
  const premiumIsEmpty = premiumValue === null || premiumValue === undefined || premiumValue === "";
  const premium = premiumIsEmpty
    ? null
    : typeof premiumValue === "number" || typeof premiumValue === "string"
      ? Number(premiumValue)
      : Number.NaN;
  const startDate = typeof body?.startDate === "string" && body.startDate ? body.startDate : null;
  const endDate = body?.endDate;

  if (!body || typeof body.id !== "string" || typeof body.clientId !== "string" ||
    !validOptionalText(body.number) || !validOptionalText(body.insurer) || !validOptionalText(body.type) ||
    (!premiumIsEmpty && (premium === null || !Number.isFinite(premium) || premium < 0)) ||
    !validOptionalDate(body.startDate) || !isValidIsoDate(endDate) ||
    (startDate !== null && endDate < startDate)) {
    return Response.json({ error: "Dados da apólice inválidos." }, { status: 400 });
  }
  const number = typeof body.number === "string" ? body.number.trim() || null : null;
  const insurer = typeof body.insurer === "string" ? body.insurer.trim() || null : null;
  const type = typeof body.type === "string" ? body.type.trim() || null : null;

  try {
    const sql = getDatabase();
    const saved = await sql`INSERT INTO policies (id, owner_id, client_id, policy_number, insurer, coverage, premium, start_date, end_date, notes)
      VALUES (${body.id}, ${ownerId}, ${body.clientId}, ${number}, ${insurer}, ${type}, ${premium}, ${startDate}, ${endDate}, ${String(body.notes ?? "").trim()})
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
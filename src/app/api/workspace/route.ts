import { getDatabase } from "@/lib/database";
import { isResponse, requireOwner } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function GET() {
  const ownerId = await requireOwner();
  if (isResponse(ownerId)) return ownerId;

  try {
    const sql = getDatabase();
    const [clients, policies] = await Promise.all([
      sql`SELECT id, full_name AS name, email, phone, to_char(birth_date, 'YYYY-MM-DD') AS birthday, company FROM clients WHERE owner_id = ${ownerId} ORDER BY full_name`,
      sql`SELECT id, client_id AS "clientId", policy_number AS number, insurer, coverage AS type, premium::float8 AS premium, to_char(start_date, 'YYYY-MM-DD') AS "startDate", to_char(end_date, 'YYYY-MM-DD') AS "endDate", notes, pdf_name AS "pdfName" FROM policies WHERE owner_id = ${ownerId} ORDER BY created_at DESC`,
    ]);
    return Response.json({ clients, policies }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Não foi possível carregar a carteira. Confira a conexão e o esquema do Neon." }, { status: 503 });
  }
}
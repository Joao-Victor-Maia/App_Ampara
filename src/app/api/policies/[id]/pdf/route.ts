import { del, get, put } from "@vercel/blob";
import { getDatabase } from "@/lib/database";
import { isResponse, requireOwner } from "@/lib/server-auth";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };
const maximumPdfSize = 4 * 1024 * 1024;

export async function POST(request: Request, { params }: RouteContext) {
  const ownerId = await requireOwner();
  if (isResponse(ownerId)) return ownerId;
  const { id } = await params;
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > maximumPdfSize || !file.name.toLowerCase().endsWith(".pdf")) {
    return Response.json({ error: "Envie um arquivo PDF de até 4 MB." }, { status: 400 });
  }

  const signature = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
  if (signature !== "%PDF-") return Response.json({ error: "O arquivo enviado não é um PDF válido." }, { status: 400 });

  const fileName = file.name.split(/[\\/]/).pop()?.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180) || "apolice.pdf";
  try {
    const sql = getDatabase();
    const existing = await sql`SELECT pdf_pathname FROM policies WHERE id = ${id} AND owner_id = ${ownerId}`;
    if (!existing.length) return Response.json({ error: "Apólice não encontrada." }, { status: 404 });

    const blob = await put(`policies/${ownerId}/${crypto.randomUUID()}.pdf`, file, {
      access: "private",
      addRandomSuffix: true,
      contentType: "application/pdf",
    });

    try {
      await sql`UPDATE policies SET pdf_pathname = ${blob.pathname}, pdf_name = ${fileName}, updated_at = now() WHERE id = ${id} AND owner_id = ${ownerId}`;
    } catch (error) {
      await del(blob.pathname).catch(() => undefined);
      throw error;
    }

    const oldPath = existing[0].pdf_pathname as string | null;
    if (oldPath) await del(oldPath).catch(() => undefined);
    return Response.json({ name: fileName });
  } catch {
    return Response.json({ error: "Não foi possível armazenar o PDF privado." }, { status: 503 });
  }
}

export async function GET(_request: Request, { params }: RouteContext) {
  const ownerId = await requireOwner();
  if (isResponse(ownerId)) return ownerId;
  const { id } = await params;

  try {
    const sql = getDatabase();
    const rows = await sql`SELECT pdf_pathname, pdf_name FROM policies WHERE id = ${id} AND owner_id = ${ownerId} AND pdf_pathname IS NOT NULL`;
    if (!rows.length) return new Response("PDF não encontrado.", { status: 404 });

    const blob = await get(rows[0].pdf_pathname as string, { access: "private" });
    if (!blob?.stream || blob.statusCode !== 200) return new Response("PDF não encontrado.", { status: 404 });

    const fileName = String(rows[0].pdf_name ?? "apolice.pdf").replace(/[\r\n"]/g, "_");
    return new Response(blob.stream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json({ error: "Não foi possível abrir o PDF." }, { status: 503 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const ownerId = await requireOwner();
  if (isResponse(ownerId)) return ownerId;
  const { id } = await params;

  try {
    const sql = getDatabase();
    const rows = await sql`SELECT pdf_pathname FROM policies WHERE id = ${id} AND owner_id = ${ownerId}`;
    if (!rows.length) return new Response("Apólice não encontrada.", { status: 404 });
    if (rows[0].pdf_pathname) await del(rows[0].pdf_pathname as string);
    await sql`UPDATE policies SET pdf_pathname = NULL, pdf_name = NULL, updated_at = now() WHERE id = ${id} AND owner_id = ${ownerId}`;
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Não foi possível remover o PDF." }, { status: 503 });
  }
}
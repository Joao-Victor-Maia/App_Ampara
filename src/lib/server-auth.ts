import { auth } from "@clerk/nextjs/server";

const sharedWorkspaceOwnerId = "ampara-shared-workspace";

export async function requireOwner() {
  if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return Response.json({ error: "Autenticação ainda não configurada." }, { status: 503 });
  }

  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Sessão não autenticada." }, { status: 401 });
  return sharedWorkspaceOwnerId;
}

export function isResponse(value: string | Response): value is Response {
  return value instanceof Response;
}
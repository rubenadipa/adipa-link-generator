import { NextRequest, NextResponse } from "next/server";
import { requireStaffLinkAccess } from "@/lib/authz";
import { extenderValidez } from "@/lib/store";

// Regla 10: extender validez cuando aplique.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const acceso = await requireStaffLinkAccess(id);
  if (!acceso) return NextResponse.json({ ok: false, error: "no_autorizado" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const dias = typeof body?.dias === "number" && body.dias > 0 ? Math.floor(body.dias) : null;
  if (!dias) return NextResponse.json({ ok: false, error: "dias_invalido" }, { status: 400 });

  const link = await extenderValidez(id, dias);
  return NextResponse.json({ ok: true, validezDias: link?.validezDias });
}

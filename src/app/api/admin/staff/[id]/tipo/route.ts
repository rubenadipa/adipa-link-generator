import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/authz";
import { cambiarTipoStaff } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ ok: false, error: "no_autorizado" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const tipo = body?.tipo === "cursos" || body?.tipo === "diplomados" ? body.tipo : null;
  if (!tipo) return NextResponse.json({ ok: false, error: "tipo_invalido" }, { status: 400 });

  await cambiarTipoStaff(id, tipo);
  return NextResponse.json({ ok: true });
}

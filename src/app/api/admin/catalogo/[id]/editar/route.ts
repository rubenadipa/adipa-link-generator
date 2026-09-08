import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/authz";
import { editarContenido } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ ok: false, error: "no_autorizado" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : undefined;
  const descripcion = typeof body?.descripcion === "string" ? body.descripcion.trim() : undefined;

  const contenido = editarContenido(id, { titulo, descripcion });
  if (!contenido) return NextResponse.json({ ok: false, error: "no_encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/authz";
import { crearContenido } from "@/lib/store";

// P7. Gestionar catálogo (admin) — crear contenido.
export async function POST(req: NextRequest) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ ok: false, error: "no_autorizado" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const tipo = body?.tipo === "curso" || body?.tipo === "diplomado" ? body.tipo : null;
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
  const descripcion = typeof body?.descripcion === "string" ? body.descripcion.trim() : "";

  if (!tipo || !titulo) {
    return NextResponse.json({ ok: false, error: "faltan_datos" }, { status: 400 });
  }

  const contenido = await crearContenido({ tipo, titulo, descripcion });
  return NextResponse.json({ ok: true, contenidoId: contenido.id });
}

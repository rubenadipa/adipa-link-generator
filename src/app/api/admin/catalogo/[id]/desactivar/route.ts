import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/authz";
import { desactivarContenido } from "@/lib/store";

// Regla 19: no se borra físicamente, se desactiva (soft delete) — los links
// ya creados sobre ese contenido siguen funcionando.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ ok: false, error: "no_autorizado" }, { status: 403 });

  const { id } = await params;
  const contenido = await desactivarContenido(id);
  if (!contenido) return NextResponse.json({ ok: false, error: "no_encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

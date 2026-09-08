import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth-staff";
import { crearLink, existeLinkActivoDuplicado, findContenidoById } from "@/lib/store";

// P3. Crear link — valida catálogo, aisla por tipo de staff (regla 1) y
// advierte (sin bloquear) si el correo ya tiene un link activo para el
// mismo contenido (regla 13).
export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const contenidoId = typeof body?.contenidoId === "string" ? body.contenidoId : "";
  const emailAlumno = typeof body?.emailAlumno === "string" ? body.emailAlumno.trim() : "";
  const validezDias =
    typeof body?.validezDias === "number" && body.validezDias > 0 ? Math.floor(body.validezDias) : null;
  const confirmar = body?.confirmar === true;

  if (!contenidoId || !emailAlumno) {
    return NextResponse.json({ ok: false, error: "faltan_datos" }, { status: 400 });
  }

  const contenido = findContenidoById(contenidoId);
  if (!contenido || !contenido.activo) {
    return NextResponse.json({ ok: false, error: "contenido_invalido" }, { status: 400 });
  }

  const tipoStaffEsperado = session.staff.rol === "admin" ? contenido.tipo : session.staff.tipo === "cursos" ? "curso" : "diplomado";
  if (session.staff.rol !== "admin" && contenido.tipo !== tipoStaffEsperado) {
    return NextResponse.json({ ok: false, error: "fuera_de_tipo" }, { status: 403 });
  }

  if (!confirmar && existeLinkActivoDuplicado(emailAlumno, contenidoId)) {
    return NextResponse.json({ ok: false, warning: "correo_ya_tiene_link_activo" });
  }

  const link = crearLink({ contenidoId, emailAlumno, validezDias, createdBy: session.staffId });
  const origin = req.nextUrl.origin;

  return NextResponse.json({
    ok: true,
    linkId: link.id,
    tokenPublico: link.tokenPublico,
    url: `${origin}/l/${link.tokenPublico}`,
  });
}

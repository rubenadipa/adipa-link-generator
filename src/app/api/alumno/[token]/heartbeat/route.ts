import { NextRequest, NextResponse } from "next/server";
import { computeEstadoEfectivo, findLinkByToken } from "@/lib/store";
import { getAlumnoSession, setAlumnoCookie, signAlumnoToken } from "@/lib/auth-alumno";

// Regla 17: mientras el reproductor esté activo, el token se renueva solo en
// segundo plano (heartbeat), sin exigir nueva autenticación.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sesion = await getAlumnoSession(token);
  if (!sesion || !sesion.fpOk) return NextResponse.json({ ok: false }, { status: 401 });

  const link = await findLinkByToken(token);
  if (!link || computeEstadoEfectivo(link) !== "activo") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const nuevoToken = signAlumnoToken({ linkId: sesion.linkId, tokenPublico: sesion.tokenPublico, fpOk: sesion.fpOk });
  await setAlumnoCookie(token, nuevoToken);
  return NextResponse.json({ ok: true });
}

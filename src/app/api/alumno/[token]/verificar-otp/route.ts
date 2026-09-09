import { NextRequest, NextResponse } from "next/server";
import { agregarLog, computeEstadoEfectivo, findLinkByToken } from "@/lib/store";
import { verificarOtp } from "@/lib/otp";
import { getIp, getPais, parseBrowser } from "@/lib/request-meta";
import { setAlumnoCookie, signAlumnoToken } from "@/lib/auth-alumno";

// A3. Ingreso de OTP — máximo 3 intentos, luego bloqueo temporal de 15 min
// (regla 3), que reinicia el contador al pasar (regla 18).
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json().catch(() => null);
  const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
  if (!otp) return NextResponse.json({ ok: false, error: "faltan_datos" }, { status: 400 });

  const link = await findLinkByToken(token);
  if (!link) return NextResponse.json({ ok: false, error: "link_no_disponible" }, { status: 404 });

  const meta = {
    ip: getIp(req),
    browser: parseBrowser(req.headers.get("user-agent")),
    pais: getPais(req),
  };

  const estado = computeEstadoEfectivo(link);
  if (estado === "revocado" || estado === "expirado") {
    await agregarLog({
      linkId: link.id,
      emailIntentado: link.emailAsignado,
      ...meta,
      resultado: estado === "revocado" ? "link_revocado" : "link_expirado",
    });
    return NextResponse.json({ ok: false, error: "link_no_disponible" }, { status: 403 });
  }

  const resultado = await verificarOtp(link.id, otp);
  if (!resultado.ok) {
    if (resultado.error !== "expirado") {
      await agregarLog({
        linkId: link.id,
        emailIntentado: link.emailAsignado,
        ...meta,
        resultado: resultado.error === "bloqueado" ? "otp_bloqueado" : "otp_invalido",
      });
    }
    return NextResponse.json({ ...resultado }, { status: 401 });
  }

  const alumnoToken = signAlumnoToken({ linkId: link.id, tokenPublico: token, fpOk: false });
  await setAlumnoCookie(token, alumnoToken);

  return NextResponse.json({ ok: true });
}

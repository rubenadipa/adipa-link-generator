import { NextRequest, NextResponse } from "next/server";
import { agregarLog, computeEstadoEfectivo, findLinkByToken } from "@/lib/store";
import { generarOtp } from "@/lib/otp";
import { enviarOtpDemo } from "@/lib/mailer";
import { getIp, getPais, parseBrowser } from "@/lib/request-meta";

// A2. Solicitud de OTP — regla 2: si el correo no coincide con el asignado,
// bloqueo inmediato y logueado. No se revela si el link existe o no.
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!email) return NextResponse.json({ ok: false, error: "faltan_datos" }, { status: 400 });

  const link = await findLinkByToken(token);
  const meta = {
    ip: getIp(req),
    browser: parseBrowser(req.headers.get("user-agent")),
    pais: getPais(req),
  };

  if (!link) {
    return NextResponse.json({ ok: false, error: "link_no_disponible" }, { status: 404 });
  }

  const estado = computeEstadoEfectivo(link);
  if (estado === "revocado" || estado === "expirado") {
    await agregarLog({
      linkId: link.id,
      emailIntentado: email,
      ...meta,
      resultado: estado === "revocado" ? "link_revocado" : "link_expirado",
    });
    return NextResponse.json({ ok: false, error: "link_no_disponible" }, { status: 403 });
  }

  if (email.toLowerCase() !== link.emailAsignado.toLowerCase()) {
    await agregarLog({ linkId: link.id, emailIntentado: email, ...meta, resultado: "correo_no_autorizado" });
    return NextResponse.json({ ok: false, error: "correo_no_autorizado" }, { status: 403 });
  }

  const resultado = await generarOtp(link.id);
  if (!resultado.ok) {
    return NextResponse.json(
      { ok: false, error: resultado.error, segundosRestantes: resultado.segundosRestantes },
      { status: 429 }
    );
  }

  await enviarOtpDemo(email, resultado.codigo);
  // Modo demo (BRIEF "Fuera de alcance" #3): el código se devuelve para mostrarlo en pantalla.
  return NextResponse.json({ ok: true, demoOtp: resultado.codigo });
}

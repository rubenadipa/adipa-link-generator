import { NextRequest, NextResponse } from "next/server";
import { computeEstadoEfectivo, findLinkByToken } from "@/lib/store";
import { generarOtp } from "@/lib/otp";
import { enviarOtpDemo } from "@/lib/mailer";

// A3 (mejora del brief refinado): reenviar código con cooldown de 30s;
// cada reenvío invalida el código anterior (generarOtp ya lo maneja).
export async function POST(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const link = findLinkByToken(token);
  if (!link) return NextResponse.json({ ok: false, error: "link_no_disponible" }, { status: 404 });

  const estado = computeEstadoEfectivo(link);
  if (estado !== "activo") {
    return NextResponse.json({ ok: false, error: "link_no_disponible" }, { status: 403 });
  }

  const resultado = generarOtp(link.id);
  if (!resultado.ok) {
    return NextResponse.json(
      { ok: false, error: resultado.error, segundosRestantes: resultado.segundosRestantes },
      { status: 429 }
    );
  }

  await enviarOtpDemo(link.emailAsignado, resultado.codigo);
  return NextResponse.json({ ok: true, demoOtp: resultado.codigo });
}

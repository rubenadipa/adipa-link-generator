import { NextRequest, NextResponse } from "next/server";
import {
  agregarLog,
  computeEstadoEfectivo,
  findDeviceByFingerprint,
  findLinkByToken,
  listDevicesForLink,
  marcarPrimerAccesoSiCorresponde,
  registrarDevice,
  tocarDevice,
} from "@/lib/store";
import { getIp, getPais, parseBrowser } from "@/lib/request-meta";
import { getAlumnoSession, setAlumnoCookie, signAlumnoToken } from "@/lib/auth-alumno";

// A4. Verificación de fingerprint — reglas 4, 5 y 14: 1 fingerprint = 1
// device, máximo `slotsMax` (2 por defecto, hasta 3 si el staff sumó slot).
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json().catch(() => null);
  const fingerprint = typeof body?.fingerprint === "string" ? body.fingerprint : "";
  if (!fingerprint) return NextResponse.json({ ok: false, error: "faltan_datos" }, { status: 400 });

  const link = findLinkByToken(token);
  if (!link) return NextResponse.json({ ok: false, error: "link_no_disponible" }, { status: 404 });

  const sesion = await getAlumnoSession(token);
  if (!sesion || sesion.linkId !== link.id) {
    return NextResponse.json({ ok: false, error: "sesion_invalida" }, { status: 401 });
  }

  const meta = {
    ip: getIp(req),
    browser: parseBrowser(req.headers.get("user-agent")),
    pais: getPais(req),
  };

  const estado = computeEstadoEfectivo(link);
  if (estado === "revocado" || estado === "expirado") {
    agregarLog({
      linkId: link.id,
      emailIntentado: link.emailAsignado,
      ...meta,
      resultado: estado === "revocado" ? "link_revocado" : "link_expirado",
    });
    return NextResponse.json({ ok: false, error: "link_no_disponible" }, { status: 403 });
  }

  const existente = findDeviceByFingerprint(link.id, fingerprint);
  if (existente) {
    tocarDevice(existente);
  } else if (listDevicesForLink(link.id).length < link.slotsMax) {
    registrarDevice(link.id, fingerprint);
    marcarPrimerAccesoSiCorresponde(link.id);
  } else {
    agregarLog({ linkId: link.id, emailIntentado: link.emailAsignado, ...meta, resultado: "limite_devices" });
    return NextResponse.json({ ok: false, error: "limite_devices" }, { status: 403 });
  }

  agregarLog({ linkId: link.id, emailIntentado: link.emailAsignado, ...meta, resultado: "ok" });

  const nuevoToken = signAlumnoToken({ linkId: link.id, tokenPublico: token, fpOk: true });
  await setAlumnoCookie(token, nuevoToken);

  return NextResponse.json({ ok: true });
}

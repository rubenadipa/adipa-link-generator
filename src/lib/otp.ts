import { newOtpCodigo } from "./ids";
import { getOtp, setOtp } from "./store";
import type { OtpRecord } from "./types";

// Reglas 3 y 18 del BRIEF: 3 intentos fallidos -> bloqueo 15 min, luego el
// contador se reinicia. TTL de 10 min por código. Reenvío con cooldown de 30s
// (mejora agregada en el brief refinado, sección A3).
const OTP_TTL_MS = 10 * 60 * 1000;
const BLOQUEO_MS = 15 * 60 * 1000;
export const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_INTENTOS = 3;

export type OtpGenerarResultado =
  | { ok: true; codigo: string }
  | { ok: false; error: "cooldown"; segundosRestantes: number };

export async function generarOtp(linkId: string): Promise<OtpGenerarResultado> {
  const existente = await getOtp(linkId);
  const ahora = Date.now();
  if (existente && ahora - existente.lastSentAt < RESEND_COOLDOWN_MS) {
    return {
      ok: false,
      error: "cooldown",
      segundosRestantes: Math.ceil((RESEND_COOLDOWN_MS - (ahora - existente.lastSentAt)) / 1000),
    };
  }
  const codigo = newOtpCodigo();
  const record: OtpRecord = {
    linkId,
    codigo,
    expiresAt: ahora + OTP_TTL_MS,
    intentosFallidos: 0,
    bloqueadoHasta: existente?.bloqueadoHasta && existente.bloqueadoHasta > ahora ? existente.bloqueadoHasta : null,
    lastSentAt: ahora,
  };
  await setOtp(linkId, record);
  return { ok: true, codigo };
}

export type OtpVerificarResultado =
  | { ok: true }
  | { ok: false; error: "bloqueado"; segundosRestantes: number }
  | { ok: false; error: "expirado" }
  | { ok: false; error: "invalido"; intentosRestantes: number };

export async function verificarOtp(linkId: string, codigoIngresado: string): Promise<OtpVerificarResultado> {
  const ahora = Date.now();
  const record = await getOtp(linkId);

  if (record?.bloqueadoHasta && record.bloqueadoHasta > ahora) {
    return { ok: false, error: "bloqueado", segundosRestantes: Math.ceil((record.bloqueadoHasta - ahora) / 1000) };
  }

  if (!record || record.expiresAt < ahora) {
    return { ok: false, error: "expirado" };
  }

  if (record.codigo !== codigoIngresado.trim()) {
    const intentosFallidos = record.intentosFallidos + 1;
    if (intentosFallidos >= MAX_INTENTOS) {
      await setOtp(linkId, { ...record, intentosFallidos: 0, bloqueadoHasta: ahora + BLOQUEO_MS });
      return { ok: false, error: "bloqueado", segundosRestantes: Math.ceil(BLOQUEO_MS / 1000) };
    }
    await setOtp(linkId, { ...record, intentosFallidos });
    return { ok: false, error: "invalido", intentosRestantes: MAX_INTENTOS - intentosFallidos };
  }

  // Código consumido: no se puede reutilizar.
  await setOtp(linkId, { ...record, codigo: "", expiresAt: 0 });
  return { ok: true };
}

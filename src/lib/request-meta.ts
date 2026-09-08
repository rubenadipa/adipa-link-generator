import type { NextRequest } from "next/server";

export function getIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "desconocida";
}

/**
 * Best-effort: solo resuelve país automáticamente en Vercel (header
 * `x-vercel-ip-country`). Ver BRIEF.md, "Fuera de alcance" #11.
 */
export function getPais(req: NextRequest): string {
  return req.headers.get("x-vercel-ip-country") ?? "Desconocido";
}

export function parseBrowser(userAgent: string | null): string {
  if (!userAgent) return "Desconocido";
  if (/Edg\//.test(userAgent)) return "Edge";
  if (/OPR\//.test(userAgent) || /Opera/.test(userAgent)) return "Opera";
  if (/Chrome\//.test(userAgent) && !/Chromium/.test(userAgent)) return "Chrome";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) return "Safari";
  return "Otro";
}

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { ALUMNO_SESSION_TTL_SECONDS } from "./alumno-session-config";

// Regla 17 del BRIEF: sesión de 1h que se renueva sola (heartbeat) mientras
// el reproductor esté activo, sin exigir nueva autenticación al alumno.
const JWT_SECRET = process.env.ALUMNO_JWT_SECRET || "dev-secret-alumno-cambiar-en-produccion";

export interface AlumnoTokenPayload {
  linkId: string;
  tokenPublico: string;
  fpOk: boolean;
}

function cookieName(tokenPublico: string): string {
  return `adipa_alumno_${tokenPublico}`;
}

export function signAlumnoToken(payload: AlumnoTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ALUMNO_SESSION_TTL_SECONDS });
}

export async function setAlumnoCookie(tokenPublico: string, token: string): Promise<void> {
  const store = await cookies();
  store.set(cookieName(tokenPublico), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ALUMNO_SESSION_TTL_SECONDS,
  });
}

export async function getAlumnoSession(tokenPublico: string): Promise<AlumnoTokenPayload | null> {
  const store = await cookies();
  const token = store.get(cookieName(tokenPublico))?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AlumnoTokenPayload;
    if (payload.tokenPublico !== tokenPublico) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function clearAlumnoCookie(tokenPublico: string): Promise<void> {
  const store = await cookies();
  store.delete(cookieName(tokenPublico));
}

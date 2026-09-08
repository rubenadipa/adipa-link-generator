import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { findStaffById } from "./store";
import type { Rol, StaffAccount, TipoStaff } from "./types";

// Regla 16 del BRIEF: el login de staff usa solo email + password (sin OTP),
// asimetría intencional frente al alumno (ver BRIEF.md).
const JWT_SECRET = process.env.STAFF_JWT_SECRET || "dev-secret-staff-cambiar-en-produccion";
const COOKIE_NAME = "adipa_staff_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8h de jornada de trabajo

export interface StaffTokenPayload {
  staffId: string;
  rol: Rol;
  tipo: TipoStaff;
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function signStaffToken(payload: StaffTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: SESSION_TTL_SECONDS });
}

export async function setStaffCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearStaffCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export interface StaffSession extends StaffTokenPayload {
  staff: StaffAccount;
}

export async function getStaffSession(): Promise<StaffSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as StaffTokenPayload;
    const staff = findStaffById(payload.staffId);
    if (!staff || !staff.activo) return null;
    return { ...payload, staff };
  } catch {
    return null;
  }
}

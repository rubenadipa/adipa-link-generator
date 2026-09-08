import { getStaffSession, type StaffSession } from "./auth-staff";
import { findLinkById, puedeAccederLink } from "./store";
import type { LinkRecord } from "./types";

/**
 * Resuelve la sesión de staff y el link, validando el aislamiento por tipo
 * (regla 1 del BRIEF). Devuelve `null` si falta autenticación, el link no
 * existe, o el staff no tiene permiso sobre ese tipo de contenido.
 */
/**
 * P6/P7 son exclusivos del Admin (regla 11 y 19 del BRIEF).
 */
export async function requireAdminSession(): Promise<StaffSession | null> {
  const session = await getStaffSession();
  if (!session || session.staff.rol !== "admin") return null;
  return session;
}

export async function requireStaffLinkAccess(
  linkId: string
): Promise<{ session: StaffSession; link: LinkRecord } | null> {
  const session = await getStaffSession();
  if (!session) return null;
  const link = findLinkById(linkId);
  if (!link) return null;
  if (!puedeAccederLink(session.staff, link)) return null;
  return { session, link };
}

// Compartido entre server (auth-alumno.ts) y client (Heartbeat.tsx) — no debe
// importar "next/headers" ni nada server-only.
export const ALUMNO_SESSION_TTL_SECONDS = 60 * 60; // 1 hora (regla 17 del BRIEF)

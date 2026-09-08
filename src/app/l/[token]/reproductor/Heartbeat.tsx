"use client";

import { useEffect } from "react";
import { ALUMNO_SESSION_TTL_SECONDS } from "@/lib/alumno-session-config";

// Regla 17: renueva el token cada cierto intervalo mientras el reproductor
// esté montado, para no cortar el video a mitad de un curso largo.
const HEARTBEAT_INTERVAL_MS = (ALUMNO_SESSION_TTL_SECONDS / 4) * 1000; // cada ~15 min

export function Heartbeat({ token }: { token: string }) {
  useEffect(() => {
    const id = setInterval(() => {
      fetch(`/api/alumno/${token}/heartbeat`, { method: "POST" }).catch(() => {
        // Si falla, el próximo request protegido fallará y se exigirá re-autenticación.
      });
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [token]);

  return null;
}

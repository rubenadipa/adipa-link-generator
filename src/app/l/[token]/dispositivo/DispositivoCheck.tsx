"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { computeFingerprint } from "@/lib/fingerprint-client";

export function DispositivoCheck({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function verificar() {
      const fingerprint = await computeFingerprint();
      if (cancelado) return;

      const res = await fetch(`/api/alumno/${token}/verificar-fingerprint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint }),
      });
      const data = await res.json();
      if (cancelado) return;

      if (data.ok) {
        router.push(`/l/${token}/reproductor`);
        return;
      }
      if (data.error === "limite_devices") {
        router.push(`/l/${token}/error?motivo=dispositivos`);
        return;
      }
      if (data.error === "sesion_invalida") {
        router.push(`/l/${token}`);
        return;
      }
      if (data.error === "link_no_disponible") {
        router.push(`/l/${token}/error?motivo=no_disponible`);
        return;
      }
      setError("No pudimos verificar tu dispositivo. Intenta recargar la página.");
    }

    verificar();
    return () => {
      cancelado = true;
    };
  }, [token, router]);

  return (
    <div className="mt-6">
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
      )}
    </div>
  );
}

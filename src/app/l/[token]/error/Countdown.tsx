"use client";

import { useEffect, useState } from "react";

export function Countdown({ segundosIniciales }: { segundosIniciales: number }) {
  const [segundos, setSegundos] = useState(segundosIniciales);

  useEffect(() => {
    if (segundos <= 0) return;
    const id = setInterval(() => setSegundos((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [segundos]);

  const minutos = Math.floor(segundos / 60);
  const seg = segundos % 60;

  return (
    <p className="mt-3 text-sm font-medium text-neutral-700">
      {segundos > 0
        ? `Podés volver a intentar en ${minutos}:${seg.toString().padStart(2, "0")}`
        : "Ya podés volver a intentar."}
    </p>
  );
}

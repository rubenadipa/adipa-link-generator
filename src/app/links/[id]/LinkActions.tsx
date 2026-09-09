"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { EstadoEfectivoLink } from "@/lib/types";

const SLOTS_MAX = 3;

export function LinkActions({
  linkId,
  estado,
  slotsMax,
  validezDias,
}: {
  linkId: string;
  estado: EstadoEfectivoLink;
  slotsMax: number;
  validezDias: number | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [diasExtra, setDiasExtra] = useState(30);
  const [confirmarRevocar, setConfirmarRevocar] = useState(false);

  async function llamar(accion: string, path: string, body?: unknown) {
    setLoading(accion);
    try {
      await fetch(path, {
        method: accion === "revocar_device" ? "DELETE" : "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-3 space-y-3 text-sm">
      <div>
        {!confirmarRevocar ? (
          <button
            onClick={() => setConfirmarRevocar(true)}
            disabled={estado === "revocado"}
            className="w-full rounded-md border border-red-300 px-3 py-1.5 text-red-700 hover:bg-red-50 disabled:opacity-40"
          >
            Revocar link
          </button>
        ) : (
          <div className="space-y-2 rounded-md border border-red-200 bg-red-50 p-2">
            <p className="text-xs text-red-700">¿Revocar este link? Bloqueará cualquier apertura futura.</p>
            <div className="flex gap-2">
              <button
                onClick={() => llamar("revocar", `/api/links/${linkId}/revocar`)}
                disabled={loading === "revocar"}
                className="rounded-md bg-red-700 px-2 py-1 text-xs font-medium text-white hover:bg-red-800"
              >
                Confirmar
              </button>
              <button onClick={() => setConfirmarRevocar(false)} className="text-xs text-neutral-600">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <button
          onClick={() => llamar("slot", `/api/links/${linkId}/slot`)}
          disabled={loading === "slot" || slotsMax >= SLOTS_MAX || estado === "revocado"}
          className="w-full rounded-md border border-neutral-300 px-3 py-1.5 hover:bg-neutral-50 disabled:opacity-40"
        >
          {slotsMax >= SLOTS_MAX ? `Máximo de slots alcanzado (${SLOTS_MAX})` : "Sumar 1 slot extra"}
        </button>
      </div>

      <div className="rounded-md border border-neutral-200 p-2">
        <p className="text-xs text-neutral-700">
          Validez: {validezDias ? `${validezDias} días desde 1er acceso` : "permanente"}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={diasExtra}
            onChange={(e) => setDiasExtra(Number(e.target.value))}
            className="w-16 rounded-md border border-neutral-300 px-2 py-1"
          />
          <button
            onClick={() => llamar("validez", `/api/links/${linkId}/validez`, { dias: diasExtra })}
            disabled={loading === "validez" || estado === "revocado"}
            className="rounded-md border border-neutral-300 px-2 py-1 hover:bg-neutral-50 disabled:opacity-40"
          >
            Extender validez (+días)
          </button>
        </div>
      </div>
    </div>
  );
}

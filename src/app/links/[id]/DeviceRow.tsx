"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DeviceRecord } from "@/lib/types";

export function DeviceRow({ linkId, device }: { linkId: string; device: DeviceRecord }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function revocar() {
    setLoading(true);
    try {
      await fetch(`/api/links/${linkId}/dispositivos/${device.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <li className="flex items-center justify-between rounded-md border border-neutral-100 p-2 text-xs">
      <div>
        <p className="font-mono text-neutral-700">{device.fingerprint.slice(0, 12)}…</p>
        <p className="text-neutral-600">último acceso: {new Date(device.ultimoAcceso).toLocaleString("es-CL")}</p>
      </div>
      <button onClick={revocar} disabled={loading} className="text-red-600 hover:underline disabled:opacity-50">
        {loading ? "..." : "Revocar"}
      </button>
    </li>
  );
}

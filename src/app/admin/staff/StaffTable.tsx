"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StaffAccount } from "@/lib/types";

export function StaffTable({ staff, currentStaffId }: { staff: StaffAccount[]; currentStaffId: string }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function revocar(id: string) {
    setLoadingId(id);
    try {
      await fetch(`/api/admin/staff/${id}/revocar`, { method: "POST" });
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  async function cambiarTipo(id: string, tipo: "cursos" | "diplomados") {
    setLoadingId(id);
    try {
      await fetch(`/api/admin/staff/${id}/tipo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo }),
      });
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-x-auto">
    <table className="w-full min-w-[560px] text-left text-sm">
      <thead className="bg-neutral-50 text-neutral-700">
        <tr>
          <th className="px-4 py-2 font-medium">Correo</th>
          <th className="px-4 py-2 font-medium">Rol</th>
          <th className="px-4 py-2 font-medium">Tipo</th>
          <th className="px-4 py-2 font-medium">Estado</th>
          <th className="px-4 py-2 font-medium">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {staff.map((s) => (
          <tr key={s.id} className="border-t border-neutral-100">
            <td className="px-4 py-2">{s.email}</td>
            <td className="px-4 py-2 capitalize">{s.rol}</td>
            <td className="px-4 py-2">
              {s.rol === "staff" ? (
                <select
                  defaultValue={s.tipo ?? "cursos"}
                  disabled={!s.activo || loadingId === s.id}
                  onChange={(e) => cambiarTipo(s.id, e.target.value as "cursos" | "diplomados")}
                  className="rounded-md border border-neutral-300 px-1 py-0.5 text-xs"
                >
                  <option value="cursos">Cursos</option>
                  <option value="diplomados">Diplomados</option>
                </select>
              ) : (
                <span className="text-neutral-600">—</span>
              )}
            </td>
            <td className="px-4 py-2">
              {s.activo ? (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">Activo</span>
              ) : (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">Revocado</span>
              )}
            </td>
            <td className="px-4 py-2">
              {s.rol === "admin" || s.id === currentStaffId ? (
                <span className="text-neutral-600">—</span>
              ) : (
                <button
                  onClick={() => revocar(s.id)}
                  disabled={!s.activo || loadingId === s.id}
                  className="text-xs text-red-600 hover:underline disabled:opacity-40"
                >
                  Revocar
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}

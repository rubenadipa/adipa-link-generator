"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Contenido } from "@/lib/types";

export function ContenidoRow({ contenido }: { contenido: Contenido }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState(contenido.titulo);
  const [descripcion, setDescripcion] = useState(contenido.descripcion);
  const [loading, setLoading] = useState(false);

  async function guardar() {
    setLoading(true);
    try {
      await fetch(`/api/admin/catalogo/${contenido.id}/editar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descripcion }),
      });
      setEditando(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function desactivar() {
    setLoading(true);
    try {
      await fetch(`/api/admin/catalogo/${contenido.id}/desactivar`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3 text-sm">
      {editando ? (
        <div className="space-y-2">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-2 py-1"
          />
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-2 py-1"
          />
          <div className="flex gap-2">
            <button
              onClick={guardar}
              disabled={loading}
              className="rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white"
            >
              Guardar
            </button>
            <button onClick={() => setEditando(false)} className="text-xs text-neutral-600">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-neutral-900">
              {contenido.titulo}{" "}
              <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                {contenido.tipo}
              </span>
              {!contenido.activo && (
                <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">Desactivado</span>
              )}
            </p>
            <p className="text-neutral-700">{contenido.descripcion}</p>
          </div>
          <div className="flex gap-3 text-xs">
            <button onClick={() => setEditando(true)} className="text-neutral-600 hover:underline">
              Editar
            </button>
            {contenido.activo && (
              <button onClick={desactivar} disabled={loading} className="text-red-600 hover:underline">
                Desactivar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

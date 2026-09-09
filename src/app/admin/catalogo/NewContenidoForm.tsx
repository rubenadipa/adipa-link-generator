"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewContenidoForm() {
  const router = useRouter();
  const [tipo, setTipo] = useState<"curso" | "diplomado" | "seminario">("curso");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/admin/catalogo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, titulo, descripcion }),
      });
      setTitulo("");
      setDescripcion("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-end gap-3 text-sm">
      <div>
        <label className="block text-xs font-medium text-neutral-600">Tipo</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as "curso" | "diplomado" | "seminario")}
          className="mt-1 rounded-md border border-neutral-300 px-2 py-1"
        >
          <option value="curso">Curso</option>
          <option value="diplomado">Diplomado</option>
          <option value="seminario">Seminario</option>
        </select>
      </div>
      <div className="flex-1">
        <label className="block text-xs font-medium text-neutral-600">Título</label>
        <input
          required
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1"
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs font-medium text-neutral-600">Descripción</label>
        <input
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {loading ? "Agregando..." : "Agregar"}
      </button>
    </form>
  );
}

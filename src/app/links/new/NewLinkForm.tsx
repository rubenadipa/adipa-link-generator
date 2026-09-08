"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Contenido } from "@/lib/types";

export function NewLinkForm({ contenidos }: { contenidos: Contenido[] }) {
  const router = useRouter();
  const [contenidoId, setContenidoId] = useState(contenidos[0]?.id ?? "");
  const [emailAlumno, setEmailAlumno] = useState("");
  const [conValidez, setConValidez] = useState(false);
  const [validezDias, setValidezDias] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advertencia, setAdvertencia] = useState(false);
  const [resultado, setResultado] = useState<{ url: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function crear(confirmar: boolean) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contenidoId,
          emailAlumno,
          validezDias: conValidez ? validezDias : null,
          confirmar,
        }),
      });
      const data = await res.json();
      if (data.warning === "correo_ya_tiene_link_activo") {
        setAdvertencia(true);
        return;
      }
      if (!res.ok || !data.ok) {
        setError("No se pudo crear el link. Revisa los datos.");
        return;
      }
      setAdvertencia(false);
      setResultado({ url: data.url });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await crear(false);
  }

  async function handleCopy() {
    if (!resultado) return;
    await navigator.clipboard.writeText(resultado.url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (resultado) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-green-700">Link creado con éxito.</p>
        <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 p-2">
          <code className="flex-1 truncate text-xs text-neutral-700">{resultado.url}</code>
          <button
            onClick={handleCopy}
            className="rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white hover:bg-neutral-700"
          >
            {copiado ? "¡Copiado!" : "Copiar"}
          </button>
        </div>
        <div className="flex gap-3 text-sm">
          <button onClick={() => router.push("/dashboard")} className="text-neutral-600 hover:underline">
            Volver al dashboard
          </button>
          <button
            onClick={() => {
              setResultado(null);
              setEmailAlumno("");
            }}
            className="text-neutral-600 hover:underline"
          >
            Crear otro link
          </button>
        </div>
      </div>
    );
  }

  if (advertencia) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-amber-700">
          Este correo ya tiene otro link <strong>activo</strong> para el mismo contenido. ¿Igual quieres crear uno
          nuevo? (útil para reventa o reemplazo — regla 13 del brief)
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => crear(true)}
            disabled={loading}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            Crear de todas formas
          </button>
          <button onClick={() => setAdvertencia(false)} className="text-sm text-neutral-600 hover:underline">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700">Curso / diplomado</label>
        <select
          required
          value={contenidoId}
          onChange={(e) => setContenidoId(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        >
          {contenidos.length === 0 && <option value="">(sin contenidos activos en el catálogo)</option>}
          {contenidos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.titulo} ({c.tipo})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Correo del alumno</label>
        <input
          type="email"
          required
          value={emailAlumno}
          onChange={(e) => setEmailAlumno(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>

      <div className="rounded-md border border-neutral-200 p-3">
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <input type="checkbox" checked={conValidez} onChange={(e) => setConValidez(e.target.checked)} />
          Activar tiempo de validez (excepción: webinars, cursos de temporada, promos)
        </label>
        {conValidez && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span>Días de validez desde el 1er acceso:</span>
            <input
              type="number"
              min={1}
              value={validezDias}
              onChange={(e) => setValidezDias(Number(e.target.value))}
              className="w-20 rounded-md border border-neutral-300 px-2 py-1"
            />
          </div>
        )}
        {!conValidez && <p className="mt-1 text-xs text-neutral-500">Por defecto el link es permanente.</p>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || contenidos.length === 0}
        className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {loading ? "Creando..." : "Generar link"}
      </button>
    </form>
  );
}

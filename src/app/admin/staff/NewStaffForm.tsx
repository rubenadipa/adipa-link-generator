"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewStaffForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState<"cursos" | "diplomados">("cursos");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tipo, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error === "email_ya_existe" ? "Ese correo ya tiene una cuenta." : "No se pudo crear la cuenta.");
        return;
      }
      setEmail("");
      setPassword("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-end gap-3 text-sm">
      <div>
        <label className="block text-xs font-medium text-neutral-600">Correo</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 rounded-md border border-neutral-300 px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600">Tipo</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as "cursos" | "diplomados")}
          className="mt-1 rounded-md border border-neutral-300 px-2 py-1"
        >
          <option value="cursos">Cursos</option>
          <option value="diplomados">Diplomados</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600">Password inicial</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 rounded-md border border-neutral-300 px-2 py-1"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {loading ? "Creando..." : "Crear staff"}
      </button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </form>
  );
}

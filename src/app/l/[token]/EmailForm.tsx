"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EmailForm({ token }: { token: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/alumno/${token}/solicitar-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.ok) {
        router.push(`/l/${token}/otp?demo=${encodeURIComponent(data.demoOtp ?? "")}`);
        return;
      }

      if (data.error === "correo_no_autorizado") {
        router.push(`/l/${token}/error?motivo=correo`);
        return;
      }
      if (data.error === "link_no_disponible") {
        router.push(`/l/${token}/error?motivo=no_disponible`);
        return;
      }
      setError("No pudimos procesar tu solicitud. Intenta de nuevo en unos segundos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-neutral-700">Ingresá tu correo</label>
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {loading ? "Verificando..." : "Continuar"}
      </button>
    </form>
  );
}

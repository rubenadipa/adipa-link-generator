"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const RESEND_COOLDOWN_SECONDS = 30;

export function OtpForm({ token }: { token: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demoOtpInicial = searchParams.get("demo") ?? "";

  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState(demoOtpInicial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/alumno/${token}/verificar-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();

      if (data.ok) {
        router.push(`/l/${token}/dispositivo`);
        return;
      }
      if (data.error === "bloqueado") {
        router.push(`/l/${token}/error?motivo=otp_bloqueado&segundos=${data.segundosRestantes ?? 900}`);
        return;
      }
      if (data.error === "link_no_disponible") {
        router.push(`/l/${token}/error?motivo=no_disponible`);
        return;
      }
      if (data.error === "expirado") {
        setError("Tu código expiró. Solicitá uno nuevo con “reenviar código”.");
        return;
      }
      setError(`Código inválido. Te quedan ${data.intentosRestantes ?? 0} intento(s).`);
    } finally {
      setLoading(false);
    }
  }

  async function handleReenviar() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/alumno/${token}/reenviar-otp`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setDemoOtp(data.demoOtp ?? "");
        setCooldown(RESEND_COOLDOWN_SECONDS);
        return;
      }
      if (data.error === "cooldown") {
        setCooldown(data.segundosRestantes ?? RESEND_COOLDOWN_SECONDS);
        return;
      }
      if (data.error === "link_no_disponible") {
        router.push(`/l/${token}/error?motivo=no_disponible`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {demoOtp && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Modo demo — tu código es <strong>{demoOtp}</strong>
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-neutral-700">Código de 6 dígitos</label>
        <input
          required
          maxLength={6}
          inputMode="numeric"
          pattern="[0-9]{6}"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-center text-lg tracking-widest focus:border-neutral-500 focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {loading ? "Verificando..." : "Verificar"}
      </button>
      <button
        type="button"
        onClick={handleReenviar}
        disabled={loading || cooldown > 0}
        className="w-full text-xs text-neutral-700 hover:underline disabled:opacity-50"
      >
        {cooldown > 0 ? `Reenviar código (${cooldown}s)` : "Reenviar código"}
      </button>
    </form>
  );
}

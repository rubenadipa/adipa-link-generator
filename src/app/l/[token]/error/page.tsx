import { Countdown } from "./Countdown";

type Motivo = "correo" | "otp_bloqueado" | "dispositivos" | "no_disponible";

const CONTENIDO: Record<Motivo, { titulo: string; mensaje: string; cta: boolean }> = {
  // E1. Correo no autorizado.
  correo: {
    titulo: "Correo no autorizado",
    mensaje: "El correo ingresado no coincide con el asignado a este enlace.",
    cta: false,
  },
  // E2. OTP inválido / bloqueo temporal.
  otp_bloqueado: {
    titulo: "Demasiados intentos",
    mensaje: "Superaste los 3 intentos de código. Esperá el tiempo indicado antes de volver a intentar.",
    cta: false,
  },
  // E3. Límite de dispositivos alcanzado.
  dispositivos: {
    titulo: "Límite de dispositivos alcanzado",
    mensaje: "Este enlace ya está en uso en el máximo de dispositivos permitidos.",
    cta: true,
  },
  // E4. Enlace revocado o expirado (o inexistente).
  no_disponible: {
    titulo: "Enlace no disponible",
    mensaje: "Este enlace fue revocado, expiró, o no existe.",
    cta: true,
  },
};

export default async function AlumnoErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string; segundos?: string }>;
}) {
  const { motivo, segundos } = await searchParams;
  const info = CONTENIDO[(motivo as Motivo) ?? "no_disponible"] ?? CONTENIDO.no_disponible;
  const segundosRestantes = segundos ? Number(segundos) : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700">
          ✕
        </div>
        <h1 className="text-lg font-semibold text-neutral-900">{info.titulo}</h1>
        <p className="mt-2 text-sm text-neutral-500">{info.mensaje}</p>
        {segundosRestantes && <Countdown segundosIniciales={segundosRestantes} />}
        {info.cta && (
          <a
            href="mailto:soporte@adipa.cl"
            className="mt-6 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Contactar soporte
          </a>
        )}
      </div>
    </main>
  );
}

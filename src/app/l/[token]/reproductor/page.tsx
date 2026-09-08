import { redirect } from "next/navigation";
import { getAlumnoSession } from "@/lib/auth-alumno";
import { computeEstadoEfectivo, findContenidoById, findLinkByToken } from "@/lib/store";
import { Heartbeat } from "./Heartbeat";

// A5. Reproductor — valida token de sesión en cada request; el token se
// renueva solo vía heartbeat mientras esta pantalla esté activa (regla 17).
export default async function ReproductorPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const link = findLinkByToken(token);
  if (!link || computeEstadoEfectivo(link) !== "activo") {
    redirect(`/l/${token}/error?motivo=no_disponible`);
  }

  const sesion = await getAlumnoSession(token);
  if (!sesion) {
    redirect(`/l/${token}`);
  }
  if (!sesion.fpOk) {
    redirect(`/l/${token}/dispositivo`);
  }

  const contenido = findContenidoById(link.contenidoId);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Heartbeat token={token} />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-xl font-semibold">{contenido?.titulo ?? "Curso"}</h1>
        <p className="mt-1 text-sm text-neutral-400">{contenido?.descripcion}</p>
        <div className="mt-6 flex aspect-video items-center justify-center rounded-lg bg-neutral-900 text-neutral-500">
          <p className="text-sm">
            (mock v1 — el storage/CDN real de ADIPA se integra en producción, ver BRIEF &ldquo;Fuera de alcance&rdquo; #1)
          </p>
        </div>
      </div>
    </main>
  );
}

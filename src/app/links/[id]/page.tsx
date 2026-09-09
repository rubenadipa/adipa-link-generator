import { notFound, redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth-staff";
import { requireStaffLinkAccess } from "@/lib/authz";
import { computeEstadoEfectivo, findContenidoById, listDevicesForLink, listLogsForLink } from "@/lib/store";
import { Topbar } from "@/components/staff/Topbar";
import { EstadoBadge } from "@/components/staff/EstadoBadge";
import { LinkActions } from "./LinkActions";
import { DeviceRow } from "./DeviceRow";

// P4. Detalle del link — correo asignado, curso, estado, devices, logs y acciones.
export default async function LinkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getStaffSession();
  if (!session) redirect("/login");

  const acceso = await requireStaffLinkAccess(id);
  if (!acceso) notFound();

  const { link } = acceso;
  const contenido = await findContenidoById(link.contenidoId);
  const devices = await listDevicesForLink(link.id);
  const logs = await listLogsForLink(link.id);
  const estado = computeEstadoEfectivo(link);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Topbar session={session} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">{contenido?.titulo ?? "(contenido eliminado)"}</h1>
            <p className="text-sm text-neutral-700">
              Correo asignado: <span className="font-medium text-neutral-700">{link.emailAsignado}</span>
            </p>
          </div>
          <EstadoBadge estado={estado} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <section className="md:col-span-1 space-y-4">
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-neutral-900">Acciones</h2>
              <LinkActions
                linkId={link.id}
                estado={estado}
                slotsMax={link.slotsMax}
                validezDias={link.validezDias}
              />
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-neutral-900">
                Dispositivos ({devices.length}/{link.slotsMax})
              </h2>
              <ul className="mt-2 space-y-2">
                {devices.length === 0 && <li className="text-sm text-neutral-600">Sin dispositivos vinculados.</li>}
                {devices.map((d) => (
                  <DeviceRow key={d.id} linkId={link.id} device={d} />
                ))}
              </ul>
            </div>
          </section>

          <section className="md:col-span-2">
            <div className="rounded-lg border border-neutral-200 bg-white">
              <h2 className="border-b border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-900">
                Logs de acceso
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-neutral-700">
                    <tr>
                      <th className="px-4 py-2 font-medium">Fecha/hora</th>
                      <th className="px-4 py-2 font-medium">Email intentado</th>
                      <th className="px-4 py-2 font-medium">IP</th>
                      <th className="px-4 py-2 font-medium">Browser</th>
                      <th className="px-4 py-2 font-medium">País</th>
                      <th className="px-4 py-2 font-medium">Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-neutral-600">
                          Sin accesos registrados todavía.
                        </td>
                      </tr>
                    )}
                    {logs.map((log) => (
                      <tr key={log.id} className="border-t border-neutral-100">
                        <td className="px-4 py-2 whitespace-nowrap text-neutral-600">
                          {new Date(log.fechaHora).toLocaleString("es-CL")}
                        </td>
                        <td className="px-4 py-2 text-neutral-600">{log.emailIntentado}</td>
                        <td className="px-4 py-2 text-neutral-600">{log.ip}</td>
                        <td className="px-4 py-2 text-neutral-600">{log.browser}</td>
                        <td className="px-4 py-2 text-neutral-600">{log.pais}</td>
                        <td className="px-4 py-2">
                          <ResultadoBadge resultado={log.resultado} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function ResultadoBadge({ resultado }: { resultado: string }) {
  const ok = resultado === "ok";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {resultado}
    </span>
  );
}

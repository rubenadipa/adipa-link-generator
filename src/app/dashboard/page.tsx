import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth-staff";
import {
  computeEstadoEfectivo,
  findContenidoById,
  listDevicesForLink,
  listLinksForStaff,
  statsParaStaff,
} from "@/lib/store";
import { Topbar } from "@/components/staff/Topbar";
import { EstadoBadge } from "@/components/staff/EstadoBadge";

// P2. Dashboard — stats agregadas + lista paginada de links del staff.
export default async function DashboardPage() {
  const session = await getStaffSession();
  if (!session) redirect("/login");

  const stats = statsParaStaff(session.staff);
  const links = listLinksForStaff(session.staff);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Topbar session={session} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Links activos" value={stats.activos} />
          <StatCard label="Links revocados" value={stats.revocados} />
          <StatCard label="Accesos hoy" value={stats.accesos_hoy} />
          <StatCard label="Bloqueos hoy" value={stats.bloqueos_hoy} />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Links</h2>
          <Link
            href="/links/new"
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
          >
            + Crear link
          </Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-medium">Contenido</th>
                <th className="px-4 py-2 font-medium">Correo asignado</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2 font-medium">Devices</th>
                <th className="px-4 py-2 font-medium">Creado</th>
              </tr>
            </thead>
            <tbody>
              {links.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                    Todavía no hay links creados.
                  </td>
                </tr>
              )}
              {links.map((link) => {
                const contenido = findContenidoById(link.contenidoId);
                return (
                  <tr key={link.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-2">
                      <Link href={`/links/${link.id}`} className="font-medium text-neutral-900 hover:underline">
                        {contenido?.titulo ?? "(contenido eliminado)"}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-neutral-600">{link.emailAsignado}</td>
                    <td className="px-4 py-2">
                      <EstadoBadge estado={computeEstadoEfectivo(link)} />
                    </td>
                    <td className="px-4 py-2 text-neutral-600">
                      {listDevicesForLink(link.id).length}/{link.slotsMax}
                    </td>
                    <td className="px-4 py-2 text-neutral-500">
                      {new Date(link.createdAt).toLocaleDateString("es-CL")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

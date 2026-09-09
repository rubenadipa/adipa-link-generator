import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth-staff";
import { listContenidos } from "@/lib/store";
import { Topbar } from "@/components/staff/Topbar";
import { NewContenidoForm } from "./NewContenidoForm";
import { ContenidoRow } from "./ContenidoRow";

// P7. Gestionar catálogo (admin) — CRUD de cursos y diplomados.
export default async function AdminCatalogoPage() {
  const session = await getStaffSession();
  if (!session) redirect("/login");
  if (session.staff.rol !== "admin") redirect("/dashboard");

  const contenidos = listContenidos();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Topbar session={session} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-lg font-semibold text-neutral-900">Gestionar catálogo</h1>
        <p className="mt-1 text-sm text-neutral-700">
          Solo el Admin gestiona el catálogo. El staff únicamente lo lee (filtrado por su tipo) al crear un link.
        </p>

        <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Agregar contenido</h2>
          <NewContenidoForm />
        </div>

        <div className="mt-6 space-y-2">
          {contenidos.map((c) => (
            <ContenidoRow key={c.id} contenido={c} />
          ))}
        </div>
      </main>
    </div>
  );
}

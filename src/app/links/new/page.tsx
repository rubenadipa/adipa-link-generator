import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth-staff";
import { listContenidos } from "@/lib/store";
import { Topbar } from "@/components/staff/Topbar";
import { NewLinkForm } from "./NewLinkForm";

// P3. Crear link — seleccionar curso/diplomado del catálogo (P7), correo del
// alumno y validez opcional.
export default async function NewLinkPage() {
  const session = await getStaffSession();
  if (!session) redirect("/login");

  const tipo = session.staff.rol === "admin" ? null : session.staff.tipo === "cursos" ? "curso" : "diplomado";
  const contenidos = listContenidos({ soloActivos: true, tipo });

  return (
    <div className="min-h-screen bg-neutral-50">
      <Topbar session={session} />
      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-lg font-semibold text-neutral-900">Crear link protegido</h1>
        <p className="mt-1 text-sm text-neutral-500">
          El link acepta hasta 2 dispositivos por defecto. El correo asignado no se puede editar después.
        </p>
        <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
          <NewLinkForm contenidos={contenidos} />
        </div>
      </main>
    </div>
  );
}

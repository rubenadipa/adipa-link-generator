import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth-staff";
import { LoginForm } from "./LoginForm";

// P1. Login — Formulario de email + password. Redirige a P2 según rol y tipo.
export default async function LoginPage() {
  const session = await getStaffSession();
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-900">ADIPA · Enlaces protegidos</h1>
        <p className="mt-1 text-sm text-neutral-700">Acceso de staff y administración.</p>
        <LoginForm />
        <div className="mt-6 rounded-md bg-neutral-50 p-3 text-xs text-neutral-700">
          <p className="font-medium text-neutral-600">Credenciales demo (v1):</p>
          <ul className="mt-1 space-y-0.5">
            <li>Admin: ruben@adipa.cl / admin-demo-2026</li>
            <li>Staff cursos: staff.cursos@adipa.cl / cursos-demo-2026</li>
            <li>Staff diplomados: staff.diplomados@adipa.cl / diplomados-demo-2026</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

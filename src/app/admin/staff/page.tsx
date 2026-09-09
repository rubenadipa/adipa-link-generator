import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth-staff";
import { listStaff } from "@/lib/store";
import { Topbar } from "@/components/staff/Topbar";
import { StaffTable } from "./StaffTable";
import { NewStaffForm } from "./NewStaffForm";

// P6. Gestionar staff (admin) — crear / revocar / cambiar tipo.
export default async function AdminStaffPage() {
  const session = await getStaffSession();
  if (!session) redirect("/login");
  if (session.staff.rol !== "admin") redirect("/dashboard");

  const staff = await listStaff();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Topbar session={session} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-lg font-semibold text-neutral-900">Gestionar staff</h1>

        <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Crear nuevo staff</h2>
          <NewStaffForm />
        </div>

        <div className="mt-6 rounded-lg border border-neutral-200 bg-white">
          <StaffTable staff={staff} currentStaffId={session.staffId} />
        </div>
      </main>
    </div>
  );
}

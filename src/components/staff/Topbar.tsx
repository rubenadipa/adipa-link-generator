import Link from "next/link";
import type { StaffSession } from "@/lib/auth-staff";
import { LogoutButton } from "./LogoutButton";

export function Topbar({ session }: { session: StaffSession }) {
  const { staff } = session;
  const rolLabel = staff.rol === "admin" ? "Admin" : staff.tipo === "cursos" ? "Staff · Cursos" : "Staff · Diplomados";

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-semibold text-neutral-900">
            ADIPA · Enlaces
          </Link>
          <nav className="flex items-center gap-4 text-sm text-neutral-600">
            <Link href="/dashboard" className="hover:text-neutral-900">
              Dashboard
            </Link>
            <Link href="/links/new" className="hover:text-neutral-900">
              Crear link
            </Link>
            {staff.rol === "admin" && (
              <>
                <Link href="/admin/staff" className="hover:text-neutral-900">
                  Gestionar staff
                </Link>
                <Link href="/admin/catalogo" className="hover:text-neutral-900">
                  Gestionar catálogo
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-neutral-500">
            {staff.email} · <span className="font-medium text-neutral-700">{rolLabel}</span>
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

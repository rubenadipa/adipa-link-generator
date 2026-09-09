import { NextRequest, NextResponse } from "next/server";
import { requireStaffLinkAccess } from "@/lib/authz";
import { revocarLink } from "@/lib/store";

// Regla 10: el staff puede revocar el link entero sobre sus propios links.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const acceso = await requireStaffLinkAccess(id);
  if (!acceso) return NextResponse.json({ ok: false, error: "no_autorizado" }, { status: 403 });

  await revocarLink(id);
  return NextResponse.json({ ok: true });
}

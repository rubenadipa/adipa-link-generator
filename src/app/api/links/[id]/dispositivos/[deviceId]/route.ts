import { NextRequest, NextResponse } from "next/server";
import { requireStaffLinkAccess } from "@/lib/authz";
import { revocarDevice } from "@/lib/store";

// Regla 10 + 15: revocar 1 device libera el slot; el mismo fingerprint puede
// volver a registrarse después (no hay lista negra).
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; deviceId: string }> }
) {
  const { id, deviceId } = await params;
  const acceso = await requireStaffLinkAccess(id);
  if (!acceso) return NextResponse.json({ ok: false, error: "no_autorizado" }, { status: 403 });

  const revocado = await revocarDevice(id, deviceId);
  return NextResponse.json({ ok: revocado });
}

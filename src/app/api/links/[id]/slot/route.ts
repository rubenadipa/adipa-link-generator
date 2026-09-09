import { NextRequest, NextResponse } from "next/server";
import { requireStaffLinkAccess } from "@/lib/authz";
import { sumarSlot } from "@/lib/store";

// Regla 10: sumar 1 slot extra (máx 3 slots totales — ver SLOTS_MAX en store.ts).
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const acceso = await requireStaffLinkAccess(id);
  if (!acceso) return NextResponse.json({ ok: false, error: "no_autorizado" }, { status: 403 });

  const link = await sumarSlot(id);
  return NextResponse.json({ ok: true, slotsMax: link?.slotsMax });
}

import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/authz";
import { revocarStaff } from "@/lib/store";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ ok: false, error: "no_autorizado" }, { status: 403 });

  const { id } = await params;
  await revocarStaff(id);
  return NextResponse.json({ ok: true });
}

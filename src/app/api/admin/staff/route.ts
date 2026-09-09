import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/authz";
import { crearStaff, findStaffByEmail } from "@/lib/store";

// P6. Gestionar staff (admin) — crear nuevo staff (email + tipo).
export async function POST(req: NextRequest) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ ok: false, error: "no_autorizado" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const tipo = body?.tipo === "cursos" || body?.tipo === "diplomados" ? body.tipo : null;
  const password = typeof body?.password === "string" && body.password.length >= 6 ? body.password : "";

  if (!email || !tipo || !password) {
    return NextResponse.json({ ok: false, error: "faltan_datos" }, { status: 400 });
  }
  if (await findStaffByEmail(email)) {
    return NextResponse.json({ ok: false, error: "email_ya_existe" }, { status: 409 });
  }

  const staff = await crearStaff({ email, tipo, passwordPlano: password });
  return NextResponse.json({ ok: true, staffId: staff.id });
}

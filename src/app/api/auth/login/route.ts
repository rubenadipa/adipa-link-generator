import { NextRequest, NextResponse } from "next/server";
import { findStaffByEmail } from "@/lib/store";
import { setStaffCookie, signStaffToken, verifyPassword } from "@/lib/auth-staff";

// P1. Login — email + password, sin OTP (regla 16 del BRIEF).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "faltan_datos" }, { status: 400 });
  }

  const staff = await findStaffByEmail(email);
  if (!staff || !staff.activo || !verifyPassword(password, staff.passwordHash)) {
    return NextResponse.json({ ok: false, error: "credenciales_invalidas" }, { status: 401 });
  }

  const token = signStaffToken({ staffId: staff.id, rol: staff.rol, tipo: staff.tipo });
  await setStaffCookie(token);

  return NextResponse.json({ ok: true, rol: staff.rol, tipo: staff.tipo });
}

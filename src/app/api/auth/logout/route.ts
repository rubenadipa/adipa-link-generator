import { NextResponse } from "next/server";
import { clearStaffCookie } from "@/lib/auth-staff";

// P5. Logout — cierra sesión y vuelve a P1.
export async function POST() {
  await clearStaffCookie();
  return NextResponse.json({ ok: true });
}

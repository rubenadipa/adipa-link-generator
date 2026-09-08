import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth-staff";

export default async function Home() {
  const session = await getStaffSession();
  redirect(session ? "/dashboard" : "/login");
}

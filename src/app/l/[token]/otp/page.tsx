import { Suspense } from "react";
import { OtpForm } from "./OtpForm";

// A3. Ingreso de OTP — input de 6 dígitos, máximo 3 intentos, reenvío con cooldown.
export default async function OtpPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-neutral-900">Verificá tu código</h1>
        <p className="mt-1 text-sm text-neutral-700">Te enviamos un código de 6 dígitos a tu correo.</p>
        <div className="mt-6 text-left">
          <Suspense>
            <OtpForm token={token} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

import { EmailForm } from "./EmailForm";

// A1. Landing del link — pantalla mínima con logo ADIPA y campo de correo.
// No se valida el token acá para no revelar si el link existe (eso se
// resuelve al enviar el correo, en A2).
export default async function LandingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-neutral-900">ADIPA</h1>
        <p className="mt-1 text-sm text-neutral-500">Acceso protegido a tu curso.</p>
        <div className="mt-6 text-left">
          <EmailForm token={token} />
        </div>
      </div>
    </main>
  );
}

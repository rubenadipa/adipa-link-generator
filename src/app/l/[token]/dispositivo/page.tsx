import { DispositivoCheck } from "./DispositivoCheck";

// A4. Verificación de fingerprint — captura silenciosa del FP del navegador.
export default async function DispositivoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-neutral-900">Verificando tu dispositivo</h1>
        <p className="mt-1 text-sm text-neutral-700">Un momento por favor...</p>
        <DispositivoCheck token={token} />
      </div>
    </main>
  );
}

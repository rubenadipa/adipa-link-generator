import type { EstadoEfectivoLink } from "@/lib/types";

const ESTILOS: Record<EstadoEfectivoLink, string> = {
  activo: "bg-green-100 text-green-800",
  expirado: "bg-amber-100 text-amber-800",
  revocado: "bg-red-100 text-red-800",
};

const LABELS: Record<EstadoEfectivoLink, string> = {
  activo: "Activo",
  expirado: "Expirado",
  revocado: "Revocado",
};

export function EstadoBadge({ estado }: { estado: EstadoEfectivoLink }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ESTILOS[estado]}`}>
      {LABELS[estado]}
    </span>
  );
}

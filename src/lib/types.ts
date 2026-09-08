export type Rol = "admin" | "staff";
export type TipoStaff = "cursos" | "diplomados" | null;
export type TipoContenido = "curso" | "diplomado";
export type EstadoLink = "activo" | "revocado";
export type EstadoEfectivoLink = "activo" | "expirado" | "revocado";

export type ResultadoAcceso =
  | "ok"
  | "correo_no_autorizado"
  | "otp_invalido"
  | "otp_bloqueado"
  | "limite_devices"
  | "link_revocado"
  | "link_expirado"
  | "link_no_encontrado";

export interface StaffAccount {
  id: string;
  email: string;
  passwordHash: string;
  rol: Rol;
  tipo: TipoStaff;
  activo: boolean;
  createdAt: number;
}

export interface Contenido {
  id: string;
  tipo: TipoContenido;
  titulo: string;
  descripcion: string;
  activo: boolean;
  createdAt: number;
}

export interface LinkRecord {
  id: string;
  tokenPublico: string;
  contenidoId: string;
  emailAsignado: string;
  estado: EstadoLink;
  validezDias: number | null;
  primerAcceso: number | null;
  slotsMax: number;
  createdAt: number;
  createdBy: string;
}

export interface DeviceRecord {
  id: string;
  linkId: string;
  fingerprint: string;
  primerAcceso: number;
  ultimoAcceso: number;
}

export interface LogAccesoRecord {
  id: string;
  linkId: string;
  emailIntentado: string;
  ip: string;
  fechaHora: number;
  browser: string;
  pais: string;
  resultado: ResultadoAcceso;
}

export interface OtpRecord {
  linkId: string;
  codigo: string;
  expiresAt: number;
  intentosFallidos: number;
  bloqueadoHasta: number | null;
  lastSentAt: number;
}

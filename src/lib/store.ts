import bcrypt from "bcryptjs";
import { newId, newTokenPublico } from "./ids";
import type {
  Contenido,
  DeviceRecord,
  EstadoEfectivoLink,
  LinkRecord,
  LogAccesoRecord,
  OtpRecord,
  ResultadoAcceso,
  Rol,
  StaffAccount,
  TipoContenido,
  TipoStaff,
} from "./types";

/**
 * Persistencia in-memory (v1 demo) — ver BRIEF.md, "Fuera de alcance" #12.
 * Todo se pierde al reiniciar el proceso de Node. Se ancla a `globalThis`
 * para sobrevivir al hot-reload de `next dev`.
 */
interface Db {
  staff: StaffAccount[];
  contenidos: Contenido[];
  links: LinkRecord[];
  devices: DeviceRecord[];
  logs: LogAccesoRecord[];
  otps: Map<string, OtpRecord>;
}

const globalForDb = globalThis as unknown as { __adipaDb?: Db };

export const SLOTS_DEFAULT = 2;
export const SLOTS_MAX = 3;

// IDs fijos (no randomUUID) para las filas semilla: en Vercel cada instancia
// serverless corre su propio seed en memoria en un cold start distinto, así
// que un id aleatorio generado en la instancia A (ej. al hacer login) no
// existe en la instancia B que atienda la siguiente request. Fijar estos IDs
// hace que el login y el catálogo semilla sean consistentes entre instancias.
// Los links/staff/catálogo creados en vivo durante la demo NO tienen este
// arreglo — siguen sujetos a la limitación de persistencia in-memory (ver
// BRIEF.md, "Fuera de alcance" #12).
const SEED_STAFF_ADMIN_ID = "00000000-0000-4000-8000-000000000001";
const SEED_STAFF_CURSOS_ID = "00000000-0000-4000-8000-000000000002";
const SEED_STAFF_DIPLOMADOS_ID = "00000000-0000-4000-8000-000000000003";
const SEED_CONTENIDO_EXCEL_ID = "00000000-0000-4000-8000-000000000101";
const SEED_CONTENIDO_MARKETING_ID = "00000000-0000-4000-8000-000000000102";
const SEED_CONTENIDO_DIPLOMADO_ID = "00000000-0000-4000-8000-000000000103";

function seed(): Db {
  const now = Date.now();

  const staff: StaffAccount[] = [
    {
      id: SEED_STAFF_ADMIN_ID,
      email: "ruben@adipa.cl",
      passwordHash: bcrypt.hashSync("admin-demo-2026", 10),
      rol: "admin",
      tipo: null,
      activo: true,
      createdAt: now,
    },
    {
      id: SEED_STAFF_CURSOS_ID,
      email: "staff.cursos@adipa.cl",
      passwordHash: bcrypt.hashSync("cursos-demo-2026", 10),
      rol: "staff",
      tipo: "cursos",
      activo: true,
      createdAt: now,
    },
    {
      id: SEED_STAFF_DIPLOMADOS_ID,
      email: "staff.diplomados@adipa.cl",
      passwordHash: bcrypt.hashSync("diplomados-demo-2026", 10),
      rol: "staff",
      tipo: "diplomados",
      activo: true,
      createdAt: now,
    },
  ];

  const contenidos: Contenido[] = [
    {
      id: SEED_CONTENIDO_EXCEL_ID,
      tipo: "curso",
      titulo: "Excel Avanzado para Gestión",
      descripcion: "Curso de Excel orientado a análisis y reportes de gestión.",
      activo: true,
      createdAt: now,
    },
    {
      id: SEED_CONTENIDO_MARKETING_ID,
      tipo: "curso",
      titulo: "Marketing Digital 360",
      descripcion: "Fundamentos de marketing digital, redes y performance.",
      activo: true,
      createdAt: now,
    },
    {
      id: SEED_CONTENIDO_DIPLOMADO_ID,
      tipo: "diplomado",
      titulo: "Diplomado en Gestión de Proyectos",
      descripcion: "Programa integral de gestión de proyectos con metodologías ágiles.",
      activo: true,
      createdAt: now,
    },
  ];

  return {
    staff,
    contenidos,
    links: [],
    devices: [],
    logs: [],
    otps: new Map(),
  };
}

function db(): Db {
  if (!globalForDb.__adipaDb) {
    globalForDb.__adipaDb = seed();
  }
  return globalForDb.__adipaDb;
}

// ---------- Staff ----------

export function findStaffByEmail(email: string): StaffAccount | undefined {
  return db().staff.find((s) => s.email.toLowerCase() === email.toLowerCase());
}

export function findStaffById(id: string): StaffAccount | undefined {
  return db().staff.find((s) => s.id === id);
}

export function listStaff(): StaffAccount[] {
  return [...db().staff].sort((a, b) => a.createdAt - b.createdAt);
}

export function crearStaff(params: { email: string; tipo: Exclude<TipoStaff, null>; passwordPlano: string }): StaffAccount {
  const account: StaffAccount = {
    id: newId(),
    email: params.email,
    passwordHash: bcrypt.hashSync(params.passwordPlano, 10),
    rol: "staff",
    tipo: params.tipo,
    activo: true,
    createdAt: Date.now(),
  };
  db().staff.push(account);
  return account;
}

export function revocarStaff(id: string): StaffAccount | undefined {
  const s = findStaffById(id);
  if (s) s.activo = false;
  return s;
}

export function cambiarTipoStaff(id: string, tipo: Exclude<TipoStaff, null>): StaffAccount | undefined {
  const s = findStaffById(id);
  if (s && s.rol === "staff") s.tipo = tipo;
  return s;
}

// ---------- Catálogo (contenidos) ----------

export function listContenidos(filtro?: { soloActivos?: boolean; tipo?: TipoContenido | null }): Contenido[] {
  let items = [...db().contenidos];
  if (filtro?.soloActivos) items = items.filter((c) => c.activo);
  if (filtro?.tipo) items = items.filter((c) => c.tipo === filtro.tipo);
  return items.sort((a, b) => a.titulo.localeCompare(b.titulo));
}

export function findContenidoById(id: string): Contenido | undefined {
  return db().contenidos.find((c) => c.id === id);
}

export function crearContenido(params: { tipo: TipoContenido; titulo: string; descripcion: string }): Contenido {
  const contenido: Contenido = {
    id: newId(),
    tipo: params.tipo,
    titulo: params.titulo,
    descripcion: params.descripcion,
    activo: true,
    createdAt: Date.now(),
  };
  db().contenidos.push(contenido);
  return contenido;
}

export function editarContenido(id: string, params: { titulo?: string; descripcion?: string }): Contenido | undefined {
  const c = findContenidoById(id);
  if (!c) return undefined;
  if (params.titulo !== undefined) c.titulo = params.titulo;
  if (params.descripcion !== undefined) c.descripcion = params.descripcion;
  return c;
}

export function desactivarContenido(id: string): Contenido | undefined {
  const c = findContenidoById(id);
  if (c) c.activo = false;
  return c;
}

// ---------- Links ----------

export function computeEstadoEfectivo(link: LinkRecord, ahora = Date.now()): EstadoEfectivoLink {
  if (link.estado === "revocado") return "revocado";
  if (link.validezDias != null && link.primerAcceso != null) {
    const expiraEn = link.primerAcceso + link.validezDias * 24 * 60 * 60 * 1000;
    if (ahora > expiraEn) return "expirado";
  }
  return "activo";
}

export function findLinkById(id: string): LinkRecord | undefined {
  return db().links.find((l) => l.id === id);
}

export function findLinkByToken(token: string): LinkRecord | undefined {
  return db().links.find((l) => l.tokenPublico === token);
}

export function listLinksForStaff(staff: StaffAccount): LinkRecord[] {
  const items = staff.rol === "admin" ? db().links : db().links.filter((l) => findContenidoById(l.contenidoId)?.tipo === tipoStaffToContenido(staff.tipo));
  return [...items].sort((a, b) => b.createdAt - a.createdAt);
}

function tipoStaffToContenido(tipo: TipoStaff): TipoContenido | null {
  if (tipo === "cursos") return "curso";
  if (tipo === "diplomados") return "diplomado";
  return null;
}

export function puedeAccederLink(staff: StaffAccount, link: LinkRecord): boolean {
  if (staff.rol === "admin") return true;
  const contenido = findContenidoById(link.contenidoId);
  return !!contenido && contenido.tipo === tipoStaffToContenido(staff.tipo);
}

export function existeLinkActivoDuplicado(email: string, contenidoId: string): boolean {
  return db().links.some(
    (l) =>
      l.emailAsignado.toLowerCase() === email.toLowerCase() &&
      l.contenidoId === contenidoId &&
      computeEstadoEfectivo(l) === "activo"
  );
}

export function crearLink(params: {
  contenidoId: string;
  emailAlumno: string;
  validezDias: number | null;
  createdBy: string;
}): LinkRecord {
  const link: LinkRecord = {
    id: newId(),
    tokenPublico: newTokenPublico(),
    contenidoId: params.contenidoId,
    emailAsignado: params.emailAlumno,
    estado: "activo",
    validezDias: params.validezDias,
    primerAcceso: null,
    slotsMax: SLOTS_DEFAULT,
    createdAt: Date.now(),
    createdBy: params.createdBy,
  };
  db().links.push(link);
  return link;
}

export function revocarLink(id: string): LinkRecord | undefined {
  const link = findLinkById(id);
  if (link) link.estado = "revocado";
  return link;
}

export function extenderValidez(id: string, dias: number): LinkRecord | undefined {
  const link = findLinkById(id);
  if (!link) return undefined;
  link.validezDias = (link.validezDias ?? 0) + dias;
  return link;
}

export function sumarSlot(id: string): LinkRecord | undefined {
  const link = findLinkById(id);
  if (!link) return undefined;
  link.slotsMax = Math.min(SLOTS_MAX, link.slotsMax + 1);
  return link;
}

export function marcarPrimerAccesoSiCorresponde(id: string): void {
  const link = findLinkById(id);
  if (link && link.primerAcceso == null) link.primerAcceso = Date.now();
}

// ---------- Devices ----------

export function listDevicesForLink(linkId: string): DeviceRecord[] {
  return db()
    .devices.filter((d) => d.linkId === linkId)
    .sort((a, b) => a.primerAcceso - b.primerAcceso);
}

export function findDeviceByFingerprint(linkId: string, fingerprint: string): DeviceRecord | undefined {
  return db().devices.find((d) => d.linkId === linkId && d.fingerprint === fingerprint);
}

export function registrarDevice(linkId: string, fingerprint: string): DeviceRecord {
  const now = Date.now();
  const device: DeviceRecord = {
    id: newId(),
    linkId,
    fingerprint,
    primerAcceso: now,
    ultimoAcceso: now,
  };
  db().devices.push(device);
  return device;
}

export function tocarDevice(device: DeviceRecord): void {
  device.ultimoAcceso = Date.now();
}

export function revocarDevice(linkId: string, deviceId: string): boolean {
  const antes = db().devices.length;
  db().devices = db().devices.filter((d) => !(d.linkId === linkId && d.id === deviceId));
  return db().devices.length < antes;
}

// ---------- Logs de acceso ----------

export function agregarLog(entry: {
  linkId: string;
  emailIntentado: string;
  ip: string;
  browser: string;
  pais: string;
  resultado: ResultadoAcceso;
}): LogAccesoRecord {
  const log: LogAccesoRecord = {
    id: newId(),
    linkId: entry.linkId,
    emailIntentado: entry.emailIntentado,
    ip: entry.ip,
    fechaHora: Date.now(),
    browser: entry.browser,
    pais: entry.pais,
    resultado: entry.resultado,
  };
  db().logs.push(log);
  return log;
}

export function listLogsForLink(linkId: string): LogAccesoRecord[] {
  return db()
    .logs.filter((l) => l.linkId === linkId)
    .sort((a, b) => b.fechaHora - a.fechaHora);
}

// ---------- OTP ----------

export function getOtp(linkId: string): OtpRecord | undefined {
  return db().otps.get(linkId);
}

export function setOtp(linkId: string, record: OtpRecord): void {
  db().otps.set(linkId, record);
}

// ---------- Stats para el dashboard (P2) ----------

export function statsParaStaff(staff: StaffAccount) {
  const links = listLinksForStaff(staff);
  const linkIds = new Set(links.map((l) => l.id));
  const inicioHoy = new Date();
  inicioHoy.setHours(0, 0, 0, 0);
  const logsHoy = db().logs.filter((l) => linkIds.has(l.linkId) && l.fechaHora >= inicioHoy.getTime());

  const bloqueos = new Set<ResultadoAcceso>([
    "correo_no_autorizado",
    "otp_invalido",
    "otp_bloqueado",
    "limite_devices",
    "link_revocado",
    "link_expirado",
  ]);

  return {
    activos: links.filter((l) => computeEstadoEfectivo(l) === "activo").length,
    revocados: links.filter((l) => computeEstadoEfectivo(l) === "revocado").length,
    accesos_hoy: logsHoy.filter((l) => l.resultado === "ok").length,
    bloqueos_hoy: logsHoy.filter((l) => bloqueos.has(l.resultado)).length,
  };
}

export type { Rol };

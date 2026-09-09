import bcrypt from "bcryptjs";
import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "./db/client";
import { contenidos, devices, links, logs, otps, staff } from "./db/schema";
import { newId, newTokenPublico } from "./ids";
import type {
  Contenido,
  DeviceRecord,
  EstadoEfectivoLink,
  LinkRecord,
  LogAccesoRecord,
  OtpRecord,
  ResultadoAcceso,
  StaffAccount,
  TipoContenido,
  TipoStaff,
} from "./types";

export const SLOTS_DEFAULT = 2;
export const SLOTS_MAX = 3;

// IDs fijos para las filas semilla (ver migración de in-memory a Postgres):
// se insertan una sola vez, así que ya no hay problema de instancias
// serverless con datos distintos entre sí.
const SEED_STAFF_ADMIN_ID = "00000000-0000-4000-8000-000000000001";
const SEED_STAFF_CURSOS_ID = "00000000-0000-4000-8000-000000000002";
const SEED_STAFF_DIPLOMADOS_ID = "00000000-0000-4000-8000-000000000003";
const SEED_STAFF_SEMINARIOS_ID = "00000000-0000-4000-8000-000000000004";
const SEED_CONTENIDO_EXCEL_ID = "00000000-0000-4000-8000-000000000101";
const SEED_CONTENIDO_MARKETING_ID = "00000000-0000-4000-8000-000000000102";
const SEED_CONTENIDO_DIPLOMADO_ID = "00000000-0000-4000-8000-000000000103";
const SEED_CONTENIDO_SEMINARIO_ID = "00000000-0000-4000-8000-000000000104";

let seeded = false;

// Nota: no cortamos el seed temprano solo porque la tabla ya tenga filas —
// `onConflictDoNothing()` protege lo existente, así que esto también sirve
// para agregar filas semilla nuevas (ej. seminarios) a una base que ya
// estaba poblada por una versión anterior. `seeded` solo evita repetir el
// round-trip en requests posteriores de la misma instancia tibia.
async function ensureSeeded(): Promise<void> {
  if (seeded) return;

  const now = new Date();
  await db
    .insert(staff)
    .values([
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
      {
        id: SEED_STAFF_SEMINARIOS_ID,
        email: "staff.seminarios@adipa.cl",
        passwordHash: bcrypt.hashSync("seminarios-demo-2026", 10),
        rol: "staff",
        tipo: "seminarios",
        activo: true,
        createdAt: now,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(contenidos)
    .values([
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
      {
        id: SEED_CONTENIDO_SEMINARIO_ID,
        tipo: "seminario",
        titulo: "Seminario de Liderazgo y Gestión del Cambio",
        descripcion: "Jornada intensiva sobre liderazgo aplicado y gestión del cambio organizacional.",
        activo: true,
        createdAt: now,
      },
    ])
    .onConflictDoNothing();

  seeded = true;
}

function toStaffAccount(row: typeof staff.$inferSelect): StaffAccount {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    rol: row.rol as StaffAccount["rol"],
    tipo: row.tipo as TipoStaff,
    activo: row.activo,
    createdAt: row.createdAt.getTime(),
  };
}

function toContenido(row: typeof contenidos.$inferSelect): Contenido {
  return {
    id: row.id,
    tipo: row.tipo as TipoContenido,
    titulo: row.titulo,
    descripcion: row.descripcion,
    activo: row.activo,
    createdAt: row.createdAt.getTime(),
  };
}

function toLinkRecord(row: typeof links.$inferSelect): LinkRecord {
  return {
    id: row.id,
    tokenPublico: row.tokenPublico,
    contenidoId: row.contenidoId,
    emailAsignado: row.emailAsignado,
    estado: row.estado as LinkRecord["estado"],
    validezDias: row.validezDias,
    primerAcceso: row.primerAcceso ? row.primerAcceso.getTime() : null,
    slotsMax: row.slotsMax,
    createdAt: row.createdAt.getTime(),
    createdBy: row.createdBy,
  };
}

function toDeviceRecord(row: typeof devices.$inferSelect): DeviceRecord {
  return {
    id: row.id,
    linkId: row.linkId,
    fingerprint: row.fingerprint,
    primerAcceso: row.primerAcceso.getTime(),
    ultimoAcceso: row.ultimoAcceso.getTime(),
  };
}

function toLogRecord(row: typeof logs.$inferSelect): LogAccesoRecord {
  return {
    id: row.id,
    linkId: row.linkId,
    emailIntentado: row.emailIntentado,
    ip: row.ip,
    fechaHora: row.fechaHora.getTime(),
    browser: row.browser,
    pais: row.pais,
    resultado: row.resultado as ResultadoAcceso,
  };
}

function toOtpRecord(row: typeof otps.$inferSelect): OtpRecord {
  return {
    linkId: row.linkId,
    codigo: row.codigo,
    expiresAt: row.expiresAt.getTime(),
    intentosFallidos: row.intentosFallidos,
    bloqueadoHasta: row.bloqueadoHasta ? row.bloqueadoHasta.getTime() : null,
    lastSentAt: row.lastSentAt.getTime(),
  };
}

// ---------- Staff ----------

export async function findStaffByEmail(email: string): Promise<StaffAccount | undefined> {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(staff)
    .where(eq(staff.email, email.toLowerCase()))
    .limit(1);
  return rows[0] ? toStaffAccount(rows[0]) : undefined;
}

export async function findStaffById(id: string): Promise<StaffAccount | undefined> {
  await ensureSeeded();
  const rows = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
  return rows[0] ? toStaffAccount(rows[0]) : undefined;
}

export async function listStaff(): Promise<StaffAccount[]> {
  await ensureSeeded();
  const rows = await db.select().from(staff).orderBy(staff.createdAt);
  return rows.map(toStaffAccount);
}

export async function crearStaff(params: {
  email: string;
  tipo: Exclude<TipoStaff, null>;
  passwordPlano: string;
}): Promise<StaffAccount> {
  const row = {
    id: newId(),
    email: params.email.toLowerCase(),
    passwordHash: bcrypt.hashSync(params.passwordPlano, 10),
    rol: "staff" as const,
    tipo: params.tipo,
    activo: true,
    createdAt: new Date(),
  };
  await db.insert(staff).values(row);
  return toStaffAccount(row);
}

export async function revocarStaff(id: string): Promise<void> {
  await db.update(staff).set({ activo: false }).where(eq(staff.id, id));
}

export async function cambiarTipoStaff(id: string, tipo: Exclude<TipoStaff, null>): Promise<void> {
  await db.update(staff).set({ tipo }).where(and(eq(staff.id, id), eq(staff.rol, "staff")));
}

// ---------- Catálogo (contenidos) ----------

export async function listContenidos(filtro?: {
  soloActivos?: boolean;
  tipo?: TipoContenido | null;
}): Promise<Contenido[]> {
  await ensureSeeded();
  const condiciones = [];
  if (filtro?.soloActivos) condiciones.push(eq(contenidos.activo, true));
  if (filtro?.tipo) condiciones.push(eq(contenidos.tipo, filtro.tipo));

  const rows = await db
    .select()
    .from(contenidos)
    .where(condiciones.length ? and(...condiciones) : undefined)
    .orderBy(contenidos.titulo);
  return rows.map(toContenido);
}

export async function findContenidoById(id: string): Promise<Contenido | undefined> {
  await ensureSeeded();
  const rows = await db.select().from(contenidos).where(eq(contenidos.id, id)).limit(1);
  return rows[0] ? toContenido(rows[0]) : undefined;
}

export async function crearContenido(params: {
  tipo: TipoContenido;
  titulo: string;
  descripcion: string;
}): Promise<Contenido> {
  const row = {
    id: newId(),
    tipo: params.tipo,
    titulo: params.titulo,
    descripcion: params.descripcion,
    activo: true,
    createdAt: new Date(),
  };
  await db.insert(contenidos).values(row);
  return toContenido(row);
}

export async function editarContenido(
  id: string,
  params: { titulo?: string; descripcion?: string }
): Promise<Contenido | undefined> {
  const existente = await findContenidoById(id);
  if (!existente) return undefined;

  const cambios: Partial<{ titulo: string; descripcion: string }> = {};
  if (params.titulo !== undefined) cambios.titulo = params.titulo;
  if (params.descripcion !== undefined) cambios.descripcion = params.descripcion;
  if (Object.keys(cambios).length > 0) {
    await db.update(contenidos).set(cambios).where(eq(contenidos.id, id));
  }
  return { ...existente, ...cambios };
}

export async function desactivarContenido(id: string): Promise<Contenido | undefined> {
  const existente = await findContenidoById(id);
  if (!existente) return undefined;
  await db.update(contenidos).set({ activo: false }).where(eq(contenidos.id, id));
  return { ...existente, activo: false };
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

export async function findLinkById(id: string): Promise<LinkRecord | undefined> {
  const rows = await db.select().from(links).where(eq(links.id, id)).limit(1);
  return rows[0] ? toLinkRecord(rows[0]) : undefined;
}

export async function findLinkByToken(token: string): Promise<LinkRecord | undefined> {
  const rows = await db.select().from(links).where(eq(links.tokenPublico, token)).limit(1);
  return rows[0] ? toLinkRecord(rows[0]) : undefined;
}

export function tipoStaffToContenido(tipo: TipoStaff): TipoContenido | null {
  if (tipo === "cursos") return "curso";
  if (tipo === "diplomados") return "diplomado";
  if (tipo === "seminarios") return "seminario";
  return null;
}

export async function listLinksForStaff(staffAccount: StaffAccount): Promise<LinkRecord[]> {
  const rows = await db
    .select({ link: links, contenidoTipo: contenidos.tipo })
    .from(links)
    .innerJoin(contenidos, eq(links.contenidoId, contenidos.id))
    .orderBy(desc(links.createdAt));

  const items =
    staffAccount.rol === "admin"
      ? rows
      : rows.filter((r) => r.contenidoTipo === tipoStaffToContenido(staffAccount.tipo));

  return items.map((r) => toLinkRecord(r.link));
}

export async function puedeAccederLink(staffAccount: StaffAccount, link: LinkRecord): Promise<boolean> {
  if (staffAccount.rol === "admin") return true;
  const contenido = await findContenidoById(link.contenidoId);
  return !!contenido && contenido.tipo === tipoStaffToContenido(staffAccount.tipo);
}

export async function existeLinkActivoDuplicado(email: string, contenidoId: string): Promise<boolean> {
  const rows = await db
    .select()
    .from(links)
    .where(and(eq(links.emailAsignado, email), eq(links.contenidoId, contenidoId)));
  return rows.some((r) => computeEstadoEfectivo(toLinkRecord(r)) === "activo");
}

export async function crearLink(params: {
  contenidoId: string;
  emailAlumno: string;
  validezDias: number | null;
  createdBy: string;
}): Promise<LinkRecord> {
  const row = {
    id: newId(),
    tokenPublico: newTokenPublico(),
    contenidoId: params.contenidoId,
    emailAsignado: params.emailAlumno,
    estado: "activo" as const,
    validezDias: params.validezDias,
    primerAcceso: null,
    slotsMax: SLOTS_DEFAULT,
    createdAt: new Date(),
    createdBy: params.createdBy,
  };
  await db.insert(links).values(row);
  return toLinkRecord(row);
}

export async function revocarLink(id: string): Promise<void> {
  await db.update(links).set({ estado: "revocado" }).where(eq(links.id, id));
}

export async function extenderValidez(id: string, dias: number): Promise<LinkRecord | undefined> {
  const link = await findLinkById(id);
  if (!link) return undefined;
  const nuevaValidez = (link.validezDias ?? 0) + dias;
  await db.update(links).set({ validezDias: nuevaValidez }).where(eq(links.id, id));
  return { ...link, validezDias: nuevaValidez };
}

export async function sumarSlot(id: string): Promise<LinkRecord | undefined> {
  const link = await findLinkById(id);
  if (!link) return undefined;
  const nuevoSlots = Math.min(SLOTS_MAX, link.slotsMax + 1);
  await db.update(links).set({ slotsMax: nuevoSlots }).where(eq(links.id, id));
  return { ...link, slotsMax: nuevoSlots };
}

export async function marcarPrimerAccesoSiCorresponde(id: string): Promise<void> {
  const link = await findLinkById(id);
  if (link && link.primerAcceso == null) {
    await db.update(links).set({ primerAcceso: new Date() }).where(eq(links.id, id));
  }
}

// ---------- Devices ----------

export async function listDevicesForLink(linkId: string): Promise<DeviceRecord[]> {
  const rows = await db.select().from(devices).where(eq(devices.linkId, linkId)).orderBy(devices.primerAcceso);
  return rows.map(toDeviceRecord);
}

export async function findDeviceByFingerprint(
  linkId: string,
  fingerprint: string
): Promise<DeviceRecord | undefined> {
  const rows = await db
    .select()
    .from(devices)
    .where(and(eq(devices.linkId, linkId), eq(devices.fingerprint, fingerprint)))
    .limit(1);
  return rows[0] ? toDeviceRecord(rows[0]) : undefined;
}

export async function registrarDevice(linkId: string, fingerprint: string): Promise<DeviceRecord> {
  const now = new Date();
  const row = { id: newId(), linkId, fingerprint, primerAcceso: now, ultimoAcceso: now };
  await db.insert(devices).values(row);
  return toDeviceRecord(row);
}

export async function tocarDevice(device: DeviceRecord): Promise<void> {
  await db.update(devices).set({ ultimoAcceso: new Date() }).where(eq(devices.id, device.id));
}

export async function revocarDevice(linkId: string, deviceId: string): Promise<boolean> {
  const resultado = await db
    .delete(devices)
    .where(and(eq(devices.linkId, linkId), eq(devices.id, deviceId)))
    .returning({ id: devices.id });
  return resultado.length > 0;
}

// ---------- Logs de acceso ----------

export async function agregarLog(entry: {
  linkId: string;
  emailIntentado: string;
  ip: string;
  browser: string;
  pais: string;
  resultado: ResultadoAcceso;
}): Promise<void> {
  await db.insert(logs).values({
    id: newId(),
    linkId: entry.linkId,
    emailIntentado: entry.emailIntentado,
    ip: entry.ip,
    fechaHora: new Date(),
    browser: entry.browser,
    pais: entry.pais,
    resultado: entry.resultado,
  });
}

export async function listLogsForLink(linkId: string): Promise<LogAccesoRecord[]> {
  const rows = await db.select().from(logs).where(eq(logs.linkId, linkId)).orderBy(desc(logs.fechaHora));
  return rows.map(toLogRecord);
}

// ---------- OTP ----------

export async function getOtp(linkId: string): Promise<OtpRecord | undefined> {
  const rows = await db.select().from(otps).where(eq(otps.linkId, linkId)).limit(1);
  return rows[0] ? toOtpRecord(rows[0]) : undefined;
}

export async function setOtp(linkId: string, record: OtpRecord): Promise<void> {
  const row = {
    linkId,
    codigo: record.codigo,
    expiresAt: new Date(record.expiresAt),
    intentosFallidos: record.intentosFallidos,
    bloqueadoHasta: record.bloqueadoHasta ? new Date(record.bloqueadoHasta) : null,
    lastSentAt: new Date(record.lastSentAt),
  };
  await db
    .insert(otps)
    .values(row)
    .onConflictDoUpdate({
      target: otps.linkId,
      set: {
        codigo: row.codigo,
        expiresAt: row.expiresAt,
        intentosFallidos: row.intentosFallidos,
        bloqueadoHasta: row.bloqueadoHasta,
        lastSentAt: row.lastSentAt,
      },
    });
}

// ---------- Stats para el dashboard (P2) ----------

export async function statsParaStaff(staffAccount: StaffAccount) {
  const misLinks = await listLinksForStaff(staffAccount);
  const linkIds = new Set(misLinks.map((l) => l.id));

  const inicioHoy = new Date();
  inicioHoy.setHours(0, 0, 0, 0);

  const logsHoyRows = linkIds.size
    ? await db.select().from(logs).where(gte(logs.fechaHora, inicioHoy))
    : [];
  const logsHoy = logsHoyRows.map(toLogRecord).filter((l) => linkIds.has(l.linkId));

  const bloqueos = new Set<ResultadoAcceso>([
    "correo_no_autorizado",
    "otp_invalido",
    "otp_bloqueado",
    "limite_devices",
    "link_revocado",
    "link_expirado",
  ]);

  return {
    activos: misLinks.filter((l) => computeEstadoEfectivo(l) === "activo").length,
    revocados: misLinks.filter((l) => computeEstadoEfectivo(l) === "revocado").length,
    accesos_hoy: logsHoy.filter((l) => l.resultado === "ok").length,
    bloqueos_hoy: logsHoy.filter((l) => bloqueos.has(l.resultado)).length,
  };
}

import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const staff = pgTable("staff", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  rol: text("rol").notNull(), // "admin" | "staff"
  tipo: text("tipo"), // "cursos" | "diplomados" | null
  activo: boolean("activo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contenidos = pgTable("contenidos", {
  id: text("id").primaryKey(),
  tipo: text("tipo").notNull(), // "curso" | "diplomado"
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion").notNull().default(""),
  activo: boolean("activo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const links = pgTable("links", {
  id: text("id").primaryKey(),
  tokenPublico: text("token_publico").notNull().unique(),
  contenidoId: text("contenido_id")
    .notNull()
    .references(() => contenidos.id),
  emailAsignado: text("email_asignado").notNull(),
  estado: text("estado").notNull().default("activo"), // "activo" | "revocado"
  validezDias: integer("validez_dias"),
  primerAcceso: timestamp("primer_acceso", { withTimezone: true }),
  slotsMax: integer("slots_max").notNull().default(2),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: text("created_by")
    .notNull()
    .references(() => staff.id),
});

export const devices = pgTable("devices", {
  id: text("id").primaryKey(),
  linkId: text("link_id")
    .notNull()
    .references(() => links.id),
  fingerprint: text("fingerprint").notNull(),
  primerAcceso: timestamp("primer_acceso", { withTimezone: true }).notNull().defaultNow(),
  ultimoAcceso: timestamp("ultimo_acceso", { withTimezone: true }).notNull().defaultNow(),
});

export const logs = pgTable("logs", {
  id: text("id").primaryKey(),
  linkId: text("link_id")
    .notNull()
    .references(() => links.id),
  emailIntentado: text("email_intentado").notNull(),
  ip: text("ip").notNull(),
  fechaHora: timestamp("fecha_hora", { withTimezone: true }).notNull().defaultNow(),
  browser: text("browser").notNull(),
  pais: text("pais").notNull(),
  resultado: text("resultado").notNull(),
});

export const otps = pgTable("otps", {
  linkId: text("link_id")
    .primaryKey()
    .references(() => links.id),
  codigo: text("codigo").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  intentosFallidos: integer("intentos_fallidos").notNull().default(0),
  bloqueadoHasta: timestamp("bloqueado_hasta", { withTimezone: true }),
  lastSentAt: timestamp("last_sent_at", { withTimezone: true }).notNull(),
});

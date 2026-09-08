import { randomBytes, randomUUID } from "crypto";

export function newId(): string {
  return randomUUID();
}

export function newTokenPublico(): string {
  return randomBytes(16).toString("base64url");
}

export function newOtpCodigo(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

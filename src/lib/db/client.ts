import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { __adipaPool?: Pool };

function pool(): Pool {
  if (!globalForDb.__adipaPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("Falta la variable de entorno DATABASE_URL (Postgres/Neon).");
    }
    globalForDb.__adipaPool = new Pool({ connectionString });
  }
  return globalForDb.__adipaPool;
}

export const db = drizzle(pool(), { schema });

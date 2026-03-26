import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.ts";

if (!process.env.DATABASE_URL) {
  console.error("CRITICAL: DATABASE_URL is missing in environment variables!");
} else {
  console.log("DATABASE_URL is present (length):", process.env.DATABASE_URL.length);
}

export const db = drizzle(process.env.DATABASE_URL!, { schema });

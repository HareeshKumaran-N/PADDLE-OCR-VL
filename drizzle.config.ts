import fs from "fs";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/Storage/DB/recordsTableSchema.ts", 
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.HOST,     // TiDB Cloud host
    port: process.env.PORT,
    user: process.env.DB_USER,
    password: process.env.PASSWORD,
    database: "test",
    ssl: {
      ca: fs.readFileSync("./ca.pem").toString(), // PEM as string
      rejectUnauthorized: true,
    } as any, // ⚡ bypass TypeScript type mismatch
  } as any,   // ⚡ bypass Drizzle type mismatch
});
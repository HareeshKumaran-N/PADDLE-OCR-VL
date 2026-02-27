import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  // 1. Where your TypeScript schema lives
  schema: "./src/Storage/DB/recordsTableSchema.ts", 
  
  // 2. Where Drizzle will store migration files (SQL snapshots)
  out: "./drizzle",
  
  // 3. Database connection details
  dialect: "mysql", 
  dbCredentials: {
    url: process.env.MYSQL_DB_CONNECTION_STRING!,
    ssl: {
    
    },
  },
});
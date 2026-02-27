import { mysqlTable, varchar, timestamp, mysqlEnum, longtext} from "drizzle-orm/mysql-core";

export const records = mysqlTable('records', {
  // UUID used.
  id: varchar("id", { length: 36 }).primaryKey(),
  
  content: longtext().notNull(), 
  
  filetype: mysqlEnum(['pdf', 'text']),
  
  createdAt: timestamp().defaultNow(),
});
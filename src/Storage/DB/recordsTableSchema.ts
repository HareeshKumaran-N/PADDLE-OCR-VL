import { eq } from "drizzle-orm";
import { mysqlTable, varchar, timestamp, mysqlEnum, longtext } from "drizzle-orm/mysql-core";
import { drizzle } from 'drizzle-orm/tidb-serverless';

export const db = drizzle({ connection: { url: process.env.TIDB_URL } });

export const recordsTable = mysqlTable('records', {
  id: varchar("id", { length: 36 }).primaryKey(), //UUID as mySQL do not return on write.

  title: varchar("title", { length: 100 }).notNull(),

  ownerId: varchar("ownerId", { length: 255 }).notNull(),  // Clerk ID

  filename: varchar("fileName", { length: 500 }).notNull(), //custom_auto generated file name

  filetype: mysqlEnum("filetype", ['pdf']), //only pdf as of now

  status: mysqlEnum("status", [
    'pending',      // ← job pushed, worker not started
    'processing',   // ← worker picked up
    'completed',    // ← embedded into Pinecone
    'failed',       // ← something went wrong
  ]).default('pending'),

  semantic_content: longtext(), //defaults to empty, worker later will fillup
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

type RecordType = typeof recordsTable.$inferInsert;

export const updateProcessingStatusById = async (
  id: RecordType['id'],
  status: RecordType['status'],
) => {
  await db.update(recordsTable)
    .set({ status })
    .where(eq(recordsTable.id, id));
};

//
export const updateRecordById = async (
  id: RecordType['id'], 
  semantic_content: RecordType['semantic_content'], 
  status: RecordType["status"]
) => {
  const resp = await db.update(recordsTable).set({semantic_content,status}).where(eq(recordsTable.id,id));

  return resp;
}
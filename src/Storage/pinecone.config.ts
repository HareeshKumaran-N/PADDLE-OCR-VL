import { Pinecone } from '@pinecone-database/pinecone';
import z from 'zod';
import { v4 as uuidv4 } from 'uuid';
const indexName = 'dockie-kb'


export const pc_client = new Pinecone({
  apiKey: process.env.PINECONE_CLIENT_KEY || ''
});

const pc_index = pc_client.index({ name: indexName })

/*
    Virtual-Schema for Pinecone as they are structure less. 
     */



const upsert_param_schema = z.object({
  chunks: z.array(z.string().min(1)).min(1),
  sourceFileType: z.enum(['pdf', 'text']),
  sourceId: z.string().default(() => uuidv4())
});

const BATCH_SIZE = 96 // per write only 96 is the limit

export const batchedUpsert = async (data: z.infer<typeof upsert_param_schema>) => {

  const { sourceFileType, sourceId, chunks } = upsert_param_schema.parse(data)

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)

    await pc_index.upsertRecords({
      records: batch.map((chunk, j) => ({
        id: `${sourceId}-chunk-${i + j}`,
        chunk_text: chunk,
        sourceFileType,
        sourceId
      }))
    })
  }
}



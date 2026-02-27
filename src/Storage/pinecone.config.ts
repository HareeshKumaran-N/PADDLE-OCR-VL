import { Pinecone } from '@pinecone-database/pinecone';
import z from 'zod';
import { v4 as uuidv4 } from 'uuid';

const indexName='dockie-kb'


const pc_client = new Pinecone({
  apiKey: process.env.PINECONE_CLIENT_KEY || ''
});

export const pc_index = pc_client.index({name:indexName})

/*
    Virtual-Schema for Pinecone as they are structure less. 
 */

export const pc_index_schema = z.object({
    id:z.string().default(()=>uuidv4()),
    chunk_text:z.string().min(1,'chunks cannot be empty'),
    metadata:z.object({
    sourceType:z.enum(["pdf","note"]),
    sourceId:z.string().min(1,'SourceID is must')
    })
})

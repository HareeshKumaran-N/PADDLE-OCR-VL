import "dotenv/config";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { buffer } from "stream/consumers";
import { compose, type Readable } from "node:stream";
import { PDFiumLibrary } from "@hyzyla/pdfium";
import { bucketClient } from "./Storage/bucket.config.js";
import { PDFtoImages } from "./Preprocessors/PDF/Pdf_utils.js";
import { processDocument } from "./AI/textExtractor.js";
import { Worker } from "bullmq";
import z from "zod";
import { redis_connection } from "./worker/worker.config.js";
import { recordsTable, updateProcessingStatusById, updateRecordById } from "./Storage/DB/recordsTableSchema.js";

//initialze connections
import { db } from "./Storage/DB/recordsTableSchema.js";
import { pc_client, batchedUpsert } from "./Storage/pinecone.config.js";


const jobPayloadSchema = z.object({
  id: z.string(),
  filename: z.string().min(1),
  filetype: z.enum(['pdf', 'text']).default('pdf')
}
)


//Global Initializers
//Initialize the WASM engine (only do this once in your app lifecycle)
export const PDFLibraryInstance = await PDFiumLibrary.init();

type newRecord = typeof recordsTable.$inferInsert;

const worker = new Worker('file-processing', async ({ data }) => {

  try {
    console.log("ENTRY PAYLOAD",data);
    const { filename, filetype = 'pdf', id } = jobPayloadSchema.parse(data);

    console.log('Workers Started');

    //1) update the status of the record -> processing
    await updateProcessingStatusById(id, 'processing');

    //2) Get the File by Filename from Bucket
    const command = new GetObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: filename,
    });

    const response = await bucketClient.send(command);

    const downloadedData = await buffer(response.Body as Readable);


    //PDF Buffer => Pages as Image Buffer
    const imagesBuffer = await PDFtoImages(downloadedData);

    //Imaged Pages => Text Extraction page wise
    if (!imagesBuffer || !imagesBuffer.length) {
      throw new Error('No images extracted from PDF')
    }

    //3) PDF pages to images -> semantic extraction
    const { isError, errorMessage, extracted_content:semantic_content, chunks } = await processDocument(imagesBuffer);
    console.log('process doc res', {isError, errorMessage,semantic_content,chunks} );

    if (isError) {
      throw new Error(errorMessage);
    }

    //4) Record Updation - semantic_content & staus -> completed
    const TIDBResponse= await updateRecordById(id,semantic_content,"completed");

    console.log('TiDB insertion respose', TIDBResponse)

    //2) Pincode insertion
    const PCResponse = await batchedUpsert(
      {
        chunks: chunks,
        sourceFileType: filetype,
        sourceId: id,
      })



    console.log('PC insertion reponse', PCResponse);


  } catch (err) {
    console.log('...ERROR...', err);
    throw err;

  } finally {
    //cleanup 
    PDFLibraryInstance.destroy();
  }

}, {
  connection: redis_connection,
  concurrency: 2
});
import "dotenv/config";
import { bucketClient } from "./Utils/S3_Bucket/bucket.config.js";
import { GetObjectCommand} from "@aws-sdk/client-s3";
import { buffer } from "stream/consumers";
import type { Readable } from "node:stream";
import { pdfTextExtractor } from "./Utils/Preprocessors/PDF/pdf.preprocessor.js";
import fs from 'fs';

const payload = {
  filename: "Delivery challan (1).pdf",
  process: "file-to-embedings",
};

const worker = async () => {
  const command = new GetObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME,
    Key: payload.filename,
  });

  const response = await bucketClient.send(command);

  const downloadedData = await buffer(response.Body as Readable);

  fs.writeFileSync('./pdfDownload.pdf',downloadedData);

  //pdf bufferdata ->  Extracted text
  const extractedTextFromPDF = await pdfTextExtractor(downloadedData);

};

worker();

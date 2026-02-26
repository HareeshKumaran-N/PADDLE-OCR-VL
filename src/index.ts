import "dotenv/config";
import { bucketClient } from "./Utils/S3_Bucket/bucket.config.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { buffer } from "stream/consumers";
import type { Readable } from "node:stream";
import { PDFiumLibrary } from "@hyzyla/pdfium";
import { CONSOLE_LOG } from "./Utils/Utils.js";
import { PDFtoImages } from "./Utils/Preprocessors/PDF/Pdf_utils.js";
import { extractTextFromImage } from "./Utils/AI/textExtractor.js";

const payload = {
  filename: "Delivery challan (1).pdf",
  process: "file-to-embedings",
};

//Initialize the WASM engine (only do this once in your app lifecycle)
export const PDFLibraryInstance = await PDFiumLibrary.init();

const worker = async () => {

  CONSOLE_LOG('Workers Started');

  //Download File by Filename
  const command = new GetObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME,
    Key: payload.filename,
  });

  const response = await bucketClient.send(command);

  const downloadedData = await buffer(response.Body as Readable);


  //PDF Buffer => Pages as Image Buffer
  const imagesBuffer = await PDFtoImages(downloadedData);
  
  //Imaged Pages => Text Extraction page wise
  const content = imagesBuffer && await extractTextFromImage(imagesBuffer)

  CONSOLE_LOG('TEXT',content);

  //cleanup 
  PDFLibraryInstance.destroy();

};

// worker();

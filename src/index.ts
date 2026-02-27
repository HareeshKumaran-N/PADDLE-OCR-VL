import "dotenv/config";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { buffer } from "stream/consumers";
import type { Readable } from "node:stream";
import { PDFiumLibrary } from "@hyzyla/pdfium";
import { bucketClient } from "./Storage/bucket.config.js";
import { PDFtoImages } from "./Preprocessors/PDF/Pdf_utils.js";
import { extractTextFromImage } from "./AI/textExtractor.js";



const payload = {
  filename: "Delivery challan (1).pdf",
  fileType:"PDF"
};

//Initialize the WASM engine (only do this once in your app lifecycle)
export const PDFLibraryInstance = await PDFiumLibrary.init();

const worker = async () => {

  console.log('Workers Started');

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
   const textExtractorResponse = imagesBuffer && imagesBuffer.length &&  await extractTextFromImage(imagesBuffer)

  //Data insertion
  


  //cleanup 
  PDFLibraryInstance.destroy();

};

// worker();

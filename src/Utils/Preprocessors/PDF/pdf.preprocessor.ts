import fs from "fs";
import { createCanvas } from "canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";


export const pdfTextExtractor = async (pdfBuffer: Buffer) => {
  const loadingTask = (pdfjsLib as any).getDocument({ data:new Uint8Array(pdfBuffer) });
  const pdf = await loadingTask.promise;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);

    const viewport = page.getViewport({ scale: 2 });

    const canvas = createCanvas(viewport.width, viewport.height);

    await page.render({
      canvas, // ✅ use this
      viewport,
    } as any).promise;

    const imageBuffer = canvas.toBuffer("image/png");
    fs.writeFileSync(`page-${i}.png`, imageBuffer);
  }
};

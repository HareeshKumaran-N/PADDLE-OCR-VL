import { CONSOLE_LOG } from '@/Utils/Utils.js';
import { PDFiumLibrary } from '@hyzyla/pdfium';
import sharp from 'sharp';

let libraryInstance: PDFiumLibrary | null = null;

export async function getPdfEngine() {
    if (!libraryInstance) {
        libraryInstance = await PDFiumLibrary.init();
    }
    return libraryInstance;
}

export async function PDFtoImages(pdfBuffer: Buffer) {
    try {

        CONSOLE_LOG('@PDF=>images', 'Conversion Process Begins');

        const engine = await getPdfEngine();
        const document = await engine.loadDocument(pdfBuffer);

        const imageBuffers = [];

        for (const page of document.pages()) {
            const render = await page.render({ scale: 2 }); // Scale 2 is enough for Groq

            const pageBuffer = await sharp(render.data, {
                raw: { width: render.width, height: render.height, channels: 4 }
            })
                .jpeg({ quality: 75 })
                .toBuffer()

            imageBuffers.push(pageBuffer);

        }
        document.destroy();
        return imageBuffers;
    }
    catch (error) {
        CONSOLE_LOG('ERROR @Process => Images', error)
    }


}
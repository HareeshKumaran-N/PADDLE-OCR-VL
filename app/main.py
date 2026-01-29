from fastapi import FastAPI, UploadFile, File
import os
import shutil
import uuid

from ocr_engine import OCREngine

from utils import pdf_to_images

app = FastAPI(title="OCR Microservice")

UPLOAD_DIR = "/tmp/uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

ocr_engine = OCREngine()  # model loads here

@app.post("/ocr")
async def ocr_file(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, file_id + "_" + file.filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    extracted_text = ""

    if file.filename.lower().endswith(".pdf"):
        images = pdf_to_images(file_path, UPLOAD_DIR)
        for img in images:
            extracted_text += ocr_engine.extract_text(img) + "\n"
    else:
        extracted_text = ocr_engine.extract_text(file_path)

    return {
        "status": "success",
        "text": extracted_text
    }

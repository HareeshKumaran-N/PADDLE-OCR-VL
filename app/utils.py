from pdf2image import convert_from_path
import os
import uuid

def pdf_to_images(pdf_path: str, output_dir: str):
    images = convert_from_path(pdf_path)
    image_paths = []

    for img in images:
        filename = f"{uuid.uuid4()}.png"
        path = os.path.join(output_dir, filename)
        img.save(path, "PNG")
        image_paths.append(path)

    return image_paths

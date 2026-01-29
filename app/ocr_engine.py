from paddleocr import PaddleOCR
import os

class OCREngine:
    def __init__(self):
        # Load model ONCE
        self.ocr = PaddleOCR(
            use_angle_cls=True,
            lang="en",
            ocr_version="PP-OCRv4",
            structure_version="PP-StructureV2",
            show_log=False
        )

    def extract_text(self, image_path: str) -> str:
        result = self.ocr.ocr(image_path, cls=True)

        lines = []
        for page in result:
            for line in page:
                lines.append(line[1][0])

        return "\n".join(lines)

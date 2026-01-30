import os
from paddleocr import PaddleOCR

# Helps in some hosted environments (you used similar env in your API)
os.environ.setdefault("PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK", "True")

class OCREngine:
    def __init__(self, lang: str = "en", use_angle_cls: bool = True):
        self.ocr = PaddleOCR(
            use_angle_cls=use_angle_cls,
            lang=lang,
            ocr_version="PP-OCRv4",
            enable_mkldnn=False,
            show_log=False,
        )

    def extract_text(self, image_path: str) -> str:
        result = self.ocr.ocr(image_path)
        lines = []
        for page in result:
            for line in page:
                lines.append(line[1][0])
        return "\n".join(lines)
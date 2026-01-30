import os
import glob
import json
import argparse
from datetime import datetime

# PaddleOCR
from paddleocr import PaddleOCR

# To match your earlier environment tweak for hosted envs [1](https://ceslimited01-my.sharepoint.com/personal/hareeshkumaran_navaneethakrishnan_cesltd_com/Documents/Microsoft%20Copilot%20Chat%20Files/main.py)
os.environ.setdefault("PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK", "True")


IMAGE_EXTS = ("*.png", "*.jpg", "*.jpeg", "*.webp", "*.tif", "*.tiff", "*.bmp")


# -------------------------
# Simple accuracy metrics
# -------------------------
def _edit_distance(a, b):
    # Levenshtein distance (DP)
    n, m = len(a), len(b)
    dp = list(range(m + 1))
    for i in range(1, n + 1):
        prev = dp[0]
        dp[0] = i
        for j in range(1, m + 1):
            cur = dp[j]
            cost = 0 if a[i - 1] == b[j - 1] else 1
            dp[j] = min(dp[j] + 1, dp[j - 1] + 1, prev + cost)
            prev = cur
    return dp[m]


def _normalize_text(s: str) -> str:
    s = s.strip()
    s = " ".join(s.split())
    return s


def cer(reference: str, hypothesis: str) -> float:
    ref = _normalize_text(reference)
    hyp = _normalize_text(hypothesis)
    if len(ref) == 0:
        return 0.0 if len(hyp) == 0 else 1.0
    return _edit_distance(ref, hyp) / max(1, len(ref))


def wer(reference: str, hypothesis: str) -> float:
    ref_words = _normalize_text(reference).split(" ") if reference.strip() else []
    hyp_words = _normalize_text(hypothesis).split(" ") if hypothesis.strip() else []
    if len(ref_words) == 0:
        return 0.0 if len(hyp_words) == 0 else 1.0
    return _edit_distance(ref_words, hyp_words) / max(1, len(ref_words))


# -------------------------
# OCR Engine (inlined)
# -------------------------
def create_ocr(lang: str, use_angle_cls: bool) -> PaddleOCR:
    # Matches your previous config: use_angle_cls=True, PP-OCRv4, mkldnn disabled [2](https://ceslimited01-my.sharepoint.com/personal/hareeshkumaran_navaneethakrishnan_cesltd_com/Documents/Microsoft%20Copilot%20Chat%20Files/ocr_engine.py)
    return PaddleOCR(
        use_angle_cls=use_angle_cls,
        lang=lang,

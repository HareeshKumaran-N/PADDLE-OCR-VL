import os
import glob
import json
import argparse
from datetime import datetime
from paddleocr import PaddleOCR

# Matches what you used in your earlier service env setup [1](https://ceslimited01-my.sharepoint.com/personal/hareeshkumaran_navaneethakrishnan_cesltd_com/Documents/Microsoft%20Copilot%20Chat%20Files/main.py)
os.environ.setdefault("PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK", "True")

IMAGE_EXTS = ("*.png", "*.jpg", "*.jpeg", "*.webp", "*.tif", "*.tiff", "*.bmp")

# -------------------------
# Simple accuracy metrics
# -------------------------
def _edit_distance(a, b):
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
    # Mirrors your prior usage pattern: construct PaddleOCR once [2](https://ceslimited01-my.sharepoint.com/personal/hareeshkumaran_navaneethakrishnan_cesltd_com/Documents/Microsoft%20Copilot%20Chat%20Files/ocr_engine.py)
    return PaddleOCR(
        use_angle_cls=use_angle_cls,
        lang=lang,
        ocr_version="PP-OCRv4",
        enable_mkldnn=False,
        show_log=False,
    )

def extract_text(ocr: PaddleOCR, image_path: str) -> str:
    result = ocr.ocr(image_path)
    lines = []
    for page in result:
        for line in page:
            lines.append(line[1][0])
    return "\n".join(lines)


# -------------------------
# Batch helpers
# -------------------------
def list_images(samples_dir: str):
    paths = []
    for ext in IMAGE_EXTS:
        paths.extend(glob.glob(os.path.join(samples_dir, ext)))
    return sorted(paths)

def read_text_if_exists(path: str):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    return None

def write_text(path: str, text: str):
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)

def write_json(path: str, data: dict):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def run_batch(samples_dir: str, results_dir: str, lang: str, angle: bool) -> int:
    print(">>> main.py started")
    print(">>> cwd:", os.getcwd())
    print(">>> samples_dir:", samples_dir)
    print(">>> results_dir:", results_dir)

    os.makedirs(results_dir, exist_ok=True)

    images = list_images(samples_dir)
    print(f"[i] Found {len(images)} images in '{samples_dir}'")

    if not images:
        print(f"[!] No images found in '{samples_dir}'. Expected extensions: {IMAGE_EXTS}")
        print("[!] Tip: confirm images are inside the container at /workspace/samples")
        return 2

    ocr = create_ocr(lang=lang, use_angle_cls=angle)

    run_stamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    summary = {
        "run_stamp_utc": run_stamp,
        "samples_dir": samples_dir,
        "results_dir": results_dir,
        "count": len(images),
        "items": []
    }

    for img_path in images:
        base = os.path.splitext(os.path.basename(img_path))[0]
        out_txt = os.path.join(results_dir, f"{base}.ocr.txt")
        out_metrics = os.path.join(results_dir, f"{base}.metrics.json")

        print(f"[+] OCR: {img_path}")
        ocr_text = extract_text(ocr, img_path)
        write_text(out_txt, ocr_text)

        item = {"image": img_path, "ocr_txt": out_txt}

        # Optional ground truth for accuracy scoring:
        # samples/<base>.txt
        gt_path = os.path.join(samples_dir, f"{base}.txt")
        gt_text = read_text_if_exists(gt_path)
        if gt_text is not None:
            c = cer(gt_text, ocr_text)
            w = wer(gt_text, ocr_text)
            metrics = {"cer": c, "wer": w, "ground_truth": gt_path}
            write_json(out_metrics, metrics)
            item["metrics_json"] = out_metrics
            item["cer"] = c
            item["wer"] = w
            print(f"    CER={c:.4f} WER={w:.4f}")

        summary["items"].append(item)

    summary_path = os.path.join(results_dir, f"summary_{run_stamp}.json")
    write_json(summary_path, summary)
    print(f"[✓] Done. Summary written to: {summary_path}")
    return 0


def main():
    parser = argparse.ArgumentParser(description="Batch OCR runner (no API). Reads images from samples/ and writes to results/")
    parser.add_argument("--samples", default="samples", help="Folder containing images + optional <name>.txt ground truth")
    parser.add_argument("--results", default="results", help="Folder to write OCR outputs")
    parser.add_argument("--lang", default="en", help="PaddleOCR language")
    parser.add_argument("--angle", action="store_true", help="Enable angle classifier (good for rotated photos)")
    args = parser.parse_args()

    raise SystemExit(run_batch(args.samples, args.results, args.lang, args.angle))


if __name__ == "__main__":
    main()
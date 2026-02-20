FROM paddlepaddle/paddle:2.6.2

WORKDIR /workspace

# Basic runtime libs for headless OpenCV usage (often already present, but safe)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 libsm6 libxext6 libxrender1 libgl1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN python -m pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


ENV HOME=/tmp
ENV PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK=True

# Threading safety
ENV OMP_NUM_THREADS=1 \
    OPENBLAS_NUM_THREADS=1 \
    MKL_NUM_THREADS=1 \
    VECLIB_MAXIMUM_THREADS=1 \
    NUMEXPR_NUM_THREADS=1

CMD ["python", "main.py", "--samples", "samples", "--results", "results", "--angle"]
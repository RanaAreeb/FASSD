FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HF_HUB_DISABLE_SYMLINKS_WARNING=1 \
    TRANSFORMERS_CACHE=/root/.cache/huggingface \
    HF_HOME=/root/.cache/huggingface

# ffmpeg enables mp3/m4a decoding through librosa/audioread.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app/release

COPY requirements_release.txt /app/release/requirements_release.txt
RUN pip install --no-cache-dir -r /app/release/requirements_release.txt

COPY . /app/release

EXPOSE 8000

HEALTHCHECK --interval=60s --timeout=10s --start-period=180s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8000/health || exit 1

CMD ["sh", "-c", "python -c \"from app_fastapi import _warmup_inference_stack; _warmup_inference_stack(); print('Warmup complete.')\" && python -m uvicorn app_fastapi:app --host 0.0.0.0 --port 8000"]

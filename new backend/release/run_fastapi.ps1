# Start Phase 9 release FastAPI (run from release folder)
Set-Location $PSScriptRoot
if (Test-Path ".\.venv\Scripts\Activate.ps1") {
  .\.venv\Scripts\Activate.ps1
}
$env:CORS_ALLOW_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"
# Local dev: auth is optional unless you set REQUIRE_INFERENCE_AUTH=true
# $env:FIREBASE_PROJECT_ID="fassd-534e0"
# $env:INFERENCE_API_KEY="your_local_dev_secret"
$env:HF_HUB_DISABLE_SYMLINKS_WARNING = "1"
Write-Host "Preloading models + WavLM (first run downloads ~378MB from Hugging Face)..."
python -c "from app_fastapi import _warmup_inference_stack; _warmup_inference_stack(); print('Warmup complete.')"
python -m uvicorn app_fastapi:app --host 0.0.0.0 --port 8000

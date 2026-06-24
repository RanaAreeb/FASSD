# Download public case-study audio from YouTube and convert to 16 kHz mono WAV.
# Requires: pip install yt-dlp, ffmpeg on PATH (winget install Gyan.FFmpeg)
#
# Usage (from repo root):
#   powershell -File scripts/download-case-study-audio.ps1
#   python scripts/run-case-study-analysis.py

$ErrorActionPreference = "Stop"
$outDir = Join-Path $PSScriptRoot "..\public\test\case_studies"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$ffmpeg = (Get-Command ffmpeg -ErrorAction SilentlyContinue).Source
if (-not $ffmpeg) {
  $ffmpeg = Get-ChildItem -Path "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter ffmpeg.exe -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty FullName
}
if (-not $ffmpeg) {
  throw "ffmpeg not found. Install with: winget install Gyan.FFmpeg"
}

$jobs = @(
  @{ Url = "https://www.youtube.com/watch?v=FCs_zFbkf0M"; Stem = "biden_nh_robocall" },
  @{ Url = "https://www.youtube.com/watch?v=WT-2p832IMk"; Stem = "pikesville_principal" }
)

foreach ($job in $jobs) {
  $webm = Join-Path $outDir "$($job.Stem).webm"
  $wav = Join-Path $outDir "$($job.Stem).wav"
  Write-Host "Downloading $($job.Stem) ..."
  python -m yt_dlp --no-playlist -f "bestaudio" -o $webm $job.Url
  Write-Host "Converting to WAV ..."
  & $ffmpeg -y -i $webm -ar 16000 -ac 1 $wav
  Remove-Item $webm -ErrorAction SilentlyContinue
  Write-Host "Saved $wav"
}

Write-Host "Done. Run: python scripts/run-case-study-analysis.py"

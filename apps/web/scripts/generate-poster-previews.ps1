param(
  # folder with new poster exports named 001.png to 004.png
  [string]$ExportDirectory
)

$ErrorActionPreference = 'Stop'
$posterDirectory = Join-Path $PSScriptRoot '../src/lib/assets/posters'

# full files are lossless masters at native size; previews derive from them.
# near-lossless keeps the faint halftone dots that lossy webp and avif smooth away.
foreach ($poster in 1..4) {
  $full = Join-Path $posterDirectory "$poster-full.webp"
  if ($ExportDirectory) {
    $export = Join-Path (Resolve-Path $ExportDirectory) ('{0:D3}.png' -f $poster)
    bunx -p sharp-cli sharp --input $export --output $full --format webp --lossless --effort 6
    if ($LASTEXITCODE -ne 0) { throw "Lossless encoding failed for poster $poster." }
  }
  foreach ($width in @(400, 600, 800)) {
    $target = Join-Path $posterDirectory "$poster-$width.webp"
    bunx -p sharp-cli sharp --input $full --output $target --format webp --nearLossless --quality 60 --effort 6 resize $width
    if ($LASTEXITCODE -ne 0) { throw "Preview generation failed for poster $poster at $width pixels." }
  }
}

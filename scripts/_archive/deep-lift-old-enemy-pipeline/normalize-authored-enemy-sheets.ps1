Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$sourceDir = Join-Path $root 'images/deep-lift/_source/generated/authored-raw'
$outDir = Join-Path $root 'images/deep-lift'
$frameW = 128
$frameH = 128
$cols = 6

$jobs = @(
  @{
    raw='mob-spider-authored-raw.png'; out='mob-spider-authored.png'; rows=8; targetRows=24;
    map=@(0, 1,2,3,4,5,6,1,2, 1,2,3,4,5,6,1,2, 6,6,6,6, 7,7,7)
  },
  @{
    raw='mob-bone-guard-authored-raw.png'; out='mob-bone-guard-authored.png'; rows=12; targetRows=24;
    map=@(0, 1,2,3,4,5,6,1,2, 1,2,3,4,5,6,1,2, 8,9,10,8, 10,11,11)
  },
  @{
    raw='mob-deep-goblin-authored-raw.png'; out='mob-deep-goblin-authored.png'; rows=10; targetRows=24;
    map=@(0, 1,2,3,4,5,6,1,2, 1,2,3,4,5,6,1,2, 7,8,7,8, 9,9,9)
  },
  @{
    raw='boss-warden-authored-raw.png'; out='boss-warden-authored.png'; rows=8; targetRows=9;
    map=@(0, 1, 3,4,5,4, 6,7,7)
  }
)

function Convert-Magenta-To-Alpha($bmp) {
  for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
      $c = $bmp.GetPixel($x, $y)
      $isKey = $c.R -gt 210 -and $c.B -gt 180 -and $c.G -lt 100
      if ($isKey) {
        $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $c.R, $c.G, $c.B))
      }
    }
  }
}

function Get-Alpha-Bounds($bmp) {
  $minX = $bmp.Width
  $minY = $bmp.Height
  $maxX = -1
  $maxY = -1
  for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
      if ($bmp.GetPixel($x, $y).A -gt 8) {
        if ($x -lt $minX) { $minX = $x }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  if ($maxX -lt $minX -or $maxY -lt $minY) {
    return $null
  }
  return [pscustomobject]@{
    X = $minX
    Y = $minY
    W = $maxX - $minX + 1
    H = $maxY - $minY + 1
    MaxX = $maxX
    MaxY = $maxY
  }
}

function New-Normalized-Cell($src, $srcRect, $scale, $isDead) {
  $scratch = New-Object System.Drawing.Bitmap $frameW, $frameH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $scratchG = [System.Drawing.Graphics]::FromImage($scratch)
  try {
    $scratchG.Clear([System.Drawing.Color]::Transparent)
    $scratchG.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $scratchG.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $scratchG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $scratchG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $scratchG.DrawImage($src, (New-Object System.Drawing.RectangleF 0,0,$frameW,$frameH), $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  } finally {
    $scratchG.Dispose()
  }
  Convert-Magenta-To-Alpha $scratch
  $bounds = Get-Alpha-Bounds $scratch
  if ($null -eq $bounds) {
    return $scratch
  }

  $cell = New-Object System.Drawing.Bitmap $frameW, $frameH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $cellG = [System.Drawing.Graphics]::FromImage($cell)
  try {
    $cellG.Clear([System.Drawing.Color]::Transparent)
    $cellG.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $cellG.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $cellG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $cellG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    $drawW = $bounds.W * $scale
    $drawH = $bounds.H * $scale
    $dstX = ($frameW - $drawW) / 2
    if ($isDead) {
      $dstY = ($frameH - $drawH) / 2 + 4
    } else {
      $baseline = 108
      $dstY = $baseline - $drawH
      if ($dstY -lt 8) { $dstY = 8 }
    }

    $sourceRect = New-Object System.Drawing.Rectangle $bounds.X, $bounds.Y, $bounds.W, $bounds.H
    $targetRect = New-Object System.Drawing.RectangleF $dstX, $dstY, $drawW, $drawH
    $cellG.DrawImage($scratch, $targetRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
  } finally {
    $cellG.Dispose()
    $scratch.Dispose()
  }
  return $cell
}

foreach ($job in $jobs) {
  $srcPath = Join-Path $sourceDir $job.raw
  $outPath = Join-Path $outDir $job.out
  if (!(Test-Path $srcPath)) {
    throw "Missing raw generated sheet: $srcPath"
  }

  $src = [System.Drawing.Bitmap]::FromFile($srcPath)
  try {
    $dst = New-Object System.Drawing.Bitmap ($frameW * $cols), ($frameH * $job.targetRows), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $gfx = [System.Drawing.Graphics]::FromImage($dst)
    try {
      $gfx.Clear([System.Drawing.Color]::Transparent)
      $gfx.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
      $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

      $srcCellW = $src.Width / $cols
      $srcCellH = $src.Height / $job.rows

      for ($targetRow = 0; $targetRow -lt $job.targetRows; $targetRow++) {
        $sourceRow = [int]$job.map[$targetRow]
        $rowBounds = @()
        for ($col = 0; $col -lt $cols; $col++) {
          $srcRect = New-Object System.Drawing.RectangleF ($col * $srcCellW), ($sourceRow * $srcCellH), $srcCellW, $srcCellH
          $probe = New-Object System.Drawing.Bitmap $frameW, $frameH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
          $probeG = [System.Drawing.Graphics]::FromImage($probe)
          try {
            $probeG.Clear([System.Drawing.Color]::Transparent)
            $probeG.DrawImage($src, (New-Object System.Drawing.RectangleF 0,0,$frameW,$frameH), $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
          } finally {
            $probeG.Dispose()
          }
          Convert-Magenta-To-Alpha $probe
          $bounds = Get-Alpha-Bounds $probe
          if ($null -ne $bounds) { $rowBounds += $bounds }
          $probe.Dispose()
        }

        $maxW = 1
        $maxH = 1
        foreach ($bounds in $rowBounds) {
          if ($bounds.W -gt $maxW) { $maxW = $bounds.W }
          if ($bounds.H -gt $maxH) { $maxH = $bounds.H }
        }
        $scale = [Math]::Min(108 / $maxW, 104 / $maxH)
        if ($scale -gt 1.0) { $scale = 1.0 }
        $isDead = $targetRow -ge ($job.targetRows - 3)

        for ($col = 0; $col -lt $cols; $col++) {
          $srcRect = New-Object System.Drawing.RectangleF ($col * $srcCellW), ($sourceRow * $srcCellH), $srcCellW, $srcCellH
          $cell = New-Normalized-Cell $src $srcRect $scale $isDead
          try {
            $dstRect = New-Object System.Drawing.Rectangle ($col * $frameW), ($targetRow * $frameH), $frameW, $frameH
            $gfx.DrawImageUnscaled($cell, $dstRect)
          } finally {
            $cell.Dispose()
          }
        }
      }
    } finally {
      $gfx.Dispose()
    }

    Convert-Magenta-To-Alpha $dst
    $dst.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dst.Dispose()
    Write-Output "Wrote $outPath"
  } finally {
    $src.Dispose()
  }
}

Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$rawDir = Join-Path $root 'images/deep-lift/_source/generated/authored-raw/bone-guard-redo'
$outPath = Join-Path $root 'images/deep-lift/mob-bone-guard-authored.png'

$frameW = 128
$frameH = 128
$cols = 6
$rows = 24

$chunks = @{
  run = @{
    path = Join-Path $rawDir 'bone-guard-run-raw.png'
    rows = 8
    sourceRows = @(0, 1, 2, 3, 4, 5, 6, 7)
    targetRows = @(1, 2, 3, 4, 5, 6, 7, 8)
    maxW = 108
    maxH = 104
    baseline = 110
  }
  charge = @{
    path = Join-Path $rawDir 'bone-guard-charge-raw.png'
    rows = 8
    sourceRows = @(0, 1, 2, 3, 4, 5, 6, 7)
    targetRows = @(9, 10, 11, 12, 13, 14, 15, 16)
    maxW = 110
    maxH = 104
    baseline = 110
  }
  strike = @{
    path = Join-Path $rawDir 'bone-guard-strike-raw.png'
    rows = 4
    sourceRows = @(0, 1, 2, 3)
    targetRows = @(17, 18, 19, 20)
    maxW = 118
    maxH = 108
    baseline = 111
  }
  idleDead = @{
    path = Join-Path $rawDir 'bone-guard-idle-dead-raw.png'
    rows = 4
    sourceRows = @(0, 1, 2, 1)
    targetRows = @(0, 21, 22, 23)
    maxW = 114
    maxH = 104
    baseline = 110
  }
}

function Convert-Magenta-To-Alpha($bmp) {
  for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
      $c = $bmp.GetPixel($x, $y)
      $isKey = ($c.R -gt 190 -and $c.B -gt 170 -and $c.G -lt 115) -or
        ($c.R -gt 120 -and $c.B -gt 120 -and $c.G -lt 85)
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
    CenterX = ($minX + $maxX) / 2
    CenterY = ($minY + $maxY) / 2
  }
}

function Remove-Small-Alpha-Islands($bmp, [int]$minArea) {
  $visited = New-Object 'bool[,]' $bmp.Width, $bmp.Height
  $neighbors = @(
    @(-1, 0), @(1, 0), @(0, -1), @(0, 1)
  )

  for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
      if ($visited[$x, $y] -or $bmp.GetPixel($x, $y).A -le 8) {
        continue
      }

      $queue = New-Object System.Collections.Generic.Queue[object]
      $pixels = New-Object System.Collections.Generic.List[object]
      $queue.Enqueue(@($x, $y))
      $visited[$x, $y] = $true

      while ($queue.Count -gt 0) {
        $point = $queue.Dequeue()
        $px = [int]$point[0]
        $py = [int]$point[1]
        $pixels.Add(@($px, $py))

        foreach ($neighbor in $neighbors) {
          $nx = $px + [int]$neighbor[0]
          $ny = $py + [int]$neighbor[1]
          if ($nx -lt 0 -or $nx -ge $bmp.Width -or $ny -lt 0 -or $ny -ge $bmp.Height) {
            continue
          }
          if ($visited[$nx, $ny] -or $bmp.GetPixel($nx, $ny).A -le 8) {
            continue
          }
          $visited[$nx, $ny] = $true
          $queue.Enqueue(@($nx, $ny))
        }
      }

      $minX = $bmp.Width
      $minY = $bmp.Height
      $maxX = -1
      $maxY = -1
      foreach ($pixel in $pixels) {
        $px = [int]$pixel[0]
        $py = [int]$pixel[1]
        if ($px -lt $minX) { $minX = $px }
        if ($px -gt $maxX) { $maxX = $px }
        if ($py -lt $minY) { $minY = $py }
        if ($py -gt $maxY) { $maxY = $py }
      }
      $componentW = $maxX - $minX + 1
      $componentH = $maxY - $minY + 1
      $looksLikeShadow = $componentH -le 12 -and $componentW -gt 10 -and $pixels.Count -lt 700

      if ($pixels.Count -lt $minArea -or $looksLikeShadow) {
        foreach ($pixel in $pixels) {
          $bmp.SetPixel([int]$pixel[0], [int]$pixel[1], [System.Drawing.Color]::Transparent)
        }
      }
    }
  }
}

function New-Extracted-Cell($src, [int]$sourceRows, [int]$sourceRow, [int]$col) {
  $srcCellW = $src.Width / $cols
  $srcCellH = $src.Height / $sourceRows
  $srcRect = New-Object System.Drawing.RectangleF ($col * $srcCellW), ($sourceRow * $srcCellH), $srcCellW, $srcCellH
  $cell = New-Object System.Drawing.Bitmap $frameW, $frameH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [System.Drawing.Graphics]::FromImage($cell)

  try {
    $gfx.Clear([System.Drawing.Color]::Transparent)
    $gfx.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gfx.DrawImage($src, (New-Object System.Drawing.RectangleF 0,0,$frameW,$frameH), $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  } finally {
    $gfx.Dispose()
  }

  Convert-Magenta-To-Alpha $cell
  Remove-Small-Alpha-Islands $cell 180
  return $cell
}

function Get-Group-Scale($src, $chunk) {
  $maxW = 1
  $maxH = 1

  foreach ($sourceRow in $chunk.sourceRows) {
    for ($col = 0; $col -lt $cols; $col++) {
      $cell = New-Extracted-Cell $src $chunk.rows $sourceRow $col
      try {
        $bounds = Get-Alpha-Bounds $cell
        if ($null -ne $bounds) {
          if ($bounds.W -gt $maxW) { $maxW = $bounds.W }
          if ($bounds.H -gt $maxH) { $maxH = $bounds.H }
        }
      } finally {
        $cell.Dispose()
      }
    }
  }

  $scale = [Math]::Min($chunk.maxW / $maxW, $chunk.maxH / $maxH)
  if ($scale -gt 1.0) { $scale = 1.0 }
  return $scale
}

function Draw-Normalized-Cell($gfx, $src, $chunk, [int]$sourceRow, [int]$targetRow, [int]$col, [double]$scale) {
  $scratch = New-Extracted-Cell $src $chunk.rows $sourceRow $col
  try {
    $bounds = Get-Alpha-Bounds $scratch
    if ($null -eq $bounds) {
      return
    }

    $drawW = $bounds.W * $scale
    $drawH = $bounds.H * $scale
    $dstX = ($col * $frameW) + (($frameW - $drawW) / 2)

    $isDead = $targetRow -ge 21
    if ($isDead) {
      $dstY = ($targetRow * $frameH) + (($frameH - $drawH) / 2) + 3
    } else {
      $dstY = ($targetRow * $frameH) + $chunk.baseline - $drawH
      if ($dstY -lt (($targetRow * $frameH) + 7)) {
        $dstY = ($targetRow * $frameH) + 7
      }
    }

    $sourceRect = New-Object System.Drawing.Rectangle $bounds.X, $bounds.Y, $bounds.W, $bounds.H
    $targetRect = New-Object System.Drawing.RectangleF $dstX, $dstY, $drawW, $drawH
    $gfx.DrawImage($scratch, $targetRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
  } finally {
    $scratch.Dispose()
  }
}

$dst = New-Object System.Drawing.Bitmap ($frameW * $cols), ($frameH * $rows), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gfx = [System.Drawing.Graphics]::FromImage($dst)

try {
  $gfx.Clear([System.Drawing.Color]::Transparent)
  $gfx.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
  $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

  foreach ($chunkName in @('idleDead', 'run', 'charge', 'strike')) {
    $chunk = $chunks[$chunkName]
    if (!(Test-Path $chunk.path)) {
      throw "Missing raw chunk: $($chunk.path)"
    }

    $src = [System.Drawing.Bitmap]::FromFile($chunk.path)
    try {
      $scale = Get-Group-Scale $src $chunk
      Write-Output ("{0}: scale {1:N3}" -f $chunkName, $scale)

      for ($i = 0; $i -lt $chunk.sourceRows.Count; $i++) {
        $sourceRow = [int]$chunk.sourceRows[$i]
        $targetRow = [int]$chunk.targetRows[$i]
        for ($col = 0; $col -lt $cols; $col++) {
          Draw-Normalized-Cell $gfx $src $chunk $sourceRow $targetRow $col $scale
        }
      }
    } finally {
      $src.Dispose()
    }
  }
} finally {
  $gfx.Dispose()
}

Convert-Magenta-To-Alpha $dst
$dst.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$dst.Dispose()

Write-Output "Wrote $outPath"

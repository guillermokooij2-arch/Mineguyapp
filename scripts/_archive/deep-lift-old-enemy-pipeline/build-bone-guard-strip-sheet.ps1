Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$stripDir = Join-Path $root 'images/deep-lift/_source/generated/strips/bone-guard'
$outPath = Join-Path $root 'images/deep-lift/_source/generated/previews/mob-bone-guard-movement-candidate.png'
$previewPath = Join-Path $root 'images/deep-lift/_source/generated/previews/mob-bone-guard-movement-candidate-overlay.png'

$frameW = 128
$frameH = 128
$cols = 6
$rows = 24

$directionRows = @('south', 'southwest', 'west', 'northwest', 'north', 'northeast', 'east', 'southeast')
$diagonalSource = @{
  southwest = 'west'
  northwest = 'west'
  northeast = 'east'
  southeast = 'east'
}

$stateDefaults = @{
  run = @{ maxW = 108; maxH = 104; baseline = 110; dead = $false }
  charge = @{ maxW = 112; maxH = 104; baseline = 110; dead = $false }
}

$stripVisualScale = @{
  run_south = @{ x = 0.96; y = 0.96 }
  run_west = @{ x = 1.12; y = 1.42 }
  run_north = @{ x = 1.08; y = 1.15 }
  dash_south = @{ x = 0.96; y = 0.96 }
  dash_west = @{ x = 1.12; y = 1.42 }
  dash_north = @{ x = 1.08; y = 1.15 }
}

function Get-Strip-Path([string]$name) {
  return Join-Path $stripDir "$name.png"
}

function Convert-Magenta-To-Alpha($bmp) {
  for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
      $c = $bmp.GetPixel($x, $y)
      $isKey = ($c.R -gt 190 -and $c.B -gt 170 -and $c.G -lt 115) -or
        ($c.R -gt 120 -and $c.B -gt 120 -and $c.G -lt 85)
      if ($isKey) {
        $bmp.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
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
  $neighbors = @(@(-1, 0), @(1, 0), @(0, -1), @(0, 1))

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

function New-Extracted-Frame($src, [int]$frameIndex, [bool]$mirror) {
  $srcCellW = $src.Width / $cols
  $srcRect = New-Object System.Drawing.RectangleF ($frameIndex * $srcCellW), 0, $srcCellW, $src.Height
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

  if ($mirror) {
    $cell.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX)
  }

  Convert-Magenta-To-Alpha $cell
  Remove-Small-Alpha-Islands $cell 180
  return $cell
}

function Resolve-Strip([string]$stripName, [string]$fallbackName, [bool]$mirrorFallback = $false) {
  $path = Get-Strip-Path $stripName
  if (Test-Path $path) {
    return [pscustomobject]@{ Path = $path; Mirror = $false; Name = $stripName }
  }

  if ($fallbackName) {
    $fallbackPath = Get-Strip-Path $fallbackName
    if (Test-Path $fallbackPath) {
      return [pscustomobject]@{ Path = $fallbackPath; Mirror = $mirrorFallback; Name = $fallbackName }
    }
  }

  throw "Missing strip: $stripName.png"
}

function New-Row-Defs {
  $defs = New-Object System.Collections.Generic.List[object]

  # Movement-only candidate: row 0 is a run_south placeholder because the game
  # sheet format still expects 24 rows. We are not generating idle art in this pass.
  $defs.Add([pscustomobject]@{ Row = 0; State = 'run'; Strip = 'run_south'; Fallback = $null; MirrorFallback = $false })

  for ($i = 0; $i -lt $directionRows.Count; $i++) {
    $dir = $directionRows[$i]
    $sourceDir = if ($diagonalSource.ContainsKey($dir)) { $diagonalSource[$dir] } else { $dir }
    $fallback = if ($sourceDir -eq 'east') { 'run_west' } else { $null }
    $mirrorFallback = $sourceDir -eq 'east'
    $defs.Add([pscustomobject]@{ Row = 1 + $i; State = 'run'; Strip = "run_$sourceDir"; Fallback = $fallback; MirrorFallback = $mirrorFallback })
  }

  for ($i = 0; $i -lt $directionRows.Count; $i++) {
    $dir = $directionRows[$i]
    $sourceDir = if ($diagonalSource.ContainsKey($dir)) { $diagonalSource[$dir] } else { $dir }
    $fallback = if ($sourceDir -eq 'east') { 'run_west' } else { "run_$sourceDir" }
    $mirrorFallback = $sourceDir -eq 'east'
    $defs.Add([pscustomobject]@{ Row = 9 + $i; State = 'charge'; Strip = "dash_$sourceDir"; Fallback = $fallback; MirrorFallback = $mirrorFallback })
  }

  # Combat/death rows are temporary movement placeholders in this pass. They keep
  # the packed sheet structurally valid while we judge run/dash quality first.
  foreach ($entry in @(
    @{ row = 17; strip = 'dash_south'; fallback = 'run_south'; mirror = $false },
    @{ row = 18; strip = 'dash_west'; fallback = 'run_west'; mirror = $false },
    @{ row = 19; strip = 'dash_north'; fallback = 'run_north'; mirror = $false },
    @{ row = 20; strip = 'dash_east'; fallback = 'run_west'; mirror = $true }
  )) {
    $defs.Add([pscustomobject]@{ Row = $entry.row; State = 'charge'; Strip = $entry.strip; Fallback = $entry.fallback; MirrorFallback = $entry.mirror })
  }

  for ($row = 21; $row -le 23; $row++) {
    $defs.Add([pscustomobject]@{ Row = $row; State = 'run'; Strip = 'run_south'; Fallback = $null; MirrorFallback = $false })
  }

  return $defs
}

function Get-State-Scale($rowDefs, [string]$state) {
  $maxW = 1
  $maxH = 1
  foreach ($def in $rowDefs | Where-Object { $_.State -eq $state }) {
    $resolved = Resolve-Strip $def.Strip $def.Fallback $def.MirrorFallback
    $src = [System.Drawing.Bitmap]::FromFile($resolved.Path)
    try {
      for ($frame = 0; $frame -lt $cols; $frame++) {
        $cell = New-Extracted-Frame $src $frame $resolved.Mirror
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
    } finally {
      $src.Dispose()
    }
  }

  $defaults = $stateDefaults[$state]
  $scale = [Math]::Min($defaults.maxW / $maxW, $defaults.maxH / $maxH)
  if ($scale -gt 1.0) { $scale = 1.0 }
  return $scale
}

function Draw-Normalized-Frame($gfx, $src, [int]$frame, [bool]$mirror, $def, [double]$scale) {
  $defaults = $stateDefaults[$def.State]
  $scratch = New-Extracted-Frame $src $frame $mirror
  try {
    $bounds = Get-Alpha-Bounds $scratch
    if ($null -eq $bounds) {
      throw "Empty frame in $($def.Strip), frame $frame"
    }

    $visualScale = if ($stripVisualScale.ContainsKey($def.Strip)) { $stripVisualScale[$def.Strip] } elseif ($stripVisualScale.ContainsKey($def.Fallback)) { $stripVisualScale[$def.Fallback] } else { @{ x = 1; y = 1 } }
    $drawW = $bounds.W * $scale * $visualScale.x
    $drawH = $bounds.H * $scale * $visualScale.y
    $dstX = ($frame * $frameW) + (($frameW - $drawW) / 2)

    if ($defaults.dead) {
      $dstY = ($def.Row * $frameH) + (($frameH - $drawH) / 2) + 3
    } else {
      $dstY = ($def.Row * $frameH) + $defaults.baseline - $drawH
      if ($dstY -lt (($def.Row * $frameH) + 7)) {
        $dstY = ($def.Row * $frameH) + 7
      }
    }

    $sourceRect = New-Object System.Drawing.Rectangle $bounds.X, $bounds.Y, $bounds.W, $bounds.H
    $targetRect = New-Object System.Drawing.RectangleF $dstX, $dstY, $drawW, $drawH
    $gfx.DrawImage($scratch, $targetRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
  } finally {
    $scratch.Dispose()
  }
}

function Test-Final-Sheet($path) {
  $bmp = [System.Drawing.Bitmap]::FromFile($path)
  try {
    $edgePixels = 0
    $emptyFrames = 0
    foreach ($row in 0..($rows - 1)) {
      foreach ($col in 0..($cols - 1)) {
        $hasContent = $false
        for ($y = 0; $y -lt $frameH; $y++) {
          for ($x = 0; $x -lt $frameW; $x++) {
            $px = $bmp.GetPixel(($col * $frameW) + $x, ($row * $frameH) + $y)
            if ($px.A -gt 8) {
              $hasContent = $true
              if ($x -eq 0 -or $x -eq ($frameW - 1) -or $y -eq 0 -or $y -eq ($frameH - 1)) {
                $edgePixels++
              }
            }
          }
        }
        if (!$hasContent) { $emptyFrames++ }
      }
    }

    Write-Output "validate: dimensions=$($bmp.Width)x$($bmp.Height) edgeAlphaPixels=$edgePixels emptyFrames=$emptyFrames"
  } finally {
    $bmp.Dispose()
  }
}

function Write-Preview($sheetPath, $previewPath) {
  $previewDir = Split-Path -Parent $previewPath
  New-Item -ItemType Directory -Force -Path $previewDir | Out-Null

  $src = [System.Drawing.Bitmap]::FromFile($sheetPath)
  $preview = New-Object System.Drawing.Bitmap $src.Width, $src.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [System.Drawing.Graphics]::FromImage($preview)
  try {
    $gfx.Clear([System.Drawing.Color]::FromArgb(255, 18, 18, 18))
    $gfx.DrawImageUnscaled($src, 0, 0)

    $gridPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(120, 255, 255, 255)), 1
    $baselinePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(190, 0, 210, 255)), 1
    $centerPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(180, 255, 210, 0)), 1
    try {
      for ($x = 0; $x -le $src.Width; $x += $frameW) {
        $gfx.DrawLine($gridPen, $x, 0, $x, $src.Height)
      }
      for ($y = 0; $y -le $src.Height; $y += $frameH) {
        $gfx.DrawLine($gridPen, 0, $y, $src.Width, $y)
      }
      for ($row = 0; $row -lt $rows; $row++) {
        $gfx.DrawLine($baselinePen, 0, ($row * $frameH) + 110, $src.Width, ($row * $frameH) + 110)
      }
      for ($col = 0; $col -lt $cols; $col++) {
        $gfx.DrawLine($centerPen, ($col * $frameW) + 64, 0, ($col * $frameW) + 64, $src.Height)
      }
    } finally {
      $gridPen.Dispose()
      $baselinePen.Dispose()
      $centerPen.Dispose()
    }
  } finally {
    $gfx.Dispose()
    $src.Dispose()
  }

  $preview.Save($previewPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $preview.Dispose()
}

$rowDefs = New-Row-Defs
$requiredStrips = $rowDefs | ForEach-Object { Resolve-Strip $_.Strip $_.Fallback $_.MirrorFallback } | Select-Object -ExpandProperty Path -Unique
Write-Output "using $($requiredStrips.Count) source strips from $stripDir"
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $outPath) | Out-Null

$stateScales = @{}
foreach ($state in @('run', 'charge')) {
  $stateScales[$state] = Get-State-Scale $rowDefs $state
  Write-Output ("scale[{0}]={1:N3}" -f $state, $stateScales[$state])
}

$dst = New-Object System.Drawing.Bitmap ($frameW * $cols), ($frameH * $rows), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gfx = [System.Drawing.Graphics]::FromImage($dst)

try {
  $gfx.Clear([System.Drawing.Color]::Transparent)
  $gfx.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
  $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

  foreach ($def in $rowDefs) {
    $resolved = Resolve-Strip $def.Strip $def.Fallback $def.MirrorFallback
    $src = [System.Drawing.Bitmap]::FromFile($resolved.Path)
    try {
      for ($frame = 0; $frame -lt $cols; $frame++) {
        Draw-Normalized-Frame $gfx $src $frame $resolved.Mirror $def $stateScales[$def.State]
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

Write-Output "wrote: $outPath"
Test-Final-Sheet $outPath
Write-Preview $outPath $previewPath
Write-Output "preview: $previewPath"

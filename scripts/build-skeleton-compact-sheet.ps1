Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;

public sealed class SkeletonBounds {
  public int X;
  public int Y;
  public int W;
  public int H;
  public int MaxX;
  public int MaxY;
  public int Area;
  public bool Empty;
}

public static class SkeletonBitmapUtil {
  static bool IsKeyGreen(Color c) {
    return c.G > 35 && (c.G - c.R) > 12 && (c.G - c.B) > 12;
  }

  public static void ConvertKeyGreenToAlpha(Bitmap bmp) {
    for (int y = 0; y < bmp.Height; y++) {
      for (int x = 0; x < bmp.Width; x++) {
        Color c = bmp.GetPixel(x, y);
        if (IsKeyGreen(c)) {
          bmp.SetPixel(x, y, Color.FromArgb(0, c.R, c.G, c.B));
        }
      }
    }
  }

  public static SkeletonBounds GetAlphaBounds(Bitmap bmp) {
    int minX = bmp.Width;
    int minY = bmp.Height;
    int maxX = -1;
    int maxY = -1;
    for (int y = 0; y < bmp.Height; y++) {
      for (int x = 0; x < bmp.Width; x++) {
        if (bmp.GetPixel(x, y).A > 8) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < minX || maxY < minY) {
      return new SkeletonBounds { Empty = true };
    }
    return new SkeletonBounds {
      X = minX,
      Y = minY,
      W = maxX - minX + 1,
      H = maxY - minY + 1,
      MaxX = maxX,
      MaxY = maxY,
      Area = 0,
      Empty = false
    };
  }

  public static SkeletonBounds[] FindComponents(Bitmap bmp, int minArea) {
    bool[,] visited = new bool[bmp.Width, bmp.Height];
    System.Collections.Generic.List<SkeletonBounds> found = new System.Collections.Generic.List<SkeletonBounds>();
    int[] dx = new int[] { -1, 1, 0, 0 };
    int[] dy = new int[] { 0, 0, -1, 1 };

    for (int y = 0; y < bmp.Height; y++) {
      for (int x = 0; x < bmp.Width; x++) {
        if (visited[x, y] || bmp.GetPixel(x, y).A <= 8) continue;

        int minX = x;
        int minY = y;
        int maxX = x;
        int maxY = y;
        int area = 0;
        System.Collections.Generic.Queue<int> q = new System.Collections.Generic.Queue<int>();
        q.Enqueue(y * bmp.Width + x);
        visited[x, y] = true;

        while (q.Count > 0) {
          int p = q.Dequeue();
          int px = p % bmp.Width;
          int py = p / bmp.Width;
          area++;
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;

          for (int i = 0; i < 4; i++) {
            int nx = px + dx[i];
            int ny = py + dy[i];
            if (nx < 0 || nx >= bmp.Width || ny < 0 || ny >= bmp.Height) continue;
            if (visited[nx, ny] || bmp.GetPixel(nx, ny).A <= 8) continue;
            visited[nx, ny] = true;
            q.Enqueue(ny * bmp.Width + nx);
          }
        }

        if (area >= minArea) {
          found.Add(new SkeletonBounds {
            X = minX,
            Y = minY,
            W = maxX - minX + 1,
            H = maxY - minY + 1,
            MaxX = maxX,
            MaxY = maxY,
            Area = area,
            Empty = false
          });
        }
      }
    }

    return found.ToArray();
  }
}
'@

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$actorDir = Join-Path $root 'images/deep-lift/dungeon1/actors/skeleton'
$sourceDir = Join-Path $actorDir '_source'
$outPath = Join-Path $actorDir 'skeleton-animations.png'
$previewPath = Join-Path $sourceDir 'skeleton-animations-preview.png'

$frameW = 128
$frameH = 128
$sheetCols = 3
$sheetRows = 27
$baseline = 116

$jobs = @(
  @{ state='run'; path=(Join-Path $sourceDir 'skeleton-run-raw.png'); cols=3; rows=8; targetRow=0; frames=3; maxW=116; maxH=110; baseline=$baseline; dead=$false; gridCrop=$false },
  @{ state='charge'; path=(Join-Path $sourceDir 'skeleton-charge-raw.png'); cols=3; rows=8; targetRow=8; frames=3; maxW=118; maxH=110; baseline=$baseline; dead=$false; gridCrop=$true },
  @{ state='strike'; path=(Join-Path $sourceDir 'skeleton-strike-raw.png'); cols=2; rows=8; targetRow=16; frames=2; maxW=120; maxH=112; baseline=$baseline; dead=$false; gridCrop=$false },
  @{ state='dead'; path=(Join-Path $sourceDir 'skeleton-death-raw.png'); cols=3; rows=1; targetRow=24; frames=1; maxW=118; maxH=76; baseline=0; dead=$true; gridCrop=$false }
)

function Test-KeyGreen($c) {
  return $c.G -gt 120 -and $c.R -lt 115 -and $c.B -lt 115 -and ($c.G - $c.R) -gt 55 -and ($c.G - $c.B) -gt 55
}

function Convert-KeyGreen-To-Alpha($bmp) {
  [SkeletonBitmapUtil]::ConvertKeyGreenToAlpha($bmp)
}

function Get-Alpha-Bounds($bmp) {
  $bounds = [SkeletonBitmapUtil]::GetAlphaBounds($bmp)
  if ($bounds.Empty) { return $null }
  return $bounds
}

function New-Source-Cell($src, $job, [int]$row, [int]$col) {
  $cellW = $src.Width / $job.cols
  $cellH = $src.Height / $job.rows
  $srcRect = New-Object System.Drawing.RectangleF ($col * $cellW), ($row * $cellH), $cellW, $cellH
  $cell = New-Object System.Drawing.Bitmap ([Math]::Ceiling($cellW)), ([Math]::Ceiling($cellH)), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [System.Drawing.Graphics]::FromImage($cell)

  try {
    $gfx.Clear([System.Drawing.Color]::Transparent)
    $gfx.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gfx.DrawImage($src, (New-Object System.Drawing.RectangleF 0, 0, $cell.Width, $cell.Height), $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  } finally {
    $gfx.Dispose()
  }

  Convert-KeyGreen-To-Alpha $cell
  return $cell
}

function Get-Job-Scale($src, $job) {
  $maxW = 1
  $maxH = 1

  for ($row = 0; $row -lt $job.rows; $row++) {
    for ($col = 0; $col -lt $job.cols; $col++) {
      $cell = New-Source-Cell $src $job $row $col
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

  return [Math]::Min($job.maxW / $maxW, $job.maxH / $maxH)
}

function Get-Component-Grid($src, $job) {
  $minArea = if ($job.dead) { 180 } else { 120 }
  $components = @([SkeletonBitmapUtil]::FindComponents($src, $minArea))
  $grid = @()
  for ($row = 0; $row -lt $job.rows; $row++) {
    $rowItems = @()
    for ($col = 0; $col -lt $job.cols; $col++) {
      $rowItems += $null
    }
    $grid += ,$rowItems
  }

  foreach ($component in $components) {
    $cx = $component.X + ($component.W / 2)
    $cy = $component.Y + ($component.H / 2)
    $col = [Math]::Min($job.cols - 1, [Math]::Max(0, [int][Math]::Floor($cx / ($src.Width / $job.cols))))
    $row = [Math]::Min($job.rows - 1, [Math]::Max(0, [int][Math]::Floor($cy / ($src.Height / $job.rows))))
    $existing = $grid[$row][$col]
    if ($null -eq $existing) {
      $grid[$row][$col] = [pscustomobject]@{
        X = $component.X
        Y = $component.Y
        W = $component.W
        H = $component.H
        MaxX = $component.MaxX
        MaxY = $component.MaxY
        Area = $component.Area
      }
    } else {
      $minX = [Math]::Min($existing.X, $component.X)
      $minY = [Math]::Min($existing.Y, $component.Y)
      $maxX = [Math]::Max($existing.MaxX, $component.MaxX)
      $maxY = [Math]::Max($existing.MaxY, $component.MaxY)
      $grid[$row][$col] = [pscustomobject]@{
        X = $minX
        Y = $minY
        W = $maxX - $minX + 1
        H = $maxY - $minY + 1
        MaxX = $maxX
        MaxY = $maxY
        Area = $existing.Area + $component.Area
      }
    }
  }

  $missing = @()
  for ($row = 0; $row -lt $job.rows; $row++) {
    for ($col = 0; $col -lt $job.cols; $col++) {
      if ($null -eq $grid[$row][$col]) {
        $replacement = $null
        for ($offset = 1; $offset -lt $job.rows; $offset++) {
          $prev = $row - $offset
          $next = $row + $offset
          if ($prev -ge 0 -and $null -ne $grid[$prev][$col]) {
            $replacement = $grid[$prev][$col]
            break
          }
          if ($next -lt $job.rows -and $null -ne $grid[$next][$col]) {
            $replacement = $grid[$next][$col]
            break
          }
        }
        if ($null -ne $replacement) {
          $grid[$row][$col] = $replacement
          $missing += "r$row/c$col->fallback"
        } else {
          $missing += "r$row/c$col->empty"
        }
      }
    }
  }
  if ($missing.Count) {
    Write-Warning "Filled missing actor content for $($job.state): $($missing -join ', ')"
  }

  return ,$grid
}

function New-Argb-Bitmap-FromFile([string]$path) {
  $loaded = [System.Drawing.Bitmap]::FromFile($path)
  $copy = New-Object System.Drawing.Bitmap $loaded.Width, $loaded.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [System.Drawing.Graphics]::FromImage($copy)
  try {
    $gfx.Clear([System.Drawing.Color]::Transparent)
    $gfx.DrawImageUnscaled($loaded, 0, 0)
  } finally {
    $gfx.Dispose()
    $loaded.Dispose()
  }
  return $copy
}

function Get-Component-Scale($grid, $job) {
  $maxW = 1
  $maxH = 1
  foreach ($row in $grid) {
    foreach ($bounds in $row) {
      if ($bounds.W -gt $maxW) { $maxW = $bounds.W }
      if ($bounds.H -gt $maxH) { $maxH = $bounds.H }
    }
  }

  return [Math]::Min($job.maxW / $maxW, $job.maxH / $maxH)
}

function Draw-Normalized-Component($gfx, $src, $job, $bounds, [int]$targetRow, [int]$targetCol, [double]$scale) {
  $drawW = $bounds.W * $scale
  $drawH = $bounds.H * $scale
  $dstX = ($targetCol * $frameW) + (($frameW - $drawW) / 2)
  if ($job.dead) {
    $dstY = ($targetRow * $frameH) + (($frameH - $drawH) / 2) + 8
  } else {
    $dstY = ($targetRow * $frameH) + $job.baseline - $drawH
    if ($dstY -lt (($targetRow * $frameH) + 4)) {
      $dstY = ($targetRow * $frameH) + 4
    }
  }

  $srcCrop = New-Object System.Drawing.Rectangle $bounds.X, $bounds.Y, $bounds.W, $bounds.H
  $dstRect = New-Object System.Drawing.RectangleF $dstX, $dstY, $drawW, $drawH
  $gfx.DrawImage($src, $dstRect, $srcCrop, [System.Drawing.GraphicsUnit]::Pixel)
}

function Draw-Normalized-Cell($gfx, $src, $job, [int]$sourceRow, [int]$sourceCol, [int]$targetRow, [int]$targetCol, [double]$scale) {
  $cell = New-Source-Cell $src $job $sourceRow $sourceCol
  try {
    $bounds = Get-Alpha-Bounds $cell
    if ($null -eq $bounds) {
      return
    }

    $drawW = $bounds.W * $scale
    $drawH = $bounds.H * $scale
    $dstX = ($targetCol * $frameW) + (($frameW - $drawW) / 2)
    if ($job.dead) {
      $dstY = ($targetRow * $frameH) + (($frameH - $drawH) / 2) + 8
    } else {
      $dstY = ($targetRow * $frameH) + $job.baseline - $drawH
      if ($dstY -lt (($targetRow * $frameH) + 4)) {
        $dstY = ($targetRow * $frameH) + 4
      }
    }

    $srcCrop = New-Object System.Drawing.Rectangle $bounds.X, $bounds.Y, $bounds.W, $bounds.H
    $dstRect = New-Object System.Drawing.RectangleF $dstX, $dstY, $drawW, $drawH
    $gfx.DrawImage($cell, $dstRect, $srcCrop, [System.Drawing.GraphicsUnit]::Pixel)
  } finally {
    $cell.Dispose()
  }
}

function Test-Final-Sheet($path) {
  $bmp = [System.Drawing.Bitmap]::FromFile($path)
  try {
    $edgePixels = 0
    $emptyCells = 0
    for ($row = 0; $row -lt $sheetRows; $row++) {
      for ($col = 0; $col -lt $sheetCols; $col++) {
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
        if (!$hasContent) { $emptyCells++ }
      }
    }

    Write-Output "validate: dimensions=$($bmp.Width)x$($bmp.Height) rows=$sheetRows cols=$sheetCols edgeAlphaPixels=$edgePixels emptyCells=$emptyCells"
  } finally {
    $bmp.Dispose()
  }
}

function Write-Preview($sheetPath, $previewPath) {
  $src = [System.Drawing.Bitmap]::FromFile($sheetPath)
  $preview = New-Object System.Drawing.Bitmap $src.Width, $src.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [System.Drawing.Graphics]::FromImage($preview)

  try {
    $gfx.Clear([System.Drawing.Color]::FromArgb(255, 18, 18, 18))
    $gfx.DrawImageUnscaled($src, 0, 0)
    $gridPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(110, 255, 255, 255)), 1
    $baselinePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(160, 0, 210, 255)), 1
    try {
      for ($x = 0; $x -le $src.Width; $x += $frameW) {
        $gfx.DrawLine($gridPen, $x, 0, $x, $src.Height)
      }
      for ($y = 0; $y -le $src.Height; $y += $frameH) {
        $gfx.DrawLine($gridPen, 0, $y, $src.Width, $y)
      }
      for ($row = 0; $row -lt $sheetRows; $row++) {
        $gfx.DrawLine($baselinePen, 0, ($row * $frameH) + $baseline, $src.Width, ($row * $frameH) + $baseline)
      }
    } finally {
      $gridPen.Dispose()
      $baselinePen.Dispose()
    }
  } finally {
    $gfx.Dispose()
    $src.Dispose()
  }

  $preview.Save($previewPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $preview.Dispose()
}

foreach ($job in $jobs) {
  if (!(Test-Path $job.path)) {
    throw "Missing source sheet: $($job.path)"
  }
}

New-Item -ItemType Directory -Force -Path $actorDir | Out-Null
New-Item -ItemType Directory -Force -Path $sourceDir | Out-Null

$sheet = New-Object System.Drawing.Bitmap ($frameW * $sheetCols), ($frameH * $sheetRows), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gfx = [System.Drawing.Graphics]::FromImage($sheet)

try {
  $gfx.Clear([System.Drawing.Color]::Transparent)
  $gfx.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
  $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

  foreach ($job in $jobs) {
    $src = New-Argb-Bitmap-FromFile $job.path
    try {
      if ($job.gridCrop) {
        $scale = Get-Job-Scale $src $job
        Write-Output ("{0}: scale={1:N3} grid-crop source={2}x{3}" -f $job.state, $scale, $src.Width, $src.Height)
        for ($row = 0; $row -lt $job.rows; $row++) {
          for ($col = 0; $col -lt $job.frames; $col++) {
            Draw-Normalized-Cell $gfx $src $job $row $col ($job.targetRow + $row) $col $scale
          }
        }
      } else {
        Convert-KeyGreen-To-Alpha $src
        $grid = Get-Component-Grid $src $job
        $scale = Get-Component-Scale $grid $job
        $componentCount = ($grid | ForEach-Object { $_.Count } | Measure-Object -Sum).Sum
        Write-Output ("{0}: scale={1:N3} components={2} source={3}x{4}" -f $job.state, $scale, $componentCount, $src.Width, $src.Height)
        if ($job.dead) {
          for ($col = 0; $col -lt 3; $col++) {
            Draw-Normalized-Component $gfx $src $job $grid[0][$col] ($job.targetRow + $col) 0 $scale
          }
        } else {
          for ($row = 0; $row -lt 8; $row++) {
            for ($col = 0; $col -lt $job.frames; $col++) {
              Draw-Normalized-Component $gfx $src $job $grid[$row][$col] ($job.targetRow + $row) $col $scale
            }
          }
        }
      }
    } finally {
      $src.Dispose()
    }
  }
} finally {
  $gfx.Dispose()
}

$sheet.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$sheet.Dispose()

Write-Output "wrote: $outPath"
Test-Final-Sheet $outPath
Write-Preview $outPath $previewPath
Write-Output "preview: $previewPath"

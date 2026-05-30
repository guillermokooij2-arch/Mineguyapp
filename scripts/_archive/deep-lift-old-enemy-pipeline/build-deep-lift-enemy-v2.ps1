Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

Write-Warning 'This script only creates mechanical placeholder v2 sheets from the old rotated enemy art. Do not use these as final authored enemy animations. See images/deep-lift/_source/ENEMY_ANIMATION_SHEET_SPEC.md for the real player-quality authored sheet contract.'

$root = Split-Path -Parent $PSScriptRoot
$assetDir = Join-Path $root 'images/deep-lift'
$frameW = 128
$frameH = 128
$cols = 6
$dirs = @(
  @{x=0.0;y=1.0},
  @{x=-0.707;y=0.707},
  @{x=-1.0;y=0.0},
  @{x=-0.707;y=-0.707},
  @{x=0.0;y=-1.0},
  @{x=0.707;y=-0.707},
  @{x=1.0;y=0.0},
  @{x=0.707;y=0.707}
)

$actors = @(
  @{src='mob-spider.png';dst='mob-spider-v2.png'},
  @{src='mob-bone-guard.png';dst='mob-bone-guard-v2.png'},
  @{src='mob-deep-goblin.png';dst='mob-deep-goblin-v2.png'},
  @{src='boss-warden.png';dst='boss-warden-v2.png'}
)

$newStates = @('idle','run','backwalk','charge','strike','shoot','hurt','dead')
$sourceState = @{
  idle=0
  run=1
  backwalk=1
  charge=2
  strike=2
  shoot=2
  hurt=3
  dead=4
}

function Get-FrameIndex($state, $frame) {
  if ($state -eq 'backwalk') { return 5 - $frame }
  return $frame
}

function Get-StateMotion($state, $frame, $dir) {
  $forward = $dirs[$dir]
  $amount = 0.0
  $scaleX = 1.0
  $scaleY = 1.0

  if ($state -eq 'run') {
    $amount = @(0, 2, 4, 2, -1, 1)[$frame]
    $scaleY = @(1.0, 0.98, 1.02, 1.0, 0.99, 1.01)[$frame]
  } elseif ($state -eq 'backwalk') {
    $amount = @(0, -1, -3, -2, 1, -1)[$frame]
    $scaleY = @(1.0, 0.99, 1.01, 1.0, 0.99, 1.0)[$frame]
  } elseif ($state -eq 'charge') {
    $amount = @(0, 4, 8, 10, 6, 2)[$frame]
    $scaleX = @(1.0, 1.02, 1.05, 1.06, 1.03, 1.0)[$frame]
    $scaleY = @(1.0, 0.99, 0.96, 0.95, 0.98, 1.0)[$frame]
  } elseif ($state -eq 'strike' -or $state -eq 'shoot') {
    $amount = @(0, 3, 7, 5, 1, -1)[$frame]
    $scaleX = @(1.0, 1.02, 1.06, 1.04, 1.0, 0.99)[$frame]
    $scaleY = @(1.0, 0.99, 0.97, 0.98, 1.0, 1.0)[$frame]
  } elseif ($state -eq 'hurt') {
    $amount = @(0, -2, -4, -2, 0, 1)[$frame]
  }

  return @{
    x = $forward.x * $amount
    y = $forward.y * $amount
    scaleX = $scaleX
    scaleY = $scaleY
  }
}

foreach ($actor in $actors) {
  $srcPath = Join-Path $assetDir $actor.src
  $dstPath = Join-Path $assetDir $actor.dst
  $src = [System.Drawing.Bitmap]::FromFile($srcPath)
  try {
    $dst = New-Object System.Drawing.Bitmap ($frameW * $cols), ($frameH * $newStates.Count * 8), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $gfx = [System.Drawing.Graphics]::FromImage($dst)
    try {
      $gfx.Clear([System.Drawing.Color]::Transparent)
      $gfx.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
      $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

      for ($stateIndex = 0; $stateIndex -lt $newStates.Count; $stateIndex++) {
        $state = $newStates[$stateIndex]
        $oldState = $sourceState[$state]
        for ($dir = 0; $dir -lt 8; $dir++) {
          for ($frame = 0; $frame -lt $cols; $frame++) {
            $srcFrame = Get-FrameIndex $state $frame
            $srcRect = New-Object System.Drawing.Rectangle ($srcFrame * $frameW), (($oldState * 8 + $dir) * $frameH), $frameW, $frameH
            $dstBaseX = $frame * $frameW
            $dstBaseY = ($stateIndex * 8 + $dir) * $frameH

            if ($state -eq 'dead') {
              $deadW = 112 + [Math]::Min(10, $frame * 2)
              $deadH = 48 + [Math]::Min(12, $frame * 2)
              $deadX = $dstBaseX + (($frameW - $deadW) / 2)
              $deadY = $dstBaseY + 56 + [Math]::Min(12, $frame * 2)
              $dstRect = New-Object System.Drawing.RectangleF $deadX, $deadY, $deadW, $deadH
            } else {
              $motion = Get-StateMotion $state $frame $dir
              $drawW = $frameW * $motion.scaleX
              $drawH = $frameH * $motion.scaleY
              $drawX = $dstBaseX + (($frameW - $drawW) / 2) + $motion.x
              $drawY = $dstBaseY + (($frameH - $drawH) / 2) + $motion.y
              $dstRect = New-Object System.Drawing.RectangleF $drawX, $drawY, $drawW, $drawH
            }

            $gfx.DrawImage($src, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
          }
        }
      }
    } finally {
      $gfx.Dispose()
    }
    $dst.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dst.Dispose()
    Write-Output "Wrote $dstPath"
  } finally {
    $src.Dispose()
  }
}

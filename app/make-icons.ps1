# Draws the Small Plates app icons: two plates, S and P, on cobalt.
#   powershell -ExecutionPolicy Bypass -File app\make-icons.ps1
#   powershell -ExecutionPolicy Bypass -File app\make-icons.ps1 -Dot "#ff5d3a"   (adds the studio dot)
# Shapes are laid out on a 120-unit grid, the same as the design mockups, and scaled to each size.
param([string]$Dot = "")

Add-Type -AssemblyName System.Drawing
$out = Join-Path $PSScriptRoot "icons"

function Hex([string]$hex) { [System.Drawing.ColorTranslator]::FromHtml($hex) }
function Brush([string]$hex) { New-Object System.Drawing.SolidBrush (Hex $hex) }

# Grid helpers. $script:unit is pixels per grid unit; $script:zoom shrinks the artwork toward the center.
function ScalePos([double]$x) { (60 + ($x - 60) * $script:zoom) * $script:unit }
function ScaleLen([double]$len) { $len * $script:zoom * $script:unit }
function Disc($g, $brush, [double]$x, [double]$y, [double]$radius) {
  $cx = ScalePos $x; $cy = ScalePos $y; $rad = ScaleLen $radius
  $g.FillEllipse($brush, [single]($cx - $rad), [single]($cy - $rad), [single](2 * $rad), [single](2 * $rad))
}
function Ring($g, [string]$hex, [double]$x, [double]$y, [double]$radius, [double]$width) {
  $pen = New-Object System.Drawing.Pen (Hex $hex), ([single](ScaleLen $width))
  $cx = ScalePos $x; $cy = ScalePos $y; $rad = ScaleLen $radius
  $g.DrawEllipse($pen, [single]($cx - $rad), [single]($cy - $rad), [single](2 * $rad), [single](2 * $rad))
}

function Draw-Icon([int]$size, [string]$name, [bool]$rounded, [double]$zoom) {
  $script:unit = $size / 120.0
  $script:zoom = $zoom
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.TextRenderingHint = 'AntiAliasGridFit'
  $g.Clear([System.Drawing.Color]::Transparent)

  # Background: rounded for the plain icon, full-bleed where the phone applies its own mask.
  $bg = Brush "#2c5aa0"
  if ($rounded) {
    $d = 52 * $script:unit
    $shape = New-Object System.Drawing.Drawing2D.GraphicsPath
    $shape.AddArc(0, 0, $d, $d, 180, 90)
    $shape.AddArc($size - $d, 0, $d, $d, 270, 90)
    $shape.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
    $shape.AddArc(0, $size - $d, $d, $d, 90, 90)
    $shape.CloseFigure()
    $g.FillPath($bg, $shape)
  } else {
    $g.FillRectangle($bg, 0, 0, $size, $size)
  }

  Disc $g (Brush "#3567b0") 60 58 44

  $font = New-Object System.Drawing.Font 'Arial Black', ([single](ScaleLen 25)), ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = 'Center'; $fmt.LineAlignment = 'Center'
  $plates = @(
    @{ x = 40; y = 55; rim = "#c2412d"; letter = "S" },
    @{ x = 80; y = 65; rim = "#4c7a26"; letter = "P" }
  )
  foreach ($plate in $plates) {
    Disc $g (Brush "#1d3f75") $plate.x ($plate.y + 3) 25
    Disc $g (Brush "#fdfdfb") $plate.x $plate.y 25
    Ring $g $plate.rim $plate.x $plate.y 20 2.5
    $half = ScaleLen 25
    $box = New-Object System.Drawing.RectangleF ([single]((ScalePos $plate.x) - $half)), ([single]((ScalePos $plate.y) - $half + (ScaleLen 1.5))), ([single](2 * $half)), ([single](2 * $half))
    $g.DrawString($plate.letter, $font, (Brush "#1d2433"), $box, $fmt)
  }

  if ($Dot) { Disc $g (Brush $Dot) 97 99 7 }

  $bmp.Save((Join-Path $out $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

Draw-Icon 512 'icon-512.png' $true 1.0
Draw-Icon 192 'icon-192.png' $true 1.0
Draw-Icon 64 'favicon.png' $true 1.0
# iOS rounds the corners itself and turns transparency black, so this one is full-bleed.
Draw-Icon 180 'apple-touch-icon.png' $false 1.0
# Android's maskable icon: artwork shrunk to stay inside the circle the phone may crop to.
Draw-Icon 512 'maskable-512.png' $false 0.8
Get-ChildItem $out -Filter *.png | Select-Object Name, Length

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const inputPath = path.join(__dirname, '..', 'public', 'icons', 'julius-stock-source.jpg')
const outputDir = path.join(__dirname, '..', 'public', 'icons')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

async function generate() {
  const source = sharp(inputPath)
    .extract({ left: 1840, top: 260, width: 2600, height: 2600 })
    .modulate({ saturation: 1.08, brightness: 1.03 })
    .sharpen({ sigma: 0.6 })

  await source
    .clone()
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, 'icon-source.png'))

  for (const size of sizes) {
    await source
      .clone()
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}.png`))
    console.log(`Generated icon-${size}.png`)
  }
}

generate()

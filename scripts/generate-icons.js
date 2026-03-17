const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const inputPath = path.join(__dirname, '..', 'public', 'favicon.svg')
const outputDir = path.join(__dirname, '..', 'public', 'icons')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

async function generate() {
  for (const size of sizes) {
    await sharp(inputPath)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}.png`))
    console.log(`Generated icon-${size}.png`)
  }
}

generate()

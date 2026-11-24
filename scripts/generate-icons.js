
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const source = 'image/rb-avatar_v2.svg'
const output = 'public/icons'

await mkdir(output, { recursive: true })

const sizes = [180, 192, 512]

for (const size of sizes) {
  await sharp(source)
    .resize(size, size)
    .png()
    .toFile(`${output}/rb-icon-${size}.png`)

  console.log(`Izveidota ${size}x${size} ikona`)
}

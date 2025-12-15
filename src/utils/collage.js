// src/utils/collage.js
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

async function createCollage(imageBuffers, watermarkText = 't.me/antiquar_WORLD') {
  const images = [];
  for (const buffer of imageBuffers) {
    const img = await Jimp.read(buffer);
    images.push(img);
  }

  const count = images.length;
  const size = 700; // размер итогового коллажа
  const collage = new Jimp(size, size, '#ffffff');

  // определяем сетку
  let cols, rows;
  if (count === 1) { cols = 1; rows = 1; }
  else if (count === 2) { cols = 2; rows = 1; }
  else if (count <= 4) { cols = 2; rows = 2; }
  else { cols = 3; rows = 2; }

  // ⚙️ настройки отступов
  const gap = 10; // px — расстояние между фото
  const cellWidth = Math.floor((size - (cols + 1) * gap) / cols);
  const cellHeight = Math.floor((size - (rows + 1) * gap) / rows);

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    // “object-fit: cover” — обрезаем фото под квадрат
    images[i].cover(cellWidth, cellHeight);

    // вычисляем позицию с отступом
    const x = gap + col * (cellWidth + gap);
    const y = gap + row * (cellHeight + gap);

    collage.composite(images[i], x, y);
  }

  // добавляем watermark
  const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
  collage.print(font, 10, size - 30, watermarkText);

  // сохраняем результат
  const outputDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `collage_${Date.now()}.jpg`);

  await collage.quality(90).writeAsync(outputPath);
  return outputPath;
}

module.exports = createCollage;

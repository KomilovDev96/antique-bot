// src/utils/watermark.js
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

async function addWatermark(buffer, watermarkText = 't.me/antikvaruzbekistan') {
  const image = await Jimp.read(buffer);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);

  // ⚙️ Отступы и позиция (левый верхний угол)
  const margin = 10;
  const textWidth = Jimp.measureText(font, watermarkText);
  const textHeight = Jimp.measureTextHeight(font, watermarkText, image.bitmap.width);

  // 🔲 Полупрозрачный фон под текстом
  const box = new Jimp(textWidth + 20, textHeight + 10, 0x00000080); // 80 — прозрачность (50%)
  image.composite(box, margin - 5, margin - 5); // левый верхний угол
  image.print(font, margin + 5, margin, watermarkText); // сам текст

  // 💾 Сохраняем готовое изображение
  const outputDir = path.join(__dirname, '../../uploads/watermarked');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `wm_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`);
  await image.quality(90).writeAsync(outputPath);

  return outputPath;
}

module.exports = addWatermark;

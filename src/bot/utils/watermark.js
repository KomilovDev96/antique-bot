const sharp = require('sharp');

const addWatermark = async (imageBuffer) => {
  try {
    const watermarkBuffer = await sharp("assets/watermark.png")
      .resize(100) // adjust size as needed
      .toBuffer();

    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    const watermarkedImageBuffer = await image
      .composite([
        {
          input: watermarkBuffer,
          gravity: "southeast", // Position in the bottom right corner
        },
      ])
      .toBuffer();

    return watermarkedImageBuffer;
  } catch (error) {
    // console.error("Error adding watermark:", error);
    // Возвращаем оригинальное изображение, если водяной знак не может быть добавлен
    return imageBuffer;
  }
};

module.exports = addWatermark;



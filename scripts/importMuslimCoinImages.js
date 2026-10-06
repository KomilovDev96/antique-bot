#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CoinCatalog = require('../src/models/CoinCatalog');

const root = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(root, 'env.local') });
const outputRoot = path.join(root, 'uploads/catalog/muslim-world/dynasties');

const searches = {
  umayyads: 'Umayyad silver dirham coin',
  abbasids: 'Abbasid silver dirham coin',
  samanids: 'Samanid silver dirham coin',
  'bukhara-emirate': 'Bukhara Emirate silver tenga coin',
  'khiva-khanate': 'Khiva Khanate silver coin',
  'kokand-khanate': 'Kokand silver tenga coin',
  ottomans: 'Ottoman silver coin',
  safavids: 'Safavid silver coin',
  qajars: 'Qajar silver coin',
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function findImages(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=4&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json`;
  const response = await fetch(url, { headers: { 'User-Agent': 'AntiqueAI/1.0 (catalog research)' } });
  if (!response.ok) return [];
  const data = await response.json();
  return Object.values(data.query?.pages || {}).map(page => page.imageinfo?.[0]?.thumburl).filter(Boolean).slice(0, 2);
}

async function main() {
  fs.mkdirSync(outputRoot, { recursive: true });
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/antikBot');
  const catalog = await CoinCatalog.findOne({ slug: 'muslim-world' });
  if (!catalog) throw new Error('Каталог muslim-world не найден');

  for (const [dynasty, query] of Object.entries(searches)) {
    try {
      const urls = await findImages(query);
      if (urls.length < 2) { console.warn(`${dynasty}: найдено изображений ${urls.length}, оставляю существующие`); await wait(2200); continue; }
      const local = [];
      for (let index = 0; index < urls.length; index += 1) {
        const response = await fetch(urls[index], { headers: { 'User-Agent': 'AntiqueAI/1.0 (catalog research)' } });
        if (!response.ok) continue;
        const filename = `${dynasty}-${index + 1}.jpg`;
        fs.writeFileSync(path.join(outputRoot, filename), Buffer.from(await response.arrayBuffer()));
        local.push(`/uploads/catalog/muslim-world/dynasties/${filename}`);
      }
      if (local.length >= 2) {
        for (const coin of catalog.coins) {
          if (coin.ruler === dynasty) { coin.imageUrls = local; coin.imageUrl = local[0]; }
        }
        console.log(`${dynasty}: ${local.length} images`);
      }
      await wait(2400);
    } catch (error) { console.warn(`${dynasty}: ${error.message}`); }
  }

  catalog.markModified('coins');
  await catalog.save();
  console.log(JSON.stringify({ coins: catalog.coins.length, withTwoImages: catalog.coins.filter(coin => coin.imageUrls.length >= 2).length }, null, 2));
  await mongoose.disconnect();
}

main().catch(async error => { console.error(error.stack || error); await mongoose.disconnect(); process.exitCode = 1; });

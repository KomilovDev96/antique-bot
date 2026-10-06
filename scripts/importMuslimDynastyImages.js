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
  umayyads: 'Umayyad gold dinar coin', abbasids: 'Abbasid silver dirham coin', samanids: 'Samanid silver dirham coin',
  'qara-khanids': 'Qarakhanid coin', khwarazmshahs: 'Khwarazmshah coin', timurids: 'Timurid coin',
  shaybanids: 'Shaybanid coin', 'bukhara-emirate': 'Bukhara Emirate coin', 'khiva-khanate': 'Khiva Khanate coin',
  'kokand-khanate': 'Kokand coin', ottomans: 'Ottoman gold coin', safavids: 'Safavid silver coin', qajars: 'Qajar gold coin',
};

async function findImage(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`;
  const response = await fetch(url, { headers: { 'User-Agent': 'AntiqueAI/1.0 (catalog research)' } });
  if (!response.ok) return null;
  const data = await response.json();
  return Object.values(data.query?.pages || {})[0]?.imageinfo?.[0]?.thumburl || null;
}

async function main() {
  fs.mkdirSync(outputRoot, { recursive: true });
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/antikBot');
  const catalog = await CoinCatalog.findOne({ slug: 'muslim-world' });
  if (!catalog) throw new Error('Каталог muslim-world не найден');
  for (const [slug, query] of Object.entries(searches)) {
    try {
      const imageUrl = await findImage(query);
      if (!imageUrl) { console.warn(`${slug}: изображение не найдено`); continue; }
      const response = await fetch(imageUrl, { headers: { 'User-Agent': 'AntiqueAI/1.0 (catalog research)' } });
      if (!response.ok) { console.warn(`${slug}: ошибка загрузки ${response.status}`); continue; }
      const filePath = path.join(outputRoot, `${slug}.jpg`);
      fs.writeFileSync(filePath, Buffer.from(await response.arrayBuffer()));
      const relative = `/uploads/catalog/muslim-world/dynasties/${slug}.jpg`;
      const ruler = catalog.rulers.find(item => item.slug === slug);
      if (ruler) ruler.portraitUrl = relative;
      if (!catalog.coverUrl) catalog.coverUrl = relative;
      console.log(`${slug}: ${imageUrl}`);
      await new Promise(resolve => setTimeout(resolve, 1200));
    } catch (error) {
      console.warn(`${slug}: ${error.message}`);
    }
  }
  await catalog.save();
  await mongoose.disconnect();
}

main().catch(async error => { console.error(error.stack || error); await mongoose.disconnect(); process.exitCode = 1; });

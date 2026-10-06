#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CoinCatalog = require('../src/models/CoinCatalog');

const root = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(root, 'env.local') });
const outputRoot = path.join(root, 'uploads/catalog/imperial-russia/portraits');
const rulers = {
  'nicholas-ii': 'Nicholas II coronation portrait', 'alexander-iii': 'Alexander III of Russia portrait',
  'alexander-ii': 'Alexander II of Russia portrait', 'constantine-i': 'Constantine of Russia 1825 portrait',
  'nicholas-i': 'Nicholas I of Russia portrait', 'alexander-i': 'Alexander I of Russia portrait',
  'paul-i': 'Paul I of Russia portrait', 'catherine-ii': 'Catherine II of Russia portrait',
  'peter-iii': 'Peter III of Russia portrait', 'elizabeth': 'Elizabeth of Russia portrait',
  'john-antonovich': 'Ivan VI of Russia portrait', 'anna-ioannovna': 'Anna Ioannovna of Russia portrait',
  'peter-ii': 'Peter II of Russia portrait', 'catherine-i': 'Catherine I of Russia portrait',
  'peter-i': 'Peter the Great portrait',
};

async function findImage(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json`;
  const response = await fetch(url, { headers: { 'User-Agent': 'AntiqueAI/1.0' } });
  if (!response.ok) {
    const fallbackPages = { 'Peter II of Russia portrait': 'Peter_II_of_Russia', 'Catherine I of Russia portrait': 'Catherine_I_of_Russia', 'Peter the Great portrait': 'Peter_the_Great' };
    const fallback = fallbackPages[query] || query.replace(/ portrait| of Russia/g, '').replace(/ /g, '_');
    const fallbackResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(fallback)}`, { headers: { 'User-Agent': 'AntiqueAI/1.0' } });
    if (fallbackResponse.ok) return (await fallbackResponse.json()).thumbnail?.source || null;
    throw new Error(`Wikimedia search failed: ${response.status}`);
  }
  const data = await response.json();
  return Object.values(data.query?.pages || {})[0]?.imageinfo?.[0]?.thumburl || null;
}

async function main() {
  fs.mkdirSync(outputRoot, { recursive: true });
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/antikBot');
  const catalog = await CoinCatalog.findOne({ slug: 'imperial-russia' });
  if (!catalog) throw new Error('Каталог imperial-russia не найден');
  for (const [slug, query] of Object.entries(rulers)) {
    try {
      if (slug === 'nicholas-ii') {
        fs.copyFileSync(path.join(root, 'uploads/catalog/imperial-russia/nicholas-ii-portrait.jpg'), path.join(outputRoot, `${slug}.jpg`));
        const ruler = catalog.rulers.find(item => item.slug === slug);
        if (ruler) ruler.portraitUrl = `/uploads/catalog/imperial-russia/portraits/${slug}.jpg`;
        continue;
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
      const imageUrl = await findImage(query);
      if (!imageUrl) { console.warn(`Нет изображения: ${slug}`); continue; }
      const response = await fetch(imageUrl, { headers: { 'User-Agent': 'AntiqueAI/1.0' } });
      if (!response.ok) throw new Error(`download ${response.status}`);
      const filePath = path.join(outputRoot, `${slug}.jpg`);
      fs.writeFileSync(filePath, Buffer.from(await response.arrayBuffer()));
      const ruler = catalog.rulers.find(item => item.slug === slug);
      if (ruler) ruler.portraitUrl = `/uploads/catalog/imperial-russia/portraits/${slug}.jpg`;
      console.log(`${slug}: ${imageUrl}`);
    } catch (error) {
      console.warn(`${slug}: ${error.message}`);
    }
  }
  await catalog.save();
  await mongoose.disconnect();
}

main().catch(async error => { console.error(error.stack || error); await mongoose.disconnect(); process.exitCode = 1; });

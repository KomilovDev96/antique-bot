#!/usr/bin/env node

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CoinCatalog = require('../src/models/CoinCatalog');

const root = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(root, 'env.local') });

const entries = [
  { dynasty: 'samanids', ruler: 'ismail-ibn-ahmad-al-shash', title: "Дирхам — Исмаил ибн Ахмад, аш-Шаш", year: '893–908', metal: 'silver', weight: '2.55 г', diameter: '27 мм', mint: 'аш-Шаш', denomination: 'samanid-dirham', source: 'Numista N#184659' },
  { dynasty: 'samanids', ruler: 'ahmad-ibn-ismail', title: "Дирхам — Ахмад ибн Исмаил, аш-Шаш", year: '903–914', metal: 'silver', weight: '3.02 г', diameter: '28 мм', mint: 'аш-Шаш', denomination: 'samanid-dirham', source: 'Numista N#146215' },
  { dynasty: 'ghaznavids', ruler: 'mahmud-ghaznavi-multiple', title: 'Многократный дирхам — Махмуд Газневи', year: '999–1007', metal: 'silver', weight: '10 г', diameter: '48 мм', denomination: 'ghaznavid-multiple-dirham', source: 'Numista N#370150' },
  { dynasty: 'fatimids', ruler: 'al-hakim-half-dirham', title: '½ дирхама — аль-Хаким би-Амр Аллах', year: '996–1021', metal: 'silver', weight: '1.45 г', diameter: '19.49 мм', denomination: 'fatimid-half-dirham', source: 'Numista N#569271' },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/antikBot');
  const catalog = await CoinCatalog.findOne({ slug: 'muslim-world' });
  if (!catalog) throw new Error('Каталог muslim-world не найден');
  for (const entry of entries) {
    const image = `/uploads/catalog/muslim-world/dynasties/${entry.dynasty}-1.jpg`;
    const denomination = `${entry.dynasty}-${entry.denomination}`;
    if (!catalog.denominations.some(item => item.slug === denomination)) catalog.denominations.push({ slug: denomination, label: entry.denomination.replace(/-/g, ' '), metal: entry.metal });
    const slug = `${entry.dynasty}-${entry.ruler}-${entry.year}`.replace(/[^a-z0-9а-я-]+/gi, '-').toLowerCase();
    if (!catalog.coins.some(item => item.slug === slug)) catalog.coins.push({ slug, title: entry.title, ruler: entry.dynasty, denomination, year: entry.year, mint: entry.mint, metal: entry.metal, weight: entry.weight, diameter: entry.diameter, description: `Каталожный тип. Цена не указана без конкретного экземпляра и проверки состояния. Источник: ${entry.source}.`, imageUrl: image, imageUrls: [image] });
  }
  catalog.markModified('denominations'); catalog.markModified('coins');
  await catalog.save();
  console.log(JSON.stringify({ denominations: catalog.denominations.length, coins: catalog.coins.length }, null, 2));
  await mongoose.disconnect();
}

main().catch(async error => { console.error(error.stack || error); await mongoose.disconnect(); process.exitCode = 1; });

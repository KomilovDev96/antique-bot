#!/usr/bin/env node

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CoinCatalog = require('../src/models/CoinCatalog');

const root = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(root, 'env.local') });

const entries = [
  { slug: 'abbasids', ruler: 'al-mahdi', title: '1 драхма — аль-Махди, бухарский выпуск', year: '763–772', metal: 'silver', weight: '3.10 г', diameter: '25 мм', mint: 'Бухара', denomination: 'abbasid-drachm', description: 'Серебряный драхм арабско-бухарского типа. Ориентир цены не внесён: зависит от сохранности и чтения легенды. Источник типа: Numista N#372149.' },
  { slug: 'abbasids', ruler: 'khalid', title: '1 драхма — Халид, бухарский выпуск', year: '755–757', metal: 'silver', weight: '3.05 г', diameter: '25.5 мм', mint: 'Бухара', denomination: 'abbasid-drachm', description: 'Серебряный драхм арабско-бухарского типа. Ориентир цены не внесён: требуется оценка конкретного экземпляра. Источник типа: Numista N#483761.' },
  { slug: 'samanids', ruler: 'ismail-ibn-ahmad', title: 'Дирхам — Исмаил ибн Ахмад, Самарканд', year: '893–907', metal: 'silver', weight: '2.30 г', diameter: '27 мм', mint: 'Самарканд', denomination: 'samanid-dirham', description: 'Серебряный дирхам Саманидов. Ориентир цены не внесён: зависит от типа легенды, сохранности и подлинности. Источник типа: Numista N#400046.' },
  { slug: 'samanids', ruler: 'nasr-ii-ibn-ahmad', title: 'Дирхам — Наср II ибн Ахмад', year: '914–941', metal: 'silver', weight: '3.13 г', diameter: '27 мм', denomination: 'samanid-dirham', description: 'Серебряный дирхам Саманидов. Ориентир цены не внесён: нужна оценка конкретной монеты. Источник типа: Numista N#354315.' },
  { slug: 'samanids', ruler: 'nasr-ii-ibn-ahmad', title: 'Динар — Наср II ибн Ахмад, Нишапур', year: '909–932', metal: 'gold', weight: '3.93 г', diameter: '24.5 мм', mint: 'Нишапур', denomination: 'samanid-dinar', description: 'Золотой динар Саманидов. Цена зависит от редкости, легенды и состояния; без конкретного экземпляра не указываем сумму. Источник типа: Numista N#382902.' },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/antikBot');
  const catalog = await CoinCatalog.findOne({ slug: 'muslim-world' });
  if (!catalog) throw new Error('Каталог muslim-world не найден');
  for (const entry of entries) {
    const image = `/uploads/catalog/muslim-world/dynasties/${entry.slug}.jpg`;
    const denominationSlug = `${entry.slug}-${entry.denomination}`;
    if (!catalog.denominations.some(item => item.slug === denominationSlug)) catalog.denominations.push({ slug: denominationSlug, label: entry.denomination === 'samanid-dinar' ? 'Динар' : 'Дирхам / драхма', metal: entry.metal });
    const coinSlug = `${entry.slug}-${entry.ruler}-${entry.year}-${entry.metal}`.replace(/[^a-z0-9а-я-]+/gi, '-').toLowerCase();
    if (!catalog.coins.some(item => item.slug === coinSlug)) catalog.coins.push({ slug: coinSlug, title: entry.title, ruler: entry.slug, denomination: denominationSlug, year: entry.year, mint: entry.mint, metal: entry.metal, weight: entry.weight, diameter: entry.diameter, description: entry.description, imageUrl: image, imageUrls: [image] });
  }
  await catalog.save();
  console.log(JSON.stringify({ rulers: catalog.rulers.length, denominations: catalog.denominations.length, coins: catalog.coins.length }, null, 2));
  await mongoose.disconnect();
}

main().catch(async error => { console.error(error.stack || error); await mongoose.disconnect(); process.exitCode = 1; });

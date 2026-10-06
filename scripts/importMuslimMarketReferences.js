#!/usr/bin/env node

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CoinCatalog = require('../src/models/CoinCatalog');

const root = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(root, 'env.local') });

// Market references are deliberately kept separate from a professional appraisal.
// A marketplace asking price is not proof of authenticity or fair value.
const entries = [
  {
    dynasty: 'abbasids', ruler: 'harun-al-rashid', title: 'Дирхам — Харун ар-Рашид', year: '786–809', metal: 'silver', denomination: 'abbasid-dirham',
    description: 'Серебряный дирхам Аббасидов. Ориентир предложения eBay: 69 USD; это цена конкретного объявления, не подтверждённая оценка и не гарантия подлинности. Для точной оценки нужны фото обеих сторон, вес и диаметр. Источник: https://www.ebay.com/itm/285058207297.'
  },
  {
    dynasty: 'timurids', ruler: 'timurids-unknown-ruler', title: 'Танка — тимуридский тип', year: 'XIV–XV век', metal: 'silver', weight: '4.70 г', denomination: 'timurid-tanka',
    description: 'Серебряная танка тимуридского типа; правитель по объявлению не установлен. Ориентир предложения eBay: 110.50 USD. Не использовать как подтверждение подлинности. Источник: https://www.ebay.com/itm/298703049437.'
  },
  {
    dynasty: 'timurids', ruler: 'timurids-countermarked', title: 'Танка с поздней тимуридской контрамаркой', year: 'XIV–XV век', metal: 'silver', denomination: 'timurid-tanka',
    description: 'Серебряная танка с заявленной поздней контрамаркой при тимуридской власти; атрибуция требует проверки специалистом. Ориентир предложения eBay: 155 USD. Источник: https://www.ebay.com/itm/376887661078.'
  },
  {
    dynasty: 'kokand-khanate', ruler: 'muhammad-khudayar', title: 'Тенга — Кокандское ханство', year: '1860–1861', metal: 'silver', denomination: 'kokand-tenga',
    description: 'Серебряная тенга Кокандского ханства, дата 1277 AH. Ориентир предложения eBay: 13 USD; объявление без профессиональной сертификации. Источник: https://www.ebay.com/itm/366329277668.'
  },
  {
    dynasty: 'umayyads', ruler: 'umayyad-unknown', title: 'Дирхам Омейядов', year: 'около 740-х годов', metal: 'silver', denomination: 'umayyad-dirham',
    description: 'Серебряный дирхам Омейядов; конкретный халиф и монетный двор в объявлении не установлены. Ориентир предложения eBay: 68 USD. Источник: https://www.ebay.com/itm/227145342102.'
  },
  {
    dynasty: 'samanids', ruler: 'abd-al-malik-i', title: 'Дирхам — Абд аль-Малик I, Самарканд', year: '954–961', metal: 'silver', mint: 'Самарканд', denomination: 'samanid-dirham',
    description: 'Серебряный дирхам Саманидов, Абд аль-Малик I. Ориентир предложения eBay: 29.99 USD, состояние ниже среднего; цена конкретного лота. Источник: https://www.ebay.com/itm/366208068332.'
  },
  {
    dynasty: 'samanids', ruler: 'mansur-i-ibn-nuh', title: 'Дирхам — Мансур I ибн Нух, Балх', year: '961–976', metal: 'silver', weight: '3.04 г', diameter: '32 мм', mint: 'Балх', denomination: 'samanid-dirham',
    description: 'Тип подтверждён каталогом Numista N#427130: серебро, 3.04 г, 32 мм, Балх. Ориентир предложения сертифицированного eBay-лота по Мансур I: 200 USD; не переносится автоматически на любую монету. Источники: https://en.numista.com/427130 и https://www.ebay.com/itm/366384685945.'
  },
  {
    dynasty: 'bukhara-emirate', ruler: 'bukhara-unknown', title: '1 тенга — Бухарский эмират', year: '1308/1307 AH', metal: 'silver', denomination: 'bukhara-tenga',
    description: 'Серебряная 1 тенга Бухарского эмирата. Ориентир предложения eBay: 35 USD, без профессиональной сертификации. Источник: https://www.ebay.com/itm/137202581343.'
  },
  {
    dynasty: 'bukhara-emirate', ruler: 'bukhara-1901', title: '1 тенга — Бухарский эмират', year: '1901', metal: 'silver', denomination: 'bukhara-tenga',
    description: 'Серебряная 1 тенга Бухарского эмирата. Ориентир исторического eBay-лота: 39 USD; фактическая цена сделки могла отличаться. Источник: https://www.ebay.com/itm/177782103629.'
  },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/antikBot');
  const catalog = await CoinCatalog.findOne({ slug: 'muslim-world' });
  if (!catalog) throw new Error('Каталог muslim-world не найден');

  for (const entry of entries) {
    const image = `/uploads/catalog/muslim-world/dynasties/${entry.dynasty}.jpg`;
    const denominationSlug = `${entry.dynasty}-${entry.denomination}`;
    if (!catalog.denominations.some(item => item.slug === denominationSlug)) {
      catalog.denominations.push({ slug: denominationSlug, label: entry.denomination.replace(/-/g, ' '), metal: entry.metal });
    }
    const coinSlug = `${entry.dynasty}-${entry.ruler}-${entry.year}-${entry.metal}`.replace(/[^a-z0-9а-я-]+/gi, '-').toLowerCase();
    if (!catalog.coins.some(item => item.slug === coinSlug)) {
      const priceMatch = entry.description.match(/eBay[^0-9]*([0-9.]+) USD/);
      catalog.coins.push({
        slug: coinSlug, title: entry.title, ruler: entry.dynasty, denomination: denominationSlug,
        year: entry.year, metal: entry.metal, weight: entry.weight, description: entry.description,
        imageUrl: image, imageUrls: [image],
        price: priceMatch ? { amount: priceMatch[1], currency: 'USD' } : undefined,
      });
    }
  }

  await catalog.save();
  console.log(JSON.stringify({ rulers: catalog.rulers.length, denominations: catalog.denominations.length, coins: catalog.coins.length }, null, 2));
  await mongoose.disconnect();
}

main().catch(async error => { console.error(error.stack || error); await mongoose.disconnect(); process.exitCode = 1; });

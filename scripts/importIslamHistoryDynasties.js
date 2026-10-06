#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CoinCatalog = require('../src/models/CoinCatalog');

const root = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(root, 'env.local') });
const outputRoot = path.join(root, 'uploads/catalog/muslim-world/dynasties');

const dynasties = [
  { slug: 'rashidun', name: 'Праведные халифы', years: '632–661', images: ['https://upload.wikimedia.org/wikipedia/commons/3/3d/Islamic_coin%2C_Time_of_the_Rashidun._Khosrau_type._AH_31-41_AD_651-661.jpg'] },
  { slug: 'umayyad-andalus', name: 'Андалусские Омейяды', years: '756–1031', images: ['https://upload.wikimedia.org/wikipedia/commons/0/0f/Al_Andalus_dirham_76119.jpg', 'https://upload.wikimedia.org/wikipedia/commons/2/29/M40_Dirham_AlAndalus_HishamII_1_%288276883051%29.jpg'] },
  { slug: 'fatimids', name: 'Фатимиды', years: '909–1171', images: ['https://upload.wikimedia.org/wikipedia/commons/8/86/Gold_dinar_of_al-Hafiz_li-Din_Allah%2C_AH_544.jpg'] },
  { slug: 'ghaznavids', name: 'Газневиды', years: '977–1186', images: ['https://upload.wikimedia.org/wikipedia/commons/5/5d/Silver_jitals_of_Mahmud_of_Ghazna_with_bilingual_Arabic_and_Sanskrit_minted_in_Lahore_1208.jpg'] },
  { slug: 'mongols-chagatai', name: 'Монголы и Чагатайское ханство', years: '1206–1370', images: ['https://upload.wikimedia.org/wikipedia/commons/a/ab/Chaghatayid_Khans._temp._Qaidu._Circa_AH_668-701_AD_1268-1301._Samarqand_mint._Dated_AH_685_%28AD_1285%29.jpg', 'https://upload.wikimedia.org/wikipedia/commons/7/78/Mongol_Empire%2C_copper_dirham%2C_Otrar%2C_1258%E2%80%931259.jpg'] },
];

const coins = [
  { dynasty: 'rashidun', ruler: 'rashidun-unknown', title: 'Серебряный дирхам хосровского типа', year: '651–661', metal: 'silver', denomination: 'rashidun-dirham', description: 'Ранний исламский серебряный дирхам хосровского типа, относимый к периоду Праведных халифов. Точная атрибуция конкретного экземпляра требует проверки легенд и веса. Источник изображения: Wikimedia Commons.' },
  { dynasty: 'umayyad-andalus', ruler: 'abd-al-rahman-i', title: 'Дирхам — Абд ар-Рахман I, аль-Андалус', year: '756–788', metal: 'silver', denomination: 'andalus-dirham', description: 'Серебряный дирхам Андалусских Омейядов. Монетный двор и дата должны подтверждаться чтением арабской легенды. Источник изображения: Wikimedia Commons.' },
  { dynasty: 'fatimids', ruler: 'al-hakim', title: '¼ динара — аль-Хаким би-Амр Аллах', year: '996–1021', metal: 'gold', weight: '1 г', diameter: '13 мм', denomination: 'fatimid-quarter-dinar', description: 'Золотой четверть-динар Фатимидов. Каталожный тип Numista N#584001; цена не указывается без конкретного состояния и проверки подлинности.' },
  { dynasty: 'fatimids', ruler: 'al-muizz', title: '½ дирхама — аль-Муизз', year: '953–975', metal: 'silver', weight: '1.42 г', diameter: '21 мм', denomination: 'fatimid-half-dirham', description: 'Серебряный половинный дирхам Фатимидов. Каталожный тип Numista N#212861; цена требует оценки конкретного экземпляра.' },
  { dynasty: 'ghaznavids', ruler: 'mahmud-ghaznavi', title: 'Дирхам — Махмуд Газневи', year: '998–1030', metal: 'silver', weight: '3.61 г', diameter: '20 мм', mint: 'Газна', denomination: 'ghaznavid-dirham', description: 'Серебряный дирхам Махмуда Газневи, газневидский тип. Каталог Numista указывает серебро и тип Газны; цена без конкретного лота не указывается.' },
  { dynasty: 'ghaznavids', ruler: 'mahmud-ghaznavi', title: 'Джитал — Махмуд Газневи, двуязычный тип', year: '998–1030', metal: 'silver', denomination: 'ghaznavid-jital', description: 'Серебряный джитал/мелкий номинал с арабской и санскритской легендой. Изображение иллюстрирует тип, а не подтверждает подлинность любого экземпляра.' },
  { dynasty: 'qara-khanids', ruler: 'rukn-al-din-muhammad', title: 'AE дирхам — Рукн ад-Дин Мухаммад', year: 'XI–XII век', metal: 'copper', denomination: 'qarakhanid-ae-dirham', description: 'Медный AE дирхам Караханидов, тип Рукн ад-Дина Мухаммада. Источник типа: Numista, раздел Qarakhanid dynasty; точная дата и цена зависят от монетного двора и состояния.' },
  { dynasty: 'mongols-chagatai', ruler: 'qaidu', title: 'Дирхам — Каиду, Самарканд', year: 'около 1285', metal: 'silver', mint: 'Самарканд', denomination: 'chagatai-dirham', description: 'Серебряный дирхам Чагатайского ханства, Каиду, Самарканд, AH 685 / 1285. Изображение и атрибуция взяты из открытой коллекции Wikimedia Commons.' },
  { dynasty: 'mongols-chagatai', ruler: 'anonymous-chagatai', title: 'Медный дирхам Монгольской империи, Отрар', year: '1258–1259', metal: 'copper', mint: 'Отрар', denomination: 'mongol-copper-dirham', description: 'Медный дирхам Монгольской империи, Отрар, 1258–1259. Отнесён к монгольско-чагатайскому разделу как переходный тип; спорные атрибуции будут отмечаться отдельно.' },
];

const slugify = value => String(value).toLowerCase().replace(/[^a-z0-9а-я]+/gi, '-').replace(/^-|-$/g, '');

async function download(url, filename) {
  const response = await fetch(url, { headers: { 'User-Agent': 'AntiqueAI/1.0 (catalog research)' } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  fs.writeFileSync(path.join(outputRoot, filename), Buffer.from(await response.arrayBuffer()));
}

async function main() {
  fs.mkdirSync(outputRoot, { recursive: true });
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/antikBot');
  const catalog = await CoinCatalog.findOne({ slug: 'muslim-world' });
  if (!catalog) throw new Error('Каталог muslim-world не найден');
  for (const dynasty of dynasties) {
    const local = [];
    for (let index = 0; index < dynasty.images.length; index += 1) {
      const filename = `${dynasty.slug}-${index + 1}.jpg`;
      try { await download(dynasty.images[index], filename); local.push(`/uploads/catalog/muslim-world/dynasties/${filename}`); } catch (error) { console.warn(`${dynasty.slug}: ${error.message}`); }
    }
    const existing = catalog.rulers.find(item => item.slug === dynasty.slug);
    if (existing) { existing.name = dynasty.name; existing.years = dynasty.years; existing.portraitUrl = local[0] || existing.portraitUrl; }
    else catalog.rulers.push({ slug: dynasty.slug, name: dynasty.name, years: dynasty.years, portraitUrl: local[0] });
    if (!catalog.denominations.some(item => item.slug === `${dynasty.slug}-overview`)) catalog.denominations.push({ slug: `${dynasty.slug}-overview`, label: dynasty.name });
  }
  for (const entry of coins) {
    const imageFiles = dynasties.find(item => item.slug === entry.dynasty)?.images.map((_, index) => `/uploads/catalog/muslim-world/dynasties/${entry.dynasty}-${index + 1}.jpg`) || [];
    const denomination = `${entry.dynasty}-${entry.denomination}`;
    if (!catalog.denominations.some(item => item.slug === denomination)) catalog.denominations.push({ slug: denomination, label: entry.denomination.replace(/-/g, ' '), metal: entry.metal });
    const coinSlug = slugify(`${entry.dynasty}-${entry.ruler}-${entry.title}-${entry.year}`);
    if (!catalog.coins.some(item => item.slug === coinSlug)) catalog.coins.push({ ...entry, slug: coinSlug, denomination, imageUrl: imageFiles[0], imageUrls: imageFiles });
  }
  catalog.markModified('rulers'); catalog.markModified('denominations'); catalog.markModified('coins');
  await catalog.save();
  console.log(JSON.stringify({ rulers: catalog.rulers.length, denominations: catalog.denominations.length, coins: catalog.coins.length }, null, 2));
  await mongoose.disconnect();
}

main().catch(async error => { console.error(error.stack || error); await mongoose.disconnect(); process.exitCode = 1; });

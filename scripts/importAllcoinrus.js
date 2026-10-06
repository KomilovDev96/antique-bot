#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const sharp = require('sharp');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CoinCatalog = require('../src/models/CoinCatalog');

const apkPath = path.resolve(process.argv[2] || '/Users/macbook/Desktop/allcoinrus.apk');
const backendRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(backendRoot, 'env.local') });

const slugify = value => String(value || '')
  .toLowerCase()
  .replace(/ё/g, 'е')
  .replace(/[^a-zа-я0-9]+/gi, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 70) || 'coin';

const findImage = (assetsRoot, rawPath) => {
  if (!rawPath) return null;
  const relative = String(rawPath).replace(/^assets[\\/]/, '').replace(/^\/+/, '');
  const parsed = path.parse(relative);
  const candidates = [relative, `${relative}.gif`, `${relative}.jpg`, `${relative}.jpeg`, `${relative}.png`, `${relative}.webp`, `${parsed.dir}/${parsed.name}_1.gif`, `${parsed.dir}/${parsed.name}_2.gif`];
  const ubRf = relative.match(/^ub_rf[\\/]([^\\/]+)[\\/]([^\\/]+)\.(?:jpg|jpeg|png|gif)$/i);
  if (ubRf) candidates.push(`9/${ubRf[1]}/${ubRf[2]}.gif`);
  for (const candidate of candidates) {
    const file = path.join(assetsRoot, candidate);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  }
  return null;
};

const recoverDatabase = (dbPath, tempRoot, headerSource) => {
  const databaseName = path.basename(dbPath, '.db');
  let sourcePath = dbPath;
  if (databaseName !== '3') {
    const raw = fs.readFileSync(dbPath);
    const header = fs.readFileSync(headerSource).subarray(0, 100);
    sourcePath = path.join(tempRoot, `${databaseName}-rebuild.db`);
    fs.writeFileSync(sourcePath, raw.length >= 1024 ? Buffer.concat([header, raw.subarray(0, 924), raw.subarray(1024)]) : Buffer.concat([header, raw]));
  }
  const recoveredSql = execFileSync('sqlite3', [sourcePath], { input: '.recover\n', encoding: 'utf8' });
  const recoveredPath = path.join(tempRoot, `${databaseName}.sql`);
  const repairedPath = path.join(tempRoot, `${databaseName}-repaired.db`);
  fs.writeFileSync(recoveredPath, recoveredSql);
  execFileSync('sqlite3', [repairedPath], { input: recoveredSql, encoding: 'utf8' });
  if (databaseName === '3') return JSON.parse(execFileSync('sqlite3', ['-json', repairedPath, 'SELECT * FROM monets;'], { encoding: 'utf8' })).map(row => ({ ...row, source: 'db3' }));
  const query = `SELECT c0 AS _id, c1 AS id_subgeneral, c2 AS nominal, c3 AS name, c4 AS year, c5 AS date_vipusk, c6 AS tiraz, c7 AS katalog, c8 AS price, c9 AS dvor, c10 AS http, c11 AS raritet, c12 AS splav, c13 AS massa, c14 AS diametr, c15 AS tolshcina, c16 AS gurt, c17 AS info, c18 AS pic_revers, c19 AS pic_avers, c20 AS value, c21 AS show, c22 AS coment, c23 AS quality, c24 AS error, c25 AS revers, c26 AS avers, c27 AS myprice, c28 AS myhttp, c29 AS raznovid, c30 AS reserv FROM lost_and_found WHERE nfield >= 20;`;
  return JSON.parse(execFileSync('sqlite3', ['-json', repairedPath, query], { encoding: 'utf8' })).map(row => ({ ...row, source: `db${databaseName}` }));
};

const copyImage = async (source, outputRoot, filename) => {
  if (!source) return null;
  const outputName = `${filename}.jpg`;
  await sharp(source).jpeg({ quality: 90, progressive: true }).toFile(path.join(outputRoot, outputName));
  return `/uploads/catalog/russia-ussr/${outputName}`;
};

const materialGroup = value => {
  const material = String(value || '').toLowerCase();
  if (/серебро/.test(material)) return 'silver';
  if (/(медь|латунь|бронз|мельхиор|медно-никелев)/.test(material)) return 'copper';
  if (/золот/.test(material)) return 'gold';
  return 'other';
};

const materialLabel = { silver: 'Серебро', copper: 'Медь и медные сплавы', gold: 'Золото', other: 'Другие металлы' };

async function main() {
  if (!fs.existsSync(apkPath)) throw new Error(`APK не найден: ${apkPath}`);
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'allcoinrus-import-'));
  const assetsRoot = path.join(tempRoot, 'assets');
  const dbPath = path.join(assetsRoot, '3.db');
  fs.mkdirSync(assetsRoot, { recursive: true });
  execFileSync('unzip', ['-qo', apkPath, 'assets/*', '-d', tempRoot], { stdio: 'inherit' });
  if (!fs.existsSync(dbPath)) throw new Error('В APK не найдена база assets/3.db');

  const rows = [
    recoverDatabase(path.join(assetsRoot, '3.db'), tempRoot, dbPath),
    recoverDatabase(path.join(assetsRoot, '1.db'), tempRoot, dbPath),
    recoverDatabase(path.join(assetsRoot, '2.db'), tempRoot, dbPath),
    recoverDatabase(path.join(assetsRoot, '4.db'), tempRoot, dbPath),
  ].flat();
  // assets/0.db is a tiny page fragment with two image references but no recoverable schema.
  rows.push(
    { _id: '0-2002', source: 'db0', name: 'Памятная монета', year: '2002', pic_avers: 'ub_rf/88/730.jpg', pic_revers: 'ub_rf/88/730.jpg', splav: 'other' },
    { _id: '0-2003', source: 'db0', name: 'Памятная монета', year: '2003', pic_avers: 'ub_rf/88/731.jpg', pic_revers: 'ub_rf/88/731.jpg', splav: 'other' },
  );

  const outputRoot = path.join(backendRoot, 'uploads/catalog/russia-ussr');
  fs.mkdirSync(outputRoot, { recursive: true });
  const years = new Map();
  const denominations = new Map();
  const coins = [];
  let skippedWithoutImages = 0;
  for (const row of rows) {
    const group = materialGroup(row.splav);
    const year = String(row.year || 'Без года').match(/\d{4}/)?.[0] || 'unknown';
    const rulerSlug = `year-${year}`;
    const denominationSlug = `metal-${group}`;
    if (!years.has(year)) years.set(year, { slug: rulerSlug, name: year === 'unknown' ? 'Год не указан' : `${year} год`, years: year === 'unknown' ? undefined : year });
    if (!denominations.has(denominationSlug)) denominations.set(denominationSlug, { slug: denominationSlug, label: materialLabel[group], metal: group });
    const denominationLabel = String(row.name || row.nominal || 'Монета').trim();
    const baseSlug = `${row.source}-${row._id}-${slugify(row.year || 'coin')}`;
    const avers = findImage(assetsRoot, row.pic_avers || row.http);
    const revers = findImage(assetsRoot, row.pic_revers || row.http);
    const imageUrls = [await copyImage(avers, outputRoot, `${baseSlug}-avers`), await copyImage(revers, outputRoot, `${baseSlug}-revers`)].filter(Boolean);
    if (!imageUrls.length) skippedWithoutImages += 1;
    coins.push({
      slug: baseSlug,
      title: `${denominationLabel}${row.year ? ` ${row.year}` : ''}`.trim(),
      ruler: rulerSlug,
      denomination: denominationSlug,
      year: row.year ? String(row.year) : undefined,
      mint: row.dvor ? String(row.dvor) : undefined,
      metal: row.splav ? String(row.splav) : undefined,
      weight: row.massa ? `${row.massa} г` : undefined,
      diameter: row.diametr ? `${row.diametr} мм` : undefined,
      mintage: row.tiraz ? String(row.tiraz) : undefined,
      description: row.info ? String(row.info) : undefined,
      imageUrl: imageUrls[0],
      imageUrls,
      price: row.price ? { amount: String(row.price), currency: 'USD' } : undefined,
    });
  }

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/antikBot');
  await CoinCatalog.deleteOne({ slug: 'russia-ussr' });
  await CoinCatalog.create({
    slug: 'russia-ussr',
    title: 'Монеты России и СССР',
    subtitle: 'Полный каталог по годам и металлам',
    period: '1921–2026',
    country: 'Россия и СССР',
    rulers: [...years.values()].sort((a, b) => String(a.slug).localeCompare(String(b.slug), undefined, { numeric: true })),
    denominations: [...denominations.values()],
    coins,
  });
  await mongoose.disconnect();
  console.log(JSON.stringify({ imported: coins.length, denominations: denominations.size, withImages: coins.length - skippedWithoutImages, skippedWithoutImages, goldImported: coins.filter(coin => /золот/i.test(String(coin.metal || ''))).length }, null, 2));
}

main().catch(async error => { console.error(error.stack || error); try { await mongoose.disconnect(); } catch {} process.exitCode = 1; });

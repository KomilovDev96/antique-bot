#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const sharp = require('sharp');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CoinCatalog = require('../src/models/CoinCatalog');

const apkPath = path.resolve(process.argv[2] || '/Users/macbook/Desktop/caesarrus.apk');
const root = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(root, 'env.local') });

const rulerOrder = [
  ['nicholas-ii', 'Николай II', '1894–1917'], ['alexander-iii', 'Александр III', '1881–1894'], ['alexander-ii', 'Александр II', '1855–1881'],
  ['constantine-i', 'Константин I', '1825'], ['nicholas-i', 'Николай I', '1825–1855'], ['alexander-i', 'Александр I', '1801–1825'],
  ['paul-i', 'Павел I', '1796–1801'], ['catherine-ii', 'Екатерина II', '1762–1796'], ['peter-iii', 'Пётр III', '1761–1762'],
  ['elizabeth', 'Елизавета Петровна', '1741–1761'], ['john-antonovich', 'Иоанн Антонович', '1740–1741'], ['anna-ioannovna', 'Анна Иоанновна', '1730–1740'],
  ['peter-ii', 'Пётр II', '1727–1730'], ['catherine-i', 'Екатерина I', '1725–1727'], ['peter-i', 'Пётр I', '1682–1725'],
];
const rulerByName = new Map(rulerOrder.map(([slug, name, years]) => [name, { slug, name, years }]));
const prefixToRuler = { nik2: 'Николай II', nik1: 'Николай I', alex3: 'Александр III', alex2: 'Александр II', alex1: 'Александр I', kons: 'Константин I', pavel: 'Павел I', ek2: 'Екатерина II', petr3: 'Пётр III', liza: 'Елизавета Петровна', anna: 'Анна Иоанновна', petr2: 'Пётр II', petr1: 'Пётр I', ivan4: 'Иоанн Антонович' };
const materialGroup = value => { const text = String(value || '').toLowerCase(); if (/золот/.test(text)) return 'gold'; if (/серебр/.test(text)) return 'silver'; if (/(медь|латунь|бронз|мельхиор|медно-никелев)/.test(text)) return 'copper'; return 'other'; };
const materialLabel = { gold: 'Золото', silver: 'Серебро', copper: 'Медь и медные сплавы', other: 'Другие металлы' };
const slugify = value => String(value || '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'coin';

const findImage = (assetsRoot, rawPath) => {
  if (!rawPath) return null;
  const relative = String(rawPath).replace(/^assets[\\/]/, '').replace(/^\/+/, '');
  const parsed = path.parse(relative);
  const candidates = [relative, `${relative}.gif`, `${relative}.jpg`, `${relative}.jpeg`, `${relative}.png`, `${relative}.webp`, `${parsed.dir}/${parsed.name}_1.gif`, `${parsed.dir}/${parsed.name}_2.gif`];
  for (const candidate of candidates) { const file = path.join(assetsRoot, candidate); if (fs.existsSync(file) && fs.statSync(file).isFile()) return file; }
  return null;
};

const recover = (dbPath, tempRoot, headerSource, source) => {
  let sourcePath = dbPath;
  if (source !== 'db3') {
    const raw = fs.readFileSync(dbPath); const header = fs.readFileSync(headerSource).subarray(0, 100);
    sourcePath = path.join(tempRoot, `${source}-rebuild.db`);
    fs.writeFileSync(sourcePath, Buffer.concat([header, raw.subarray(0, 924), raw.subarray(1024)]));
  }
  const sql = execFileSync('sqlite3', [sourcePath], { input: '.recover\n', encoding: 'utf8' });
  const sqlPath = path.join(tempRoot, `${source}.sql`); const fixedPath = path.join(tempRoot, `${source}-fixed.db`);
  fs.writeFileSync(sqlPath, sql); execFileSync('sqlite3', [fixedPath], { input: sql, encoding: 'utf8' });
  if (source === 'db3') return JSON.parse(execFileSync('sqlite3', ['-json', fixedPath, "SELECT m.*, g.name AS ruler_name FROM monets m JOIN subgeneral s ON s._id=m.id_subgeneral JOIN general g ON g._id=s.id_general;"], { encoding: 'utf8' }));
  const fields = Array.from({ length: 27 }, (_, index) => `c${index} AS f${index}`).join(', ');
  return JSON.parse(execFileSync('sqlite3', ['-json', fixedPath, `SELECT ${fields} FROM lost_and_found WHERE nfield = 27;`], { encoding: 'utf8' })).map(row => ({ _id: row.f0, id_subgeneral: row.f1, nominal: row.f2, name: row.f3, year: row.f4, price: row.f5, tiraz: row.f6, dvor: row.f7, raritet: row.f8, http: row.f9, mintage: row.f10, value: row.f11, splav: row.f12, massa: row.f13, diametr: row.f14, tolshcina: row.f15, gurt: row.f16, info: row.f17, pic_revers: row.f18, pic_avers: row.f19, source }));
};

async function main() {
  if (!fs.existsSync(apkPath)) throw new Error(`APK не найден: ${apkPath}`);
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'caesarrus-import-')); const assetsRoot = path.join(tempRoot, 'assets'); fs.mkdirSync(assetsRoot, { recursive: true });
  execFileSync('unzip', ['-qo', apkPath, 'assets/*', '-d', tempRoot], { stdio: 'inherit' });
  const rows = [...recover(path.join(assetsRoot, '3.db'), tempRoot, path.join(assetsRoot, '3.db'), 'db3'), ...recover(path.join(assetsRoot, '1.db'), tempRoot, path.join(assetsRoot, '3.db'), 'db1'), ...recover(path.join(assetsRoot, '2.db'), tempRoot, path.join(assetsRoot, '3.db'), 'db2')];
  const outputRoot = path.join(root, 'uploads/catalog/imperial-russia'); fs.mkdirSync(outputRoot, { recursive: true });
  const portraitPath = path.join(root, 'uploads/catalog/imperial-russia/nicholas-ii-portrait.jpg');
  const rulers = new Map(rulerOrder.map(([slug, name, years]) => [slug, { slug, name, years, ...(slug === 'nicholas-ii' && fs.existsSync(portraitPath) ? { portraitUrl: '/uploads/catalog/imperial-russia/nicholas-ii-portrait.jpg' } : {}) }])); const denominations = new Map(); const coins = []; let withImages = 0;
  for (const row of rows) {
    const prefix = String(row.pic_avers || row.http || '').split('/')[0];
    const ruler = row.ruler_name ? rulerByName.get(row.ruler_name) : rulerByName.get(prefixToRuler[prefix]);
    if (!ruler) continue;
    rulers.set(ruler.slug, { ...rulers.get(ruler.slug), ...ruler });
    const metal = materialGroup(row.splav); const name = String(row.name || row.nominal || 'Монета').trim(); const denominationSlug = `${ruler.slug}-${metal}-${slugify(name)}`;
    if (!denominations.has(denominationSlug)) denominations.set(denominationSlug, { slug: denominationSlug, label: name, metal });
    const base = `${row.source || 'db3'}-${row._id}-${slugify(row.year || 'coin')}`;
    const sources = [...new Set([row.pic_avers, row.pic_revers, !row.pic_avers || !row.pic_revers ? row.http : null].filter(Boolean))].map(value => findImage(assetsRoot, value)).filter(Boolean);
    const imageUrls = [];
    for (let index = 0; index < sources.length; index += 1) { const filename = `${base}-${index}.png`; await sharp(sources[index]).resize({ width: 600, height: 600, fit: 'contain', kernel: 'lanczos3' }).png().toFile(path.join(outputRoot, filename)); imageUrls.push(`/uploads/catalog/imperial-russia/${filename}`); }
    if (imageUrls.length) withImages += 1;
    coins.push({ slug: base, title: `${name}${row.year ? ` ${row.year}` : ''}`.trim(), ruler: ruler.slug, denomination: denominationSlug, year: row.year ? String(row.year) : undefined, mint: row.dvor ? String(row.dvor) : undefined, metal: row.splav ? String(row.splav) : undefined, weight: row.massa ? `${row.massa} г` : undefined, diameter: row.diametr ? `${row.diametr} мм` : undefined, mintage: row.mintage || row.tiraz ? String(row.mintage || row.tiraz) : undefined, description: row.info ? String(row.info) : undefined, imageUrl: imageUrls[0], imageUrls, price: row.price ? { amount: String(row.price), currency: 'USD' } : undefined });
  }
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/antikBot'); await CoinCatalog.deleteOne({ slug: 'imperial-russia' }); await CoinCatalog.create({ slug: 'imperial-russia', title: 'Монеты Российской империи', subtitle: 'Полный каталог царских монет с изображениями', period: '1682–1917', country: 'Российская империя', rulers: [...rulers.values()], denominations: [...denominations.values()], coins }); await mongoose.disconnect();
  console.log(JSON.stringify({ sourceRows: rows.length, imported: coins.length, rulers: rulers.size, denominations: denominations.size, withImages, gold: coins.filter(coin => /золот/i.test(String(coin.metal || ''))).length, silver: coins.filter(coin => /серебр/i.test(String(coin.metal || ''))).length, copper: coins.filter(coin => /медь|латунь|бронз|мельхиор|медно-никелев/i.test(String(coin.metal || ''))).length }, null, 2));
}

main().catch(async error => { console.error(error.stack || error); try { await mongoose.disconnect(); } catch {} process.exitCode = 1; });

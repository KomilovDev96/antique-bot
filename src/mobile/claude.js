const fs = require('fs/promises');
const path = require('path');
const MediaAsset = require('../models/MediaAsset');
const CollectionItem = require('../models/CollectionItem');
const { item } = require('./format');

const endpoint = 'https://api.anthropic.com/v1/messages';
async function askClaude(system, prompt, images = []) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('AI provider is not configured on this backend');
  const content = images.map(image => ({ type: 'image', source: { type: 'base64', media_type: image.mimeType, data: image.data } }));
  content.push({ type: 'text', text: `${prompt}\nReturn valid JSON only. Do not use Markdown fences.` });
  const response = await fetch(endpoint, { method: 'POST', signal: AbortSignal.timeout(60000), headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5', max_tokens: 1800, system, messages: [{ role: 'user', content }] }) });
  if (!response.ok) throw new Error(`Claude request failed (${response.status})`);
  const body = await response.json(); const text = (body.content || []).filter(block => block.type === 'text').map(block => block.text || '').join('').trim().replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  return JSON.parse(text);
}
async function loadImages(ownerId, mediaIds) {
  const assets = await MediaAsset.find({ ownerId, _id: { $in: mediaIds || [] } }).lean(); const root = process.cwd(); const images = [];
  for (const asset of assets.slice(0, 5)) { try { const data = await fs.readFile(path.join(root, asset.url.replace(/^\//, ''))); images.push({ mimeType: asset.mimeType || 'image/jpeg', data: data.toString('base64') }); } catch (_) { /* missing media is handled by the model request */ } }
  return images;
}
async function identify(ownerId, mediaIds, description) {
  const images = await loadImages(ownerId, mediaIds);
  const result = await askClaude('You identify antiques conservatively. Never claim authenticity, fineness, or ownership. Return JSON with candidates: [{title,categoryName,year,country,material,confidence,reasons,discrepancies}].', `Identify this object from the photos. Description: ${description || 'none'}. Return at most three candidates.`, images);
  const candidates = (Array.isArray(result.candidates) ? result.candidates : []).slice(0, 3).map((candidate, index) => ({ id: `claude-${index + 1}`, item: { id: `candidate-${index + 1}`, title: String(candidate.title || 'Неопознанный предмет'), categoryId: 'ai', categoryName: String(candidate.categoryName || 'Другое'), photos: [], attributes: {}, favorite: false, sources: [], createdAt: new Date().toISOString(), year: candidate.year ? String(candidate.year) : undefined, country: candidate.country, material: candidate.material }, confidence: Math.max(0, Math.min(1, Number(candidate.confidence) || 0)), reasons: Array.isArray(candidate.reasons) ? candidate.reasons.map(String).slice(0, 5) : [], discrepancies: Array.isArray(candidate.discrepancies) ? candidate.discrepancies.map(String).slice(0, 5) : [], origin: 'web' }));
  return { candidates, sources: [] };
}
async function answerCollection(ownerId, question) {
  const values = await CollectionItem.find({ ownerId }).sort({ createdAt: -1 }).limit(50); const evidence = values.map(value => ({ id: String(value._id), title: value.title, year: value.year, country: value.country, material: value.material }));
  return askClaude('You are a private collection assistant. Use only the supplied evidence. Do not invent counts, authenticity, ownership, or prices. Return JSON with text and itemIds.', JSON.stringify({ question, collection: evidence }));
}
async function webSearch(queries) {
  const terms = [...new Set((Array.isArray(queries) ? queries : [queries]).map(value => String(value || '').trim()).filter(Boolean))].slice(0, 3);
  const sources = [];
  for (const query of terms) {
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'AntiqueAI/1.0 research reader' } });
    if (!response.ok) continue;
    const html = await response.text();
    const matches = [...html.matchAll(/<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
    for (const match of matches.slice(0, 3)) {
      const href = match[1].replace(/&amp;/g, '&');
      const title = match[2].replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&').trim();
      try { const redirect = new URL(href, 'https://html.duckduckgo.com/'); const target = redirect.searchParams.get('uddg'); const url = new URL(target || redirect.toString()); if (!/^https?:$/.test(url.protocol)) continue; sources.push({ title: title || query, url: url.toString(), domain: url.hostname }); } catch (_) { /* ignore malformed search result */ }
    }
  }
  return [...new Map(sources.map(source => [source.url, source])).values()].slice(0, 8);
}
module.exports = { identify, answerCollection, loadImages, webSearch };

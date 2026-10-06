const id = (value) => String(value);
const media = (value) => ({ id: id(value.id || value._id), url: value.url, kind: value.kind || 'image' });
const source = (value) => ({ title: value.title, url: value.url, domain: value.domain || new URL(value.url).hostname, ...(value.description ? { description: value.description } : {}) });
const item = (value, extra = {}) => ({
  id: id(value._id || value.id), collectionCode: value.collectionCode, title: value.title, categoryId: value.categoryId, categoryName: value.categoryName || 'Без категории',
  photos: (value.photos || []).map(media), year: value.year, country: value.country, material: value.material, condition: value.condition, rarity: value.rarity,
  description: value.description, history: value.history, provenance: value.provenance, notes: value.notes, purchaseInfo: value.purchaseInfo,
  attributes: value.attributes instanceof Map ? Object.fromEntries(value.attributes) : (value.attributes || {}), favorite: Boolean(value.favorite),
  ...(value.estimatedValue?.amount ? { estimatedValue: value.estimatedValue } : {}), ...(value.metalValue?.amount ? { metalValue: value.metalValue } : {}),
  sources: (value.sources || []).map(source), createdAt: new Date(value.createdAt || Date.now()).toISOString(), aiSummary: value.aiSummary, ...extra,
});
const user = (value) => ({ id: id(value._id || value.id), name: value.name || 'Коллекционер', email: value.email, emailVerified: Boolean(value.emailVerified), ...(value.avatarUrl ? { avatarUrl: value.avatarUrl } : {}), categoryIds: value.categoryIds || [] });
const request = (value) => ({ id: id(value._id), kind: value.kind, title: value.title, status: value.status, createdAt: new Date(value.createdAt || Date.now()).toISOString(), description: value.description, attributes: value.attributes || {}, history: (value.history || []).map(entry => ({ status: entry.status, at: new Date(entry.at || Date.now()).toISOString(), ...(entry.note ? { note: entry.note } : {}) })), ...(value.inspectionResult && (value.inspectionResult.issuedAt || value.inspectionResult.examiner || value.inspectionResult.conclusion) ? { inspectionResult: { examiner: value.inspectionResult.examiner, conclusion: value.inspectionResult.conclusion, ...(value.inspectionResult.issuedAt ? { issuedAt: new Date(value.inspectionResult.issuedAt).toISOString() } : {}), documents: (value.inspectionResult.documents || []).map(media) } } : {}) });
const legacyRequest = (value, kind, title, description) => ({ id: id(value._id), kind, title: title || 'Заявка из Telegram', status: value.status === 'replied' || value.status === 'approved' ? 'approved' : value.status === 'completed' ? 'completed' : 'pending', createdAt: new Date(value.createdAt || Date.now()).toISOString(), description, history: [{ status: value.status || 'pending', at: new Date(value.createdAt || Date.now()).toISOString() }] });
module.exports = { id, media, source, item, user, request };

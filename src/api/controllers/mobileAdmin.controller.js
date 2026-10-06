const CollectorRequest = require('../../models/CollectorRequest');
const MarketplaceListing = require('../../models/MarketplaceListing');
const CollectorUser = require('../../models/CollectorUser');
const SavedSearch = require('../../models/SavedSearch');
const Notification = require('../../models/Notification');

exports.getRequests = async (req, res) => {
  try {
    const status = req.query.status;
    const filter = status ? { status } : {};
    const [items, total] = await Promise.all([CollectorRequest.find(filter).sort({ createdAt: -1 }).skip(Number(req.query.skip || 0)).limit(Math.min(Number(req.query.limit || 50), 100)).lean(), CollectorRequest.countDocuments(filter)]);
    res.json({ items, total });
  } catch (error) { res.status(500).json({ message: 'Failed to load mobile requests' }); }
};
exports.updateRequest = async (req, res) => {
  try {
    const nextStatus = String(req.body?.status || '');
    const allowed = ['received', 'in_review', 'needs_information', 'verified', 'approved', 'rejected', 'completed'];
    if (!allowed.includes(nextStatus)) return res.status(400).json({ message: 'Invalid request status' });
    const value = await CollectorRequest.findById(req.params.id);
    if (!value) return res.status(404).json({ message: 'Mobile request not found' });
    value.status = nextStatus; value.history.push({ status: nextStatus, at: new Date(), note: req.body?.note }); await value.save();
    res.json(value);
  } catch (error) { res.status(500).json({ message: 'Failed to update mobile request' }); }
};
exports.getListings = async (_req, res) => { try { res.json(await MarketplaceListing.find().sort({ createdAt: -1 }).limit(100).lean()); } catch (error) { res.status(500).json({ message: 'Failed to load mobile listings' }); } };
exports.updateListing = async (req, res) => { try { if (!['approved', 'rejected', 'sold'].includes(req.body?.status)) return res.status(400).json({ message: 'Invalid listing status' }); const value = await MarketplaceListing.findById(req.params.id); if (!value) return res.status(404).json({ message: 'Mobile listing not found' }); const wasApproved = value.status === 'approved'; value.status = req.body.status; await value.save(); if (value.status === 'approved' && !wasApproved) { const searches = await SavedSearch.find({ alertsEnabled: true }); const title = String(value.item?.title || '').toLowerCase(); const notifications = searches.filter(search => { const filters = Object.fromEntries(search.filters || []); const needle = String(filters.search || '').trim().toLowerCase(); return (!needle || title.includes(needle)) && (!filters.metal || String(value.item?.attributes?.metal || '').toLowerCase() === String(filters.metal).toLowerCase()); }).map(search => ({ ownerId: search.ownerId, title: 'Новый предмет по вашему поиску', body: value.item?.title || 'Появилось новое объявление', target: { kind: 'listing', id: String(value._id) } })); if (notifications.length) await Notification.insertMany(notifications); } res.json(value); } catch (error) { res.status(500).json({ message: 'Failed to update mobile listing' }); } };
exports.getSellers = async (_req, res) => { try { const items = await CollectorUser.find().select('name email phone phoneVerified identityVerified createdAt').sort({ createdAt: -1 }).limit(200).lean(); res.json({ items }); } catch (error) { res.status(500).json({ message: 'Failed to load sellers' }); } };
exports.updateSellerVerification = async (req, res) => { try { const value = await CollectorUser.findByIdAndUpdate(req.params.id, { phoneVerified: Boolean(req.body?.phoneVerified), identityVerified: Boolean(req.body?.identityVerified) }, { new: true }).select('name email phone phoneVerified identityVerified'); if (!value) return res.status(404).json({ message: 'Seller not found' }); res.json(value); } catch (error) { res.status(500).json({ message: 'Failed to update seller verification' }); } };

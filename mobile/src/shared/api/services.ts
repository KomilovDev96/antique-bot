import { z } from 'zod';
import { api } from './client';
import { queryString } from './transport';
import { assistantMessageSchema, categorySchema, coinCatalogSchema, coinSchema, denominationSchema, identificationSchema, itemSchema, listingSchema, marketplaceMessageSchema, mediaSchema, notificationSchema, pageSchema, quoteSchema, requestSchema, rulerSchema, savedSearchSchema, sessionSchema, sourceSchema, statisticsSchema, supportMessageSchema, supportTicketSchema, userSchema, type IdentificationRequest, type ItemFilters } from '../../entities/types';
const ok = z.object({ success: z.boolean() });
const id = (value: string) => encodeURIComponent(value);
const json = (body: unknown, method = 'POST') => ({ method, body });
export const authApi = {
  login: (body: { email: string; password: string }) => api.request('/auth/login', sessionSchema, { ...json(body), authenticated: false }),
  register: (body: { email: string; password: string }) => api.request('/auth/register', sessionSchema, { ...json(body), authenticated: false }),
  verify: (body: { challengeId: string; code: string }) => api.request('/auth/verify-email', sessionSchema, { ...json(body), authenticated: false }),
  resend: (challengeId: string) => api.request('/auth/resend-verification', ok, { ...json({ challengeId }), authenticated: false }),
  changeEmail: (challengeId: string, email: string) => api.request('/auth/change-email', z.object({ challengeId: z.string(), email: z.string() }), { ...json({ challengeId, email }), authenticated: false }),
  forgot: (email: string) => api.request('/auth/forgot-password', ok, { ...json({ email }), authenticated: false }),
  reset: (token: string, password: string) => api.request('/auth/reset-password', ok, { ...json({ token, password }), authenticated: false }),
  logout: (refreshToken: string) => api.request('/auth/logout', ok, json({ refreshToken })),
};
export const catalogApi = {
  categories: (signal?: AbortSignal) => api.request('/categories', z.array(categorySchema), { authenticated: false, signal }),
  search: (search: string, cursor?: string, signal?: AbortSignal) => api.request(`/catalog${queryString({ search, cursor, limit: 20 })}`, pageSchema(itemSchema), { authenticated: false, signal }),
  coinCatalogs: (signal?: AbortSignal) => api.request('/coin-catalogs', z.array(coinCatalogSchema), { authenticated: false, signal }),
  coinCatalog: (slug: string, signal?: AbortSignal) => api.request(`/coin-catalogs/${encodeURIComponent(slug)}`, coinCatalogSchema, { authenticated: false, signal }),
  rulers: (slug: string, signal?: AbortSignal) => api.request(`/coin-catalogs/${encodeURIComponent(slug)}/rulers`, z.array(rulerSchema), { authenticated: false, signal }),
  denominations: (slug: string, ruler?: string, signal?: AbortSignal) => api.request(`/coin-catalogs/${encodeURIComponent(slug)}/denominations${queryString({ ruler })}`, z.array(denominationSchema), { authenticated: false, signal }),
  coins: (slug: string, filters: { ruler?: string; denomination?: string; search?: string } = {}, signal?: AbortSignal) => api.request(`/coin-catalogs/${encodeURIComponent(slug)}/coins${queryString(filters)}`, z.array(coinSchema), { authenticated: false, signal }),
  coin: (slug: string, coinSlug: string, signal?: AbortSignal) => api.request(`/coin-catalogs/${encodeURIComponent(slug)}/coins/${encodeURIComponent(coinSlug)}`, coinSchema, { authenticated: false, signal }),
};
export const collectionApi = {
  list: (filters: ItemFilters = {}, cursor?: string, signal?: AbortSignal) => api.request(`/collection${queryString({ ...filters, cursor, limit: 20 })}`, pageSchema(itemSchema), { signal }),
  get: (itemId: string, signal?: AbortSignal) => api.request(`/collection/${id(itemId)}`, itemSchema, { signal }),
  create: (body: unknown, key: string) => api.request('/collection', itemSchema, { ...json(body), idempotencyKey: key }),
  update: (itemId: string, body: unknown) => api.request(`/collection/${id(itemId)}`, itemSchema, json(body, 'PATCH')),
  delete: (itemId: string) => api.request(`/collection/${id(itemId)}`, ok, { method: 'DELETE' }),
  statistics: (signal?: AbortSignal) => api.request('/collection/statistics', statisticsSchema, { signal }),
};
export const marketplaceApi = {
  list: (filters: ItemFilters = {}, cursor?: string, signal?: AbortSignal) => api.request(`/marketplace${queryString({ ...filters, cursor, limit: 20 })}`, pageSchema(listingSchema), { authenticated: false, signal }),
  get: (listingId: string, signal?: AbortSignal) => api.request(`/marketplace/${id(listingId)}`, listingSchema, { authenticated: false, signal }),
  create: (body: unknown, key: string) => api.request('/marketplace', listingSchema, { ...json(body), idempotencyKey: key }),
  purchase: (listingId: string, key: string) => api.request(`/marketplace/${id(listingId)}/purchase-requests`, requestSchema, { ...json({}), idempotencyKey: key }),
  contact: (listingId: string, text: string, key: string) => api.request(`/marketplace/${id(listingId)}/messages`, marketplaceMessageSchema, { ...json({ text }), idempotencyKey: key }),
  messages: (listingId: string, signal?: AbortSignal) => api.request(`/marketplace/${id(listingId)}/messages`, z.array(marketplaceMessageSchema), { signal }),
  quotes: (signal?: AbortSignal) => api.request('/metals/quotes', z.array(quoteSchema), { authenticated: false, signal }),
  metalValue: (body: unknown) => api.request('/metals/valuation', z.object({ value: z.object({ amount: z.string(), currency: z.string() }), asOf: z.string(), source: sourceSchema }), json(body)),
};
export const identificationApi = {
  create: (body: IdentificationRequest, key: string) => api.request('/identifications', identificationSchema, { ...json(body), idempotencyKey: key }),
  get: (jobId: string, signal?: AbortSignal) => api.request(`/identifications/${id(jobId)}`, identificationSchema, { signal }),
  feedback: (jobId: string, candidateId: string | null, accepted: boolean) => api.request(`/identifications/${id(jobId)}/feedback`, ok, json({ candidateId, accepted })),
  web: (jobId: string) => api.request(`/identifications/${id(jobId)}/web-search`, identificationSchema, json({})),
};
export const requestsApi = {
  list: (kind?: string, cursor?: string, signal?: AbortSignal) => api.request(`/requests${queryString({ kind, cursor, limit: 20 })}`, pageSchema(requestSchema), { signal }),
  get: (requestId: string, signal?: AbortSignal) => api.request(`/requests/${id(requestId)}`, requestSchema, { signal }),
  create: (body: unknown, key: string) => api.request('/requests', requestSchema, { ...json(body), idempotencyKey: key }),
};
export const assistantApi = {
  history: (cursor?: string, signal?: AbortSignal) => api.request(`/assistant/messages${queryString({ cursor, limit: 30 })}`, pageSchema(assistantMessageSchema), { signal }),
  send: (text: string, key: string, itemId?: string) => api.request('/assistant/messages', assistantMessageSchema, { ...json({ text, itemId }), idempotencyKey: key }),
};
export const profileApi = { get: (signal?: AbortSignal) => api.request('/profile', userSchema, { signal }), update: (body: unknown) => api.request('/profile', userSchema, json(body, 'PATCH')), linkTelegram: (code: string) => api.request('/profile/link-telegram', userSchema, json({ code })) };
export const notificationsApi = {
  list: (cursor?: string, signal?: AbortSignal) => api.request(`/notifications${queryString({ cursor, limit: 20 })}`, pageSchema(notificationSchema), { signal }),
  read: (notificationId: string) => api.request(`/notifications/${id(notificationId)}`, ok, json({ read: true }, 'PATCH')),
  register: (body: { token: string; platform: string }) => api.request('/notifications/devices', ok, json(body)),
  unregister: (token: string) => api.request('/notifications/devices', ok, json({ token }, 'DELETE')),
};
export const savedSearchApi = {
  list: (signal?: AbortSignal) => api.request('/saved-searches', z.array(savedSearchSchema), { signal }),
  create: (name: string, filters: ItemFilters) => api.request('/saved-searches', savedSearchSchema, json({ name, filters })),
  remove: (searchId: string) => api.request(`/saved-searches/${id(searchId)}`, ok, { method: 'DELETE' }),
};
export const supportApi = {
  list: (signal?: AbortSignal) => api.request('/support', pageSchema(supportTicketSchema), { signal }),
  create: (subject: string, phone: string, message: string) => api.request('/support', z.object({ ticket: supportTicketSchema, message: supportMessageSchema }), json({ subject, phone, message })),
  messages: (ticketId: string, signal?: AbortSignal) => api.request(`/support/${id(ticketId)}/messages`, z.object({ ticket: supportTicketSchema, items: z.array(supportMessageSchema) }), { signal }),
  reply: (ticketId: string, message: string) => api.request(`/support/${id(ticketId)}/messages`, z.object({ ticket: supportTicketSchema, message: supportMessageSchema }), json({ message })),
};
export const mediaApi = { upload: (form: FormData) => api.request('/media', mediaSchema, { method: 'POST', form }) };

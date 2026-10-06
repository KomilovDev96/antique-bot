import { z } from 'zod';

export const sourceSchema = z.object({ title: z.string(), url: z.string().url(), domain: z.string(), description: z.string().optional(), publishedAt: z.string().optional() });
export type Source = z.infer<typeof sourceSchema>;
export const attributeDefinitionSchema = z.object({ key: z.string(), label: z.string(), type: z.enum(['text', 'number', 'select']), unit: z.string().optional(), required: z.boolean().default(false), options: z.array(z.string()).optional() });
export type AttributeDefinition = z.infer<typeof attributeDefinitionSchema>;
export const categorySchema = z.object({ id: z.string(), parentId: z.string().nullable(), name: z.string(), slug: z.string(), attributes: z.array(attributeDefinitionSchema), metal: z.enum(['gold', 'silver']).optional() });
export type Category = z.infer<typeof categorySchema>;
export const attributesSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]));
export const mediaSchema = z.object({ id: z.string(), url: z.string().url(), kind: z.enum(['image', 'video', 'document']).default('image') });
export type Media = z.infer<typeof mediaSchema>;
export const moneySchema = z.object({ amount: z.string(), currency: z.string() });
export type Money = z.infer<typeof moneySchema>;
export const coinCatalogSchema = z.object({ id: z.string(), slug: z.string(), title: z.string(), subtitle: z.string().optional(), period: z.string().optional(), country: z.string().optional(), coverUrl: z.string().url().optional(), rulerCount: z.number(), coinCount: z.number() });
export type CoinCatalog = z.infer<typeof coinCatalogSchema>;
export const rulerSchema = z.object({ slug: z.string(), name: z.string(), years: z.string().optional(), portraitUrl: z.string().url().optional() });
export type CatalogRuler = z.infer<typeof rulerSchema>;
export const denominationSchema = z.object({ slug: z.string(), label: z.string(), metal: z.string().optional(), imageUrls: z.array(z.string().url()).optional() });
export type CoinDenomination = z.infer<typeof denominationSchema>;
export const coinSchema = z.object({ slug: z.string(), title: z.string(), ruler: z.string(), denomination: z.string(), year: z.string().optional(), mint: z.string().optional(), metal: z.string().optional(), weight: z.string().optional(), diameter: z.string().optional(), mintage: z.string().optional(), grade: z.string().optional(), description: z.string().optional(), imageUrl: z.string().url().optional(), imageUrls: z.array(z.string().url()).optional(), price: moneySchema.optional() });
export type CatalogCoin = z.infer<typeof coinSchema>;
export const userSchema = z.object({ id: z.string(), name: z.string(), email: z.string().email(), emailVerified: z.boolean(), avatarUrl: z.string().url().optional(), categoryIds: z.array(z.string()) });
export type User = z.infer<typeof userSchema>;
export const tokensSchema = z.object({ accessToken: z.string().min(1), refreshToken: z.string().min(1) });
export const sessionSchema = tokensSchema.extend({ user: userSchema, verificationChallengeId: z.string().optional() });
export type Session = z.infer<typeof sessionSchema>;
export const itemSchema = z.object({
  id: z.string(), collectionCode: z.string().optional(), title: z.string(), categoryId: z.string(), categoryName: z.string(),
  photos: z.array(mediaSchema), year: z.string().optional(), country: z.string().optional(), material: z.string().optional(),
  condition: z.string().optional(), rarity: z.string().optional(), description: z.string().optional(), history: z.string().optional(),
  provenance: z.string().optional(), notes: z.string().optional(), purchaseInfo: z.string().optional(), attributes: attributesSchema,
  favorite: z.boolean().default(false), estimatedValue: moneySchema.optional(), metalValue: moneySchema.optional(),
  sources: z.array(sourceSchema), createdAt: z.string(), aiSummary: z.string().optional(),
});
export type CollectionItem = z.infer<typeof itemSchema>;
export type CatalogItem = Omit<CollectionItem, 'notes' | 'purchaseInfo' | 'favorite' | 'collectionCode'>;
export const listingSchema = itemSchema.extend({ price: moneySchema, priceType: z.enum(['fixed', 'negotiable']), seller: z.object({ id: z.string(), name: z.string(), verified: z.boolean() }), location: z.string(), status: z.enum(['pending', 'approved', 'rejected', 'sold']) });
export type MarketplaceListing = z.infer<typeof listingSchema>;
export const marketplaceMessageSchema = z.object({ id: z.string(), listingId: z.string(), senderId: z.string(), recipientId: z.string(), text: z.string(), read: z.boolean(), createdAt: z.string() });
export type MarketplaceMessage = z.infer<typeof marketplaceMessageSchema>;
export const savedSearchSchema = z.object({ id: z.string(), name: z.string(), filters: z.record(z.string(), z.unknown()), alertsEnabled: z.boolean(), createdAt: z.string() });
export type SavedSearch = z.infer<typeof savedSearchSchema>;
export const candidateSchema = z.object({ id: z.string(), item: itemSchema, confidence: z.number().min(0).max(1), reasons: z.array(z.string()), discrepancies: z.array(z.string()), origin: z.enum(['collection', 'catalog', 'web']) });
export type IdentificationCandidate = z.infer<typeof candidateSchema>;
export const identificationSchema = z.object({ id: z.string(), status: z.enum(['queued', 'reading_image', 'searching_collection', 'searching_catalog', 'comparing', 'checking_sources', 'completed', 'failed']), candidates: z.array(candidateSchema), sources: z.array(sourceSchema), error: z.string().optional(), canSearchWeb: z.boolean().default(false) });
export type IdentificationResult = z.infer<typeof identificationSchema>;
export type IdentificationRequest = { mediaIds: string[]; description?: string; allowWeb: boolean };
export const requestSchema = z.object({ id: z.string(), kind: z.enum(['purchase', 'sale', 'inspection', 'buy']), title: z.string(), status: z.enum(['pending', 'received', 'in_review', 'needs_information', 'verified', 'approved', 'rejected', 'completed']), createdAt: z.string(), description: z.string().optional(), attributes: attributesSchema.optional(), history: z.array(z.object({ status: z.string(), at: z.string(), note: z.string().optional() })), inspectionResult: z.object({ examiner: z.string(), conclusion: z.string(), issuedAt: z.string(), documents: z.array(mediaSchema) }).optional() });
export type CollectorRequest = z.infer<typeof requestSchema>;
export type PurchaseRequest = CollectorRequest & { kind: 'purchase' };
export type SaleRequest = CollectorRequest & { kind: 'sale' };
export type InspectionRequest = CollectorRequest & { kind: 'inspection' };
export const assistantMessageSchema = z.object({ id: z.string(), role: z.enum(['user', 'assistant']), text: z.string(), itemIds: z.array(z.string()).default([]), sources: z.array(sourceSchema).default([]), createdAt: z.string() });
export type AssistantMessage = z.infer<typeof assistantMessageSchema>;
export const notificationSchema = z.object({ id: z.string(), title: z.string(), body: z.string(), read: z.boolean(), createdAt: z.string(), target: z.object({ kind: z.enum(['item', 'request', 'identification', 'listing', 'support']), id: z.string() }).optional() });
export type Notification = z.infer<typeof notificationSchema>;
export const supportTicketSchema = z.object({ id: z.string(), subject: z.string(), phone: z.string().default(''), status: z.enum(['open', 'waiting_user', 'waiting_admin', 'closed']), lastMessage: z.string(), lastMessageAt: z.string(), unreadForAdmin: z.number().default(0), unreadForUser: z.number().default(0) });
export type SupportTicket = z.infer<typeof supportTicketSchema>;
export const supportMessageSchema = z.object({ id: z.string(), ticketId: z.string(), senderRole: z.enum(['user', 'admin']), senderId: z.string(), text: z.string(), createdAt: z.string() });
export type SupportMessage = z.infer<typeof supportMessageSchema>;
export const statisticsSchema = z.object({ total: z.number(), categories: z.number(), countries: z.number(), activeRequests: z.number(), goldWeightGrams: z.string().optional(), silverWeightGrams: z.string().optional(), mostCollected: z.string().optional() });
export const quoteSchema = z.object({ metal: z.enum(['gold', 'silver']), perGram: moneySchema, perTroyOunce: moneySchema, changePercent: z.number(), asOf: z.string(), source: sourceSchema });
export type MetalQuote = z.infer<typeof quoteSchema>;
export function pageSchema<T extends z.ZodType>(schema: T) { return z.object({ items: z.array(schema), nextCursor: z.string().nullable(), total: z.number().optional() }); }
export type ItemFilters = { search?: string; categoryId?: string; yearFrom?: string; yearTo?: string; country?: string; material?: string; favorite?: boolean; sort?: string; metal?: string; fineness?: string; weightMin?: string; weightMax?: string; priceMin?: string; priceMax?: string; form?: string; manufacturer?: string };

import { describe, expect, it } from 'vitest';
import { registerSchema, listingInputSchema } from '../src/shared/lib/validation';
import { categorySchema, identificationSchema, mediaSchema } from '../src/entities/types';
import { safeExternalUrl } from '../src/shared/lib/format';
describe('domain constraints', () => {
  it('requires matching sufficiently long passwords', () => {
    expect(registerSchema.safeParse({ email: 'a@b.com', password: 'short', confirmPassword: 'short' }).success).toBe(false);
    expect(registerSchema.safeParse({ email: 'a@b.com', password: 'long-password-123', confirmPassword: 'different' }).success).toBe(false);
  });
  it('does not require metal attributes on unrelated categories', () => expect(categorySchema.parse({ id: 'art', name: 'Картины', slug: 'art', parentId: null, attributes: [] }).attributes).toEqual([]));
  it('accepts categories introduced by the backend without mobile code changes', () => expect(categorySchema.safeParse({ id: 'new', name: 'Новая категория', slug: 'new', parentId: null, attributes: [{ key: 'dimension', label: 'Размер', type: 'number' }] }).success).toBe(true));
  it('normalizes default media kind', () => expect(mediaSchema.parse({ id: 'photo', url: 'https://example.test/a.jpg' }).kind).toBe('image'));
  it('rejects impossible confidence values', () => expect(identificationSchema.safeParse({ id: 'job', status: 'completed', candidates: [{ confidence: 91 }], sources: [] }).success).toBe(false));
  it('blocks unsafe source URLs', () => { expect(safeExternalUrl('javascript:alert(1)')).toBeNull(); expect(safeExternalUrl('file:///etc/passwd')).toBeNull(); expect(safeExternalUrl('https://museum.example/item')).toBe('https://museum.example/item'); });
  it('rejects zero or negative sale prices', () => { const item = { title: 'Coin', categoryId: 'coin', description: '', year: '', country: '', condition: '', notes: '', material: '', currency: 'USD', location: 'Tashkent', priceType: 'fixed', contactPreference: 'in_app' }; for (const price of ['0', '-10', 'free']) expect(listingInputSchema.safeParse({ ...item, price }).success).toBe(false); });
});

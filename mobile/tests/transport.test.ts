import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ApiClient, ApiError, queryString } from '../src/shared/api/transport';
const schema = z.object({ value: z.string() });
const response = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
describe('API boundary', () => {
  it('does not send credentials on public requests', async () => {
    const fetcher = vi.fn().mockResolvedValue(response(200, { value: 'ok' })) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
    const client = new ApiClient('https://example.test/api', { token: () => 'secret', refresh: vi.fn(), expired: vi.fn() }, fetcher);
    await client.request('/categories', schema, { authenticated: false });
    expect(fetcher.mock.calls[0][1]?.headers).not.toHaveProperty('Authorization');
  });
  it('rejects private requests without a session before making a network call', async () => {
    const fetcher = vi.fn(); const client = new ApiClient('https://example.test', { token: () => null, refresh: vi.fn(), expired: vi.fn() }, fetcher);
    await expect(client.request('/collection', schema)).rejects.toMatchObject({ status: 401 }); expect(fetcher).not.toHaveBeenCalled();
  });
  it('refreshes concurrent expired requests once and retries with the new token', async () => {
    let token = 'old'; const refresh = vi.fn(async () => { await new Promise(r => setTimeout(r, 5)); token = 'new'; return token; });
    const fetcher = vi.fn(async (_url: RequestInfo | URL, options?: RequestInit) => (options?.headers as Record<string, string>).Authorization === 'Bearer old' ? response(401, {}) : response(200, { value: 'ok' })) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
    const client = new ApiClient('https://example.test', { token: () => token, refresh, expired: vi.fn() }, fetcher);
    const result = await Promise.all([client.request('/a', schema), client.request('/b', schema)]);
    expect(result).toEqual([{ value: 'ok' }, { value: 'ok' }]); expect(refresh).toHaveBeenCalledTimes(1);
  });
  it('invalidates revoked refresh tokens', async () => {
    const expired = vi.fn(); const client = new ApiClient('https://example.test', { token: () => 'old', refresh: async () => { throw new ApiError(401, 'REVOKED', 'revoked'); }, expired }, async () => response(401, {}));
    await expect(client.request('/a', schema)).rejects.toMatchObject({ status: 401 }); expect(expired).toHaveBeenCalled();
  });
  it('keeps the session when refresh fails due to network loss', async () => {
    const expired = vi.fn(); const client = new ApiClient('https://example.test', { token: () => 'old', refresh: async () => { throw new ApiError(0, 'NETWORK', 'offline'); }, expired }, async () => response(401, {}));
    await expect(client.request('/a', schema)).rejects.toMatchObject({ code: 'NETWORK' }); expect(expired).not.toHaveBeenCalled();
  });
  it('rejects malformed successful responses', async () => {
    const client = new ApiClient('https://example.test', { token: () => 'a', refresh: vi.fn(), expired: vi.fn() }, async () => response(200, { unexpected: true }));
    await expect(client.request('/a', schema)).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });
  it('keeps idempotency keys when replaying a request after refresh', async () => {
    let token = 'old'; const fetcher = vi.fn(async (_url: RequestInfo | URL, options?: RequestInit) => (options?.headers as Record<string, string>).Authorization === 'Bearer old' ? response(401, {}) : response(200, { value: 'ok' })) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
    const client = new ApiClient('https://example.test', { token: () => token, refresh: async () => token = 'new', expired: vi.fn() }, fetcher);
    await client.request('/sale', schema, { method: 'POST', body: { title: 'Coin' }, idempotencyKey: 'sale-1' });
    for (const call of fetcher.mock.calls) expect(call[1]?.headers).toHaveProperty('Idempotency-Key', 'sale-1');
  });
  it('encodes filters and keeps false and zero', () => expect(queryString({ search: 'gold & silver', min: 0, favorite: false, unused: undefined })).toBe('?search=gold+%26+silver&min=0&favorite=false'));
});

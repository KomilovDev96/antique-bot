import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ClaudeProvider, answerAboutCollection } from '../server-integration/claude-provider';
describe('server-only Claude integration', () => {
  it('does not allow missing model or credentials', () => expect(() => new ClaudeProvider({ apiKey: '', model: '' })).toThrow('not configured'));
  it('validates structured output and records actual token usage', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ content: [{ type: 'text', text: '{"title":"Coin"}' }], usage: { input_tokens: 20, output_tokens: 8 }, stop_reason: 'end_turn' }))) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
    const provider = new ClaudeProvider({ apiKey: 'test-only', model: 'test-model' }, fetcher);
    const result = await provider.json('Identify', 'Object', z.object({ title: z.string() }));
    expect(result).toEqual({ data: { title: 'Coin' }, usage: { inputTokens: 20, outputTokens: 8 } });
    expect(fetcher.mock.calls[0][0]).toBe('https://api.anthropic.com/v1/messages');
  });
  it('does not expose provider error bodies', async () => {
    const provider = new ClaudeProvider({ apiKey: 'test-only', model: 'test-model' }, async () => new Response('sensitive-provider-error', { status: 401 }));
    await expect(provider.json('', '', z.object({}))).rejects.toThrow('Claude request failed (401)');
  });
  it('uses authenticated owner scope and returns exact empty counts without a second model call', async () => {
    const provider = new ClaudeProvider({ apiKey: 'test-only', model: 'test-model' }, async () => new Response(JSON.stringify({ content: [{ type: 'text', text: '{"material":"silver"}' }], usage: { input_tokens: 10, output_tokens: 3 }, stop_reason: 'end_turn' })));
    const search = vi.fn().mockResolvedValue({ items: [], total: 0 });
    const result = await answerAboutCollection(provider, { searchMyCollection: search, getCollectionStatistics: async () => ({ total: 7, categories: 2 }) }, 'owner-1', 'Есть серебро?');
    expect(search).toHaveBeenCalledWith('owner-1', { material: 'silver' }, 12); expect(result.text).toContain('7'); expect(result.itemIds).toEqual([]);
  });
});

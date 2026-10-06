import { z } from 'zod';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); this.name = 'ApiError'; }
}
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Сессия завершена. Войдите снова.';
    if (error.status === 403) return 'У вас нет доступа к этому действию.';
    if (error.status === 404 || error.status === 501 || error.code === 'NOT_CONFIGURED') return 'Этот сервис пока недоступен. Попробуйте позже.';
    if (error.status === 429) return 'Слишком много запросов. Подождите немного.';
    if (error.code === 'NETWORK') return 'Нет связи с сервером. Проверьте подключение.';
    if (error.code === 'TIMEOUT') return 'Сервер не ответил вовремя. Попробуйте ещё раз.';
    if (error.code === 'INVALID_RESPONSE') return 'Не удалось прочитать ответ сервера.';
    if (error.status >= 500) return 'Сервис временно недоступен. Попробуйте позже.';
    return error.message;
  }
  return 'Не удалось выполнить действие. Попробуйте ещё раз.';
}
type AuthHooks = { token: () => string | null; refresh: () => Promise<string>; expired: () => Promise<void> };
type RequestOptions = { method?: string; body?: unknown; signal?: AbortSignal; authenticated?: boolean; idempotencyKey?: string; form?: FormData };
export class ApiClient {
  private refreshing: Promise<string> | null = null;
  constructor(private baseUrl: string, private hooks: AuthHooks, private fetcher: typeof fetch = fetch) {}
  async request<S extends z.ZodTypeAny>(path: string, schema: S, options: RequestOptions = {}, retried = false): Promise<z.output<S>> {
    if (!this.baseUrl) throw new ApiError(0, 'NOT_CONFIGURED', 'Сервис пока недоступен');
    const controller = new AbortController();
    const abort = () => controller.abort(options.signal?.reason);
    if (options.signal?.aborted) abort();
    options.signal?.addEventListener('abort', abort, { once: true });
    const timeout = setTimeout(() => controller.abort(), 20000);
    const token = options.authenticated === false ? null : this.hooks.token();
    if (options.authenticated !== false && !token) {
      clearTimeout(timeout); options.signal?.removeEventListener('abort', abort);
      throw new ApiError(401, 'UNAUTHENTICATED', 'Войдите в аккаунт');
    }
    let response: Response;
    try {
      response = await this.fetcher(`${this.baseUrl.replace(/\/$/, '')}${path}`, {
        method: options.method ?? 'GET', signal: controller.signal,
        headers: { Accept: 'application/json', ...(options.form ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}) },
        body: options.form ?? (options.body === undefined ? undefined : JSON.stringify(options.body)),
      });
    } catch {
      if (options.signal?.aborted) throw new ApiError(0, 'CANCELLED', 'Запрос отменён');
      throw new ApiError(0, controller.signal.aborted ? 'TIMEOUT' : 'NETWORK', 'Ошибка соединения');
    } finally { clearTimeout(timeout); options.signal?.removeEventListener('abort', abort); }
    if (response.status === 401 && token && !retried) {
      // A concurrent request may already have rotated the token.
      if (this.hooks.token() === token) {
        if (!this.refreshing) this.refreshing = this.hooks.refresh().finally(() => { this.refreshing = null; });
        try { await this.refreshing; }
        catch (error) { if (error instanceof ApiError && [400, 401, 403].includes(error.status)) await this.hooks.expired(); throw error; }
      }
      return this.request(path, schema, options, true);
    }
    if (response.status === 401 && retried) await this.hooks.expired();
    const data: unknown = response.status === 204 ? {} : await response.json().catch(() => null);
    if (!response.ok) {
      const parsed = z.object({ code: z.string().optional(), message: z.string().optional() }).safeParse(data);
      throw new ApiError(response.status, parsed.success ? parsed.data.code ?? 'API_ERROR' : 'API_ERROR', parsed.success ? parsed.data.message ?? 'Ошибка запроса' : 'Ошибка запроса');
    }
    const parsed = schema.safeParse(data);
    if (!parsed.success) throw new ApiError(response.status, 'INVALID_RESPONSE', 'Неверный формат ответа');
    return parsed.data;
  }
}
export function queryString(values: Record<string, string | number | boolean | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); });
  const result = params.toString(); return result ? `?${result}` : '';
}

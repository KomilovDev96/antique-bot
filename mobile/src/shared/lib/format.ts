import type { Money } from '../../entities/types';
export function money(value?: Money) {
  if (!value) return 'Не указана';
  const amount = Number(value.amount);
  if (!Number.isFinite(amount)) return `${value.amount} ${value.currency}`;
  try { return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: value.currency, maximumFractionDigits: 2 }).format(amount); }
  catch { return `${value.amount} ${value.currency}`; }
}
export function date(value: string) { const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('ru-RU'); }
export function safeExternalUrl(value: string) { try { const url = new URL(value); return url.protocol === 'https:' ? url.toString() : null; } catch { return null; } }
export const statusLabels: Record<string, string> = { pending: 'Ожидает', received: 'Получена', in_review: 'На проверке', needs_information: 'Нужны сведения', verified: 'Проверено', approved: 'Одобрено', rejected: 'Отклонено', completed: 'Завершено', sold: 'Продано', replied: 'Получен ответ' };

export const featureNames = {
  auth: 'Авторизация', collection: 'Коллекция', catalog: 'Каталог', marketplace: 'Маркетплейс',
  ai_identification: 'AI-определение', ai_assistant: 'AI-помощник', requests: 'Заявки', support: 'Поддержка',
  notifications: 'Уведомления', saved_searches: 'Сохранённые поиски', profile: 'Профиль', other: 'Другое',
};

export const dateTime = value => value ? new Date(value).toLocaleString('ru-RU') : '—';
export const shortAgent = value => value ? (value.length > 72 ? `${value.slice(0, 72)}…` : value) : '—';

export const userColumns = [
  { title: 'Пользователь', key: 'user', fixed: 'left', width: 220, render: (_, row) => <span><strong>{row.name || 'Без имени'}</strong><br /><span style={{ color: '#8c8c8c' }}>{row.email}</span></span> },
  { title: 'Последний вход', dataIndex: 'lastLoginAt', width: 165, render: dateTime },
  { title: 'IP входа', dataIndex: 'lastLoginIp', width: 140, render: value => value || '—' },
  { title: 'Последняя активность', dataIndex: 'lastSeenAt', width: 175, render: dateTime },
  { title: 'IP активности', dataIndex: 'lastSeenIp', width: 140, render: value => value || '—' },
  { title: 'Входов', dataIndex: 'loginCount', width: 80, sorter: (a, b) => (a.loginCount || 0) - (b.loginCount || 0) },
  { title: 'Устройство', dataIndex: 'lastSeenUserAgent', width: 300, render: shortAgent },
];

export const activityColumns = [
  { title: 'Время', dataIndex: 'createdAt', width: 170, render: dateTime },
  { title: 'Пользователь', key: 'user', width: 220, render: (_, row) => row.user ? `${row.user.name || 'Без имени'} · ${row.user.email}` : String(row.userId) },
  { title: 'Функция', dataIndex: 'feature', width: 170, render: value => featureNames[value] || value },
  { title: 'Событие', dataIndex: 'event', width: 100 },
  { title: 'IP', dataIndex: 'ip', width: 140, render: value => value || '—' },
  { title: 'Устройство', dataIndex: 'userAgent', width: 300, render: shortAgent },
];

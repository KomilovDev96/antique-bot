import { Alert, Card, Col, Divider, Input, Row, Select, Space, Statistic, Table, Tag, Typography } from 'antd';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

const featureNames = {
  auth: 'Авторизация', collection: 'Коллекция', catalog: 'Каталог', marketplace: 'Marketplace',
  ai_identification: 'AI-определение', ai_assistant: 'AI-помощник', requests: 'Заявки', support: 'Поддержка',
  notifications: 'Уведомления', saved_searches: 'Сохранённые поиски', profile: 'Профиль', other: 'Другое',
};
const dateTime = value => value ? new Date(value).toLocaleString('ru-RU') : '—';
const shortAgent = value => value ? (value.length > 72 ? `${value.slice(0, 72)}…` : value) : '—';

export default function UsersAnalytics() {
  const [days, setDays] = useState(30);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const analytics = useQuery({ queryKey: ['adminAnalytics', days], queryFn: async () => (await axiosClient.get('/admin/analytics', { params: { days } })).data, refetchInterval: 30000 });
  const users = useQuery({ queryKey: ['adminUsers', status, search], queryFn: async () => (await axiosClient.get('/admin/users', { params: { status: status === 'all' ? undefined : status, search: search || undefined, inactiveDays: days } })).data, refetchInterval: 30000 });
  const summary = analytics.data?.summary || {};

  const userColumns = [
    { title: 'Пользователь', key: 'user', fixed: 'left', width: 220, render: (_, row) => <Space direction="vertical" size={0}><Typography.Text strong>{row.name || 'Без имени'}</Typography.Text><Typography.Text type="secondary">{row.email}</Typography.Text></Space> },
    { title: 'Последний вход', dataIndex: 'lastLoginAt', width: 165, render: dateTime },
    { title: 'IP входа', dataIndex: 'lastLoginIp', width: 140, render: value => value || '—' },
    { title: 'Последняя активность', dataIndex: 'lastSeenAt', width: 175, render: dateTime },
    { title: 'IP активности', dataIndex: 'lastSeenIp', width: 140, render: value => value || '—' },
    { title: 'Входов', dataIndex: 'loginCount', width: 80, sorter: (a, b) => (a.loginCount || 0) - (b.loginCount || 0) },
    { title: 'Устройство', dataIndex: 'lastSeenUserAgent', width: 300, render: shortAgent },
  ];
  const activityColumns = [
    { title: 'Время', dataIndex: 'createdAt', width: 170, render: dateTime },
    { title: 'Пользователь', key: 'user', width: 220, render: (_, row) => row.user ? `${row.user.name || 'Без имени'} · ${row.user.email}` : String(row.userId) },
    { title: 'Функция', dataIndex: 'feature', width: 170, render: value => featureNames[value] || value },
    { title: 'Событие', dataIndex: 'event', width: 100 },
    { title: 'IP', dataIndex: 'ip', width: 140, render: value => value || '—' },
    { title: 'Устройство', dataIndex: 'userAgent', width: 300, render: shortAgent },
  ];

  return <Space direction="vertical" size={18} style={{ width: '100%' }}>
    <Typography.Title level={2} style={{ margin: 0 }}>Пользователи и аналитика</Typography.Title>
    <Alert type="info" showIcon message="Здесь видны IP и технические данные активности. Пароли, JWT и refresh-токены намеренно не сохраняются и не отображаются." />
    {analytics.isError || users.isError ? <Alert type="error" showIcon message="Не удалось загрузить аналитику" description="Проверьте соединение с backend и обновите страницу." /> : null}
    <Row gutter={[12, 12]}>
      <Col xs={24} sm={12} lg={4}><Card><Statistic title="Всего пользователей" value={summary.totalUsers || 0} /></Card></Col>
      <Col xs={24} sm={12} lg={4}><Card><Statistic title="Активны за 24 часа" value={summary.active24h || 0} /></Card></Col>
      <Col xs={24} sm={12} lg={4}><Card><Statistic title="Активны за 7 дней" value={summary.active7d || 0} /></Card></Col>
      <Col xs={24} sm={12} lg={4}><Card><Statistic title="Активны за 30 дней" value={summary.active30d || 0} /></Card></Col>
      <Col xs={24} sm={12} lg={4}><Card><Statistic title="Никогда не входили" value={summary.neverLogged || 0} /></Card></Col>
      <Col xs={24} sm={12} lg={4}><Card><Statistic title={`Неактивны ${days} дн.`} value={summary.inactive || 0} /></Card></Col>
    </Row>
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={10}><Card title={`Самые используемые функции · ${days} дней`} loading={analytics.isLoading}><Table rowKey="feature" size="small" pagination={false} dataSource={analytics.data?.featureUsage || []} columns={[{ title: 'Функция', dataIndex: 'feature', render: value => featureNames[value] || value }, { title: 'Действий', dataIndex: 'count' }, { title: 'Уникальных пользователей', dataIndex: 'uniqueUsers' }]} /></Card></Col>
      <Col xs={24} lg={14}><Card title="IP-адреса с наибольшей активностью" loading={analytics.isLoading}><Table rowKey="ip" size="small" pagination={false} dataSource={analytics.data?.topIps || []} columns={[{ title: 'IP', dataIndex: 'ip' }, { title: 'Действий', dataIndex: 'count' }, { title: 'Пользователей', dataIndex: 'uniqueUsers' }, { title: 'Последняя активность', dataIndex: 'lastSeenAt', render: dateTime }]} /></Card></Col>
    </Row>
    <Card title="Все пользователи" extra={<Space wrap><Input allowClear placeholder="Имя, email или телефон" value={search} onChange={event => setSearch(event.target.value)} style={{ width: 230 }} /><Select value={status} onChange={setStatus} style={{ width: 180 }} options={[{ value: 'all', label: 'Все пользователи' }, { value: 'never', label: 'Никогда не входили' }, { value: 'inactive', label: `Неактивны ${days} дней` }]} /><Select value={days} onChange={setDays} style={{ width: 130 }} options={[7, 30, 90].map(value => ({ value, label: `${value} дней` }))} /></Space>}>
      <Table rowKey="_id" loading={users.isLoading} dataSource={users.data?.items || []} columns={userColumns} scroll={{ x: 1250 }} pagination={{ pageSize: 20, showTotal: total => `Всего: ${total}` }} />
    </Card>
    <Divider orientation="left">Последние события · {analytics.data?.totalEvents || 0} за период</Divider>
    <Table rowKey="_id" loading={analytics.isLoading} dataSource={analytics.data?.recentActivity || []} columns={activityColumns} scroll={{ x: 1150 }} pagination={{ pageSize: 20 }} />
  </Space>;
}

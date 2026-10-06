import { Alert, Card, Col, Row, Statistic, Space, Table, Tabs, Typography } from 'antd';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { activityColumns, dateTime, featureNames } from './analyticsShared';

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const analytics = useQuery({ queryKey: ['adminAnalytics', days], queryFn: async () => (await axiosClient.get('/admin/analytics', { params: { days } })).data, refetchInterval: 30000 });
  const summary = analytics.data?.summary || {};
  const overview = <Space direction="vertical" size={16} style={{ width: '100%' }}><Row gutter={[12, 12]}>
    <Col xs={24} sm={12} lg={6}><Card><Statistic title="Всего пользователей" value={summary.totalUsers || 0} /></Card></Col>
    <Col xs={24} sm={12} lg={6}><Card><Statistic title="Активны за 24 часа" value={summary.active24h || 0} /></Card></Col>
    <Col xs={24} sm={12} lg={6}><Card><Statistic title="Активны за 7 дней" value={summary.active7d || 0} /></Card></Col>
    <Col xs={24} sm={12} lg={6}><Card><Statistic title="Активны за 30 дней" value={summary.active30d || 0} /></Card></Col>
    <Col xs={24} sm={12} lg={6}><Card><Statistic title="Никогда не входили" value={summary.neverLogged || 0} /></Card></Col>
    <Col xs={24} sm={12} lg={6}><Card><Statistic title={`Неактивны ${days} дней`} value={summary.inactive || 0} /></Card></Col>
    <Col xs={24} sm={12} lg={6}><Card><Statistic title={`Событий за ${days} дней`} value={analytics.data?.totalEvents || 0} /></Card></Col>
  </Row><Card title="Динамика по дням"><Table rowKey="date" size="small" pagination={false} dataSource={analytics.data?.dailyActive || []} columns={[{ title: 'Дата', dataIndex: 'date' }, { title: 'Уникальных пользователей', dataIndex: 'uniqueUsers' }, { title: 'Событий', dataIndex: 'events' }]} /></Card></Space>;
  const features = <Card title={`Самые используемые функции за ${days} дней`}><Table rowKey="feature" pagination={false} dataSource={analytics.data?.featureUsage || []} columns={[{ title: 'Функция', dataIndex: 'feature', render: value => featureNames[value] || value }, { title: 'Действий', dataIndex: 'count' }, { title: 'Уникальных пользователей', dataIndex: 'uniqueUsers' }]} /></Card>;
  const ips = <Card title="IP-адреса с наибольшей активностью"><Table rowKey="ip" pagination={false} dataSource={analytics.data?.topIps || []} columns={[{ title: 'IP', dataIndex: 'ip' }, { title: 'Действий', dataIndex: 'count' }, { title: 'Пользователей', dataIndex: 'uniqueUsers' }, { title: 'Последняя активность', dataIndex: 'lastSeenAt', render: dateTime }]} /></Card>;
  const events = <Card title="Последние события"><Table rowKey="_id" dataSource={analytics.data?.recentActivity || []} columns={activityColumns} scroll={{ x: 1150 }} pagination={{ pageSize: 20 }} /></Card>;
  return <Space direction="vertical" size={18} style={{ width: '100%' }}>
    <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap><Typography.Title level={2} style={{ margin: 0 }}>Аналитика</Typography.Title><select value={days} onChange={event => setDays(Number(event.target.value))} style={{ padding: 8, borderRadius: 6, border: '1px solid #d9d9d9' }}>{[7, 30, 90].map(value => <option key={value} value={value}>{value} дней</option>)}</select></Space>
    <Alert type="info" showIcon message="Активность собирается с момента включения журнала. Исторические IP-адреса, которых не было в журнале, восстановить нельзя." />
    {analytics.isError ? <Alert type="error" showIcon message="Не удалось загрузить аналитику" /> : null}
    <Tabs defaultActiveKey="overview" items={[{ key: 'overview', label: 'Обзор', children: overview }, { key: 'features', label: 'Функции', children: features }, { key: 'ips', label: 'IP-адреса', children: ips }, { key: 'events', label: 'События', children: events }]} />
  </Space>;
}

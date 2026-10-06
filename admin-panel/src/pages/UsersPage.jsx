import { Alert, Card, Input, Select, Space, Table, Tabs, Typography } from 'antd';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { userColumns } from './analyticsShared';

export default function UsersPage() {
  const [tab, setTab] = useState('all');
  const [days, setDays] = useState(30);
  const [search, setSearch] = useState('');
  const users = useQuery({ queryKey: ['adminUsers', tab, search, days], queryFn: async () => (await axiosClient.get('/admin/users', { params: { status: tab === 'all' ? undefined : tab, search: search || undefined, inactiveDays: days } })).data, refetchInterval: 30000 });
  return <Space direction="vertical" size={18} style={{ width: '100%' }}>
    <Typography.Title level={2} style={{ margin: 0 }}>Пользователи</Typography.Title>
    <Alert type="info" showIcon message="IP-адреса, устройства и время активности доступны только администраторам. Пароли и токены не сохраняются." />
    {users.isError ? <Alert type="error" showIcon message="Не удалось загрузить пользователей" /> : null}
    <Card extra={<Space wrap><Input allowClear placeholder="Имя, email или телефон" value={search} onChange={event => setSearch(event.target.value)} style={{ width: 230 }} /><Select value={days} onChange={setDays} style={{ width: 130 }} options={[7, 30, 90].map(value => ({ value, label: `${value} дней` }))} /></Space>}>
      <Tabs activeKey={tab} onChange={setTab} items={[{ key: 'all', label: 'Все пользователи' }, { key: 'inactive', label: `Неактивные ${days} дней` }, { key: 'never', label: 'Никогда не входили' }]} />
      <Table rowKey="_id" loading={users.isLoading} dataSource={users.data?.items || []} columns={userColumns} scroll={{ x: 1250 }} pagination={{ pageSize: 20, showTotal: total => `Всего: ${total}` }} />
    </Card>
  </Space>;
}

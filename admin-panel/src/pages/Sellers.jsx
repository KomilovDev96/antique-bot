import { Button, Space, Switch, Table, Tag, message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";

export default function Sellers() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["sellers"], queryFn: async () => (await axiosClient.get("/admin/marketplace/sellers")).data, refetchInterval: 30000 });
  const update = useMutation({ mutationFn: ({ id, phoneVerified, identityVerified }) => axiosClient.patch(`/admin/marketplace/sellers/${id}/verification`, { phoneVerified, identityVerified }), onSuccess: () => { message.success("Проверка продавца обновлена"); queryClient.invalidateQueries({ queryKey: ["sellers"] }); } });
  return <Table rowKey="_id" loading={isLoading} dataSource={data?.items || []} pagination={{ pageSize: 20 }} columns={[{ title: "Имя", dataIndex: "name" }, { title: "Электронная почта", dataIndex: "email" }, { title: "Телефон", dataIndex: "phone", render: value => value || "—" }, { title: "Телефон подтверждён", dataIndex: "phoneVerified", render: (value, row) => <Switch checked={value} loading={update.isPending} onChange={checked => update.mutate({ id: row._id, phoneVerified: checked, identityVerified: row.identityVerified })} /> }, { title: "Личность подтверждена", dataIndex: "identityVerified", render: (value, row) => <Switch checked={value} loading={update.isPending} onChange={checked => update.mutate({ id: row._id, phoneVerified: row.phoneVerified, identityVerified: checked })} /> }, { title: "Статус", render: (_, row) => row.phoneVerified && row.identityVerified ? <Tag color="green">ПРОВЕРЕН</Tag> : <Tag>Не проверен</Tag> }, { title: "Действия", render: (_, row) => <Space><Button size="small" disabled={update.isPending} onClick={() => update.mutate({ id: row._id, phoneVerified: true, identityVerified: true })}>Подтвердить</Button></Space> }]} />;
}

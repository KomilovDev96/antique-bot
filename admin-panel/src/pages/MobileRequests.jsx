import { Button, Space, Table, Tag, message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";

const statuses = ["received", "in_review", "needs_information", "verified", "approved", "rejected", "completed"];
const statusLabels = { pending: "Ожидает", received: "Получена", in_review: "На проверке", needs_information: "Нужны сведения", verified: "Проверено", approved: "Одобрено", rejected: "Отклонено", completed: "Завершено" };
export default function MobileRequests() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["mobileRequests"], queryFn: async () => (await axiosClient.get("/admin/mobile-requests")).data, refetchInterval: 15000 });
  const update = useMutation({ mutationFn: ({ id, status }) => axiosClient.patch(`/admin/mobile-requests/${id}`, { status }), onSuccess: () => { message.success("Статус обновлён"); queryClient.invalidateQueries({ queryKey: ["mobileRequests"] }); } });
  const rows = data?.items || [];
  return <Table rowKey="_id" loading={isLoading} dataSource={rows} pagination={{ pageSize: 20 }} columns={[{ title: "Дата", dataIndex: "createdAt", render: value => new Date(value).toLocaleString("ru-RU") }, { title: "Тип", dataIndex: "kind", render: value => ({ purchase: "Покупка", sale: "Продажа", inspection: "Осмотр", buy: "Поиск покупки" }[value] || value) }, { title: "Предмет", dataIndex: "title" }, { title: "Описание", dataIndex: "description", ellipsis: true }, { title: "Статус", dataIndex: "status", render: value => <Tag color={value === "completed" || value === "approved" ? "green" : value === "rejected" ? "red" : "blue"}>{statusLabels[value] || value}</Tag> }, { title: "Действия", render: (_, row) => <Space wrap>{statuses.slice(0, 6).map(status => <Button key={status} size="small" disabled={row.status === status || update.isPending} onClick={() => update.mutate({ id: row._id, status })}>{statusLabels[status]}</Button>)}</Space> }]} />;
}

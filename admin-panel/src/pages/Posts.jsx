import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import {
  Table,
  Button,
  Tag,
  message,
  Select,
  Modal,
  Image,
  Space,
  Popconfirm,
} from "antd";
import {
  ReloadOutlined,
  DeleteOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from "@ant-design/icons";
import { useState } from "react";

export default function Posts() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [previewPost, setPreviewPost] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 8 });

  const { data: postsResp, isLoading, refetch } = useQuery({
    queryKey: ["posts", statusFilter, sortOrder, pagination.current, pagination.pageSize],
    queryFn: async () => {
      const res = await axiosClient.get("/admin/posts", {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          status: statusFilter !== "all" ? statusFilter : undefined,
          sort: sortOrder,
        },
      });
      return res.data;
    },
  });
  const posts = postsResp?.items || [];
  const total = postsResp?.total || 0;

  // Mutations
  const approveMutation = useMutation({
    mutationFn: async (id) => axiosClient.patch(`/admin/posts/${id}/approve`),
    onSuccess: () => {
      message.success("Объявление подтверждено ✅");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id) => axiosClient.patch(`/admin/posts/${id}/reject`),
    onSuccess: () => {
      message.error("Объявление отклонено ❌");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const soldMutation = useMutation({
    mutationFn: async (id) => axiosClient.patch(`/admin/posts/${id}/sold`),
    onSuccess: () => {
      message.success("Объявление отмечено как проданное");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => axiosClient.delete(`/admin/posts/${id}`),
    onSuccess: () => {
      message.success("Объявление удалено");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const columns = [
    { title: "Название", dataIndex: "title", key: "title" },
    { title: "Цена", dataIndex: "price", key: "price" },
    { title: "Город", dataIndex: "city", key: "city" },
    {
      title: "Дата",
      dataIndex: "createdAt",
      render: (val) => (val ? new Date(val).toLocaleString() : "-"),
    },
    {
      title: "Статус",
      dataIndex: "status",
      render: (text) => {
        const color =
          text === "approved"
            ? "green"
            : text === "pending"
            ? "orange"
            : text === "sold"
            ? "blue"
            : "red";
        return <Tag color={color}>{{ pending: "На проверке", approved: "Подтверждено", rejected: "Отклонено", sold: "Продано" }[text] || text}</Tag>;
      },
    },
    {
      title: "Действия",
      render: (_, record) => (
        <>
          <Button size="small" onClick={() => setPreviewPost(record)} style={{ marginRight: 8 }}>
            Просмотр
          </Button>
          <Button
            type="link"
            onClick={() => approveMutation.mutate(record._id)}
            disabled={record.status === "approved"}
          >
            Подтвердить
          </Button>
          <Button
            type="link"
            danger
            onClick={() => rejectMutation.mutate(record._id)}
            disabled={record.status === "rejected"}
          >
            Отклонить
          </Button>
          <Button
            type="link"
            onClick={() => soldMutation.mutate(record._id)}
            disabled={record.status === "sold"}
          >
            Отметить как проданное
          </Button>
          <Popconfirm
            title="Удалить объявление?"
            okText="Да"
            cancelText="Нет"
            onConfirm={() => deleteMutation.mutate(record._id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, flexWrap: "wrap" }}>
        <Select
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPagination((p) => ({ ...p, current: 1 }));
          }}
          options={[
            { label: "Все", value: "all" },
            { label: "На проверке", value: "pending" },
            { label: "Подтверждённые", value: "approved" },
            { label: "Отклонённые", value: "rejected" },
            { label: "Проданные", value: "sold" },
          ]}
          style={{ width: 200 }}
        />
        <Select
          value={sortOrder}
          onChange={(val) => {
            setSortOrder(val);
            setPagination((p) => ({ ...p, current: 1 }));
          }}
          options={[
            { label: (<span><SortDescendingOutlined /> Новые → старые</span>), value: "desc" },
            { label: (<span><SortAscendingOutlined /> Старые → новые</span>), value: "asc" },
          ]}
          style={{ width: 200 }}
        />
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => {
            queryClient.invalidateQueries(["posts"]);
            refetch();
            message.success("Данные обновлены!");
          }}
        >
          Обновить
        </Button>
      </Space>

      <Table
        loading={isLoading}
        rowKey="_id"
        columns={columns}
        dataSource={posts}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total,
          showSizeChanger: true,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
        }}
      />

      <Modal
        open={!!previewPost}
        onCancel={() => setPreviewPost(null)}
        title={previewPost?.title}
        footer={null}
        width={700}
      >
        {previewPost ? (
          <>
            <p><b>Состояние:</b> {previewPost.condition}</p>
            <p><b>Цена:</b> {previewPost.price}</p>
            <p><b>Город:</b> {previewPost.city}</p>
            <p><b>Контакт:</b> {previewPost.contact}</p>
            <p><b>Описание:</b> {previewPost.description}</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {previewPost.photos?.map((photo, idx) => {
                const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5000";
                const imgSrc = photo?.startsWith("http")
                  ? photo
                  : `${apiBase}/api/telegram/${photo}`;
                return (
                  <Image
                    key={idx}
                    src={imgSrc}
                    width={150}
                    height={150}
                    style={{ objectFit: "cover", borderRadius: 8 }}
                    alt="photo"
                  />
                );
              })}
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  );
}

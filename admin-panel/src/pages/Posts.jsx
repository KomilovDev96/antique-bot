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
      message.success("Tasdiqlandi ✅");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id) => axiosClient.patch(`/admin/posts/${id}/reject`),
    onSuccess: () => {
      message.error("Rad etildi ❌");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const soldMutation = useMutation({
    mutationFn: async (id) => axiosClient.patch(`/admin/posts/${id}/sold`),
    onSuccess: () => {
      message.success("Sotilgan deb belgilandi");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => axiosClient.delete(`/admin/posts/${id}`),
    onSuccess: () => {
      message.success("E'lon o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const columns = [
    { title: "Nomi", dataIndex: "title", key: "title" },
    { title: "Narx", dataIndex: "price", key: "price" },
    { title: "Shahar", dataIndex: "city", key: "city" },
    {
      title: "Sana",
      dataIndex: "createdAt",
      render: (val) => (val ? new Date(val).toLocaleString() : "-"),
    },
    {
      title: "Holat",
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
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Amallar",
      render: (_, record) => (
        <>
          <Button size="small" onClick={() => setPreviewPost(record)} style={{ marginRight: 8 }}>
            Ko'rish
          </Button>
          <Button
            type="link"
            onClick={() => approveMutation.mutate(record._id)}
            disabled={record.status === "approved"}
          >
            Tasdiqlash
          </Button>
          <Button
            type="link"
            danger
            onClick={() => rejectMutation.mutate(record._id)}
            disabled={record.status === "rejected"}
          >
            Rad etish
          </Button>
          <Button
            type="link"
            onClick={() => soldMutation.mutate(record._id)}
            disabled={record.status === "sold"}
          >
            Sotilgan deb belgilash
          </Button>
          <Popconfirm
            title="E'lonni o'chirish?"
            okText="Ha"
            cancelText="Yo'q"
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
            { label: "Barchasi", value: "all" },
            { label: "Kutilmoqda", value: "pending" },
            { label: "Tasdiqlangan", value: "approved" },
            { label: "Rad etilgan", value: "rejected" },
            { label: "Sotilgan", value: "sold" },
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
            { label: (<span><SortDescendingOutlined /> Yangi → eski</span>), value: "desc" },
            { label: (<span><SortAscendingOutlined /> Eski → yangi</span>), value: "asc" },
          ]}
          style={{ width: 200 }}
        />
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => {
            queryClient.invalidateQueries(["posts"]);
            refetch();
            message.success("Ma'lumotlar yangilandi!");
          }}
        >
          Yangilash
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
            <p><b>Holati:</b> {previewPost.condition}</p>
            <p><b>Narxi:</b> {previewPost.price}</p>
            <p><b>Shahar:</b> {previewPost.city}</p>
            <p><b>Kontakt:</b> {previewPost.contact}</p>
            <p><b>Tavsif:</b> {previewPost.description}</p>

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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import {
  Table,
  Tag,
  Image,
  Button,
  message,
  Space,
  Modal,
  Input,
} from "antd";
import { ReloadOutlined, CheckOutlined, MessageOutlined } from "@ant-design/icons";
import { useState } from "react";

export default function Orders() {
  const queryClient = useQueryClient();
  const [msgModal, setMsgModal] = useState({ visible: false, order: null });
  const [messageText, setMessageText] = useState("");

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await axiosClient.get("/admin/orders")).data,
  });

  const approveMutation = useMutation({
    mutationFn: (id) => axiosClient.patch(`/admin/orders/${id}/approve`),
    onSuccess: () => {
      message.success("Buyurtma kanalga joylandi ✅");
      queryClient.invalidateQueries(["orders"]);
    },
    onError: () => message.error("Xatolik: buyurtma joylanmadi"),
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ id, text }) =>
      axiosClient.post(`/admin/orders/${id}/message`, { text }),
    onSuccess: () => {
      message.success("Xabar yuborildi 💬");
      setMsgModal({ visible: false, order: null });
      setMessageText("");
    },
    onError: () => message.error("Xabar yuborilmadi"),
  });

  const handleSendMessage = () => {
    sendMessageMutation.mutate({
      id: msgModal.order._id,
      text: messageText,
    });
  };

  const columns = [
    {
      title: "🛍️ Narsa nomi",
      dataIndex: "itemName",
    },
    {
      title: "📄 Tavsif",
      dataIndex: "description",
      render: (t) => t || "-",
    },
    {
      title: "📸 Rasm",
      dataIndex: "photoPath",
      render: (photoPath) =>
        photoPath ? (
          <Image
            width={70}
            src={`https://api.telegram.org/file/bot${
              import.meta.env.VITE_BOT_TOKEN
            }/${photoPath}`}
          />
        ) : (
          <Tag color="default">Yo‘q</Tag>
        ),
    },
    {
      title: "👤 Foydalanuvchi",
      dataIndex: "username",
      render: (u, record) =>
        u ? (
          <a href={`https://t.me/${u}`} target="_blank">
            @{u}
          </a>
        ) : (
          record.contact
        ),
    },
    {
      title: "Holat",
      dataIndex: "status",
      render: (s) => (
        <Tag color={s === "approved" ? "green" : s === "rejected" ? "red" : "gold"}>
          {s === "approved"
            ? "Tasdiqlangan"
            : s === "rejected"
            ? "Rad etilgan"
            : "Kutilmoqda"}
        </Tag>
      ),
    },
    {
      title: "⚙️ Amal",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.status === "pending" && (
            <Button
              icon={<CheckOutlined />}
              type="primary"
              onClick={() => approveMutation.mutate(record._id)}
            >
              Tasdiqlash
            </Button>
          )}
          <Button
            icon={<MessageOutlined />}
            onClick={() => setMsgModal({ visible: true, order: record })}
          >
            Yozish
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            queryClient.invalidateQueries(["orders"]);
            refetch();
          }}
        >
          Yangilash
        </Button>
      </Space>

      <Table
        loading={isLoading}
        dataSource={orders}
        columns={columns}
        rowKey="_id"
      />

      {/* 💬 Модал для отправки сообщения */}
      <Modal
        title={`Xabar yuborish: @${msgModal.order?.username || "foydalanuvchi"}`}
        open={msgModal.visible}
        onCancel={() => setMsgModal({ visible: false, order: null })}
        onOk={handleSendMessage}
        okText="Yuborish"
      >
        <Input.TextArea
          rows={4}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Xabar matni..."
        />
      </Modal>
    </>
  );
}

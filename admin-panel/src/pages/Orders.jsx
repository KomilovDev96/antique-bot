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
      message.success("Заказ опубликован в канале ✅");
      queryClient.invalidateQueries(["orders"]);
    },
    onError: () => message.error("Ошибка: заказ не опубликован"),
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ id, text }) =>
      axiosClient.post(`/admin/orders/${id}/message`, { text }),
    onSuccess: () => {
      message.success("Сообщение отправлено 💬");
      setMsgModal({ visible: false, order: null });
      setMessageText("");
    },
    onError: () => message.error("Сообщение не отправлено"),
  });

  const handleSendMessage = () => {
    sendMessageMutation.mutate({
      id: msgModal.order._id,
      text: messageText,
    });
  };

  const columns = [
    {
      title: "🛍️ Название предмета",
      dataIndex: "itemName",
    },
    {
      title: "📄 Описание",
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
          <Tag color="default">Нет</Tag>
        ),
    },
    {
      title: "👤 Пользователь",
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
      title: "Статус",
      dataIndex: "status",
      render: (s) => (
        <Tag color={s === "approved" ? "green" : s === "rejected" ? "red" : "gold"}>
          {s === "approved"
            ? "Подтверждён"
            : s === "rejected"
            ? "Отклонён"
            : "Ожидает проверки"}
        </Tag>
      ),
    },
    {
      title: "⚙️ Действия",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.status === "pending" && (
            <Button
              icon={<CheckOutlined />}
              type="primary"
              onClick={() => approveMutation.mutate(record._id)}
            >
              Подтвердить
            </Button>
          )}
          <Button
            icon={<MessageOutlined />}
            onClick={() => setMsgModal({ visible: true, order: record })}
          >
            Написать
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
          Обновить
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
        title={`Сообщение: @${msgModal.order?.username || "пользователь"}`}
        open={msgModal.visible}
        onCancel={() => setMsgModal({ visible: false, order: null })}
        onOk={handleSendMessage}
        okText="Отправить"
      >
        <Input.TextArea
          rows={4}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Текст сообщения…"
        />
      </Modal>
    </>
  );
}

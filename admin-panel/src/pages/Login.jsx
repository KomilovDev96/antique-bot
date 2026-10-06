import { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import axiosClient from "../api/axiosClient";

export default function Login() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axiosClient.post("/auth/login", values);
      localStorage.setItem("token", res.data.token);
      message.success("Вход выполнен!");
      window.location.href = "/dashboard";
    } catch (err) {
      message.error(
        err.response?.data?.message || "Неверный логин или пароль"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
      }}
    >
      <Card title="🔐 Вход в админ-панель" style={{ width: 350 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            label="Логин"
            rules={[{ required: true, message: "Введите логин" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Пароль"
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
          >
            Войти
          </Button>
        </Form>
      </Card>
    </div>
  );
}

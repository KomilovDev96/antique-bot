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
      message.success("Tizimga kirildi!");
      window.location.href = "/dashboard";
    } catch (err) {
      message.error(
        err.response?.data?.message || "Login yoki parol noto‘g‘ri"
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
      <Card title="🔐 Admin Login" style={{ width: 350 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Login kiriting!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Parol"
            rules={[{ required: true, message: "Parol kiriting!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
          >
            Kirish
          </Button>
        </Form>
      </Card>
    </div>
  );
}

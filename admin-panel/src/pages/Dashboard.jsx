import { Layout, Menu, Button, Badge, Card, Col, Row, Space, Tag, Typography, notification } from "antd";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import Posts from "./Posts";
import Estimates from "./Estimates";
import Orders from "./Orders";
import MobileRequests from "./MobileRequests";
import Support from "./Support";
import Sellers from "./Sellers";
import UsersPage from "./UsersPage";
import AnalyticsPage from "./AnalyticsPage";

const { Header, Sider, Content } = Layout;

export default function Dashboard() {
  const [page, setPage] = useState("posts");
  const [noticeApi, noticeContext] = notification.useNotification();
  const previousUnread = useRef(0);

  const { data: supportUnread } = useQuery({ queryKey: ["supportUnread"], queryFn: async () => (await axiosClient.get("/admin/support/unread-count")).data.count, refetchInterval: 10000 });
  const telegramStatus = useQuery({ queryKey: ["telegramStatus"], queryFn: async () => (await axiosClient.get("/admin/telegram-status")).data, refetchInterval: 30000 });
  useEffect(() => {
    if (supportUnread > previousUnread.current && previousUnread.current !== 0) noticeApi.info({ message: "Новое обращение", description: "Пользователь написал в службу поддержки", placement: "topRight" });
    previousUnread.current = supportUnread || 0;
  }, [supportUnread, noticeApi]);

  const { data: pendingCount } = useQuery({
    queryKey: ["pendingPostsCount"],
    queryFn: async () => {
      const res = await axiosClient.get("/admin/posts", {
        params: { status: "pending", page: 1, limit: 1 },
      });
      return res.data?.total || 0;
    },
    refetchInterval: 15000,
  });

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const statusData = telegramStatus.data;
  const statusTag = (ok, label) => <Tag color={ok ? "success" : "error"}>{ok ? `✓ ${label}` : `✕ ${label}`}</Tag>;

  return (
    <>{noticeContext}<Layout className="admin-layout" style={{ minHeight: "100vh" }}>
      <Sider className="admin-sidebar" theme="light" width={250} style={{ position: "fixed", insetInlineStart: 0, top: 0, bottom: 0, height: "100vh", overflow: "auto", zIndex: 10, borderRight: "1px solid #f0f0f0" }}>
        <Menu
          mode="inline"
          defaultSelectedKeys={["posts"]}
          onClick={(e) => setPage(e.key)}
          items={[
            {
              key: "posts",
              label: (
                <span>
                  Объявления{" "}
                  {pendingCount > 0 ? (
                    <Badge
                      count={pendingCount}
                      size="small"
                      overflowCount={99}
                      style={{ backgroundColor: "#faad14", marginLeft: 6 }}
                    />
                  ) : null}
                </span>
              ),
            },
            { key: "estimate", label: "Запросы на оценку" },
            { key: "order", label: "Новые заказы" },
            { key: "mobile", label: "Заявки из приложения" },
            { key: "support", label: <span>Поддержка {supportUnread > 0 ? <Badge count={supportUnread} size="small" style={{ backgroundColor: "#f5222d", marginLeft: 6 }} /> : null}</span> },
            { key: "sellers", label: "Проверка продавцов" },
            { key: "users", label: "Пользователи" },
            { key: "analytics", label: "Аналитика" },
          ]}
        />
      </Sider>

      <Layout className="admin-content-layout" style={{ marginInlineStart: 250, minHeight: "100vh" }}>
        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#fff",
            background: "#001529",
            padding: "0 20px",
            height: 64,
            lineHeight: "64px",
          }}
        >
          <h1 style={{ margin: 0, color: "#fff", fontSize: 20, lineHeight: "28px", fontWeight: 600 }}>Админ-панель Antique AI</h1>
          <Button onClick={logout}>Выйти</Button>
        </Header>

        <Content style={{ padding: 24 }}>
          <Card
            title="Подключение Telegram"
            extra={<Button size="small" onClick={() => telegramStatus.refetch()} loading={telegramStatus.isFetching}>Проверить</Button>}
            style={{ marginBottom: 20 }}
          >
            {telegramStatus.isError ? <Typography.Text type="danger">Не удалось получить статус Telegram.</Typography.Text> : (
              <Row gutter={[24, 12]}>
                <Col xs={24} md={8}>
                  <Space direction="vertical" size={4}>
                    <Typography.Text strong>Бот</Typography.Text>
                    {statusTag(statusData?.bot?.connected, statusData?.bot?.connected ? `@${statusData.bot.username || 'без username'}` : 'не подключён')}
                    {statusData?.bot?.name ? <Typography.Text type="secondary">{statusData.bot.name}</Typography.Text> : null}
                    {statusData?.bot?.error ? <Typography.Text type="danger">{statusData.bot.error}</Typography.Text> : null}
                  </Space>
                </Col>
                <Col xs={24} md={10}>
                  <Space direction="vertical" size={4}>
                    <Typography.Text strong>Канал публикации</Typography.Text>
                    {statusTag(statusData?.channel?.connected, statusData?.channel?.connected ? (statusData.channel.title || 'канал найден') : 'не найден')}
                    {statusData?.channel?.username ? <Typography.Text type="secondary">@{statusData.channel.username}</Typography.Text> : null}
                    {statusData?.channel?.id ? <Typography.Text type="secondary">ID: {statusData.channel.id}</Typography.Text> : null}
                    {statusData?.channel?.error ? <Typography.Text type="danger">{statusData.channel.error}</Typography.Text> : null}
                  </Space>
                </Col>
                <Col xs={24} md={6}>
                  <Space direction="vertical" size={4}>
                    <Typography.Text strong>Права бота</Typography.Text>
                    {statusTag(statusData?.channel?.canPublish, statusData?.channel?.canPublish ? 'может публиковать' : 'нет публикации')}
                    {statusData?.channel?.botStatus ? <Typography.Text type="secondary">Роль: {statusData.channel.botStatus}</Typography.Text> : null}
                  </Space>
                </Col>
              </Row>
            )}
          </Card>
          {page === "posts" && <Posts />}
          {page === "estimate" && <Estimates />}
          {page === "order" && <Orders />}
          {page === "mobile" && <MobileRequests />}
          {page === "support" && <Support />}
          {page === "sellers" && <Sellers />}
          {page === "users" && <UsersPage />}
          {page === "analytics" && <AnalyticsPage />}
        </Content>
      </Layout>
    </Layout></>
  );
}

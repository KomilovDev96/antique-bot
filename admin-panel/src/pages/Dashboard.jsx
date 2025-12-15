import { Layout, Menu, Button, Badge } from "antd";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import Posts from "./Posts";
import Estimates from "./Estimates";
import Orders from "./Orders";

const { Header, Sider, Content } = Layout;

export default function Dashboard() {
  const [page, setPage] = useState("posts");

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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="light">
        <Menu
          mode="inline"
          defaultSelectedKeys={["posts"]}
          onClick={(e) => setPage(e.key)}
          items={[
            {
              key: "posts",
              label: (
                <span>
                  E'lonlar{" "}
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
            { key: "estimate", label: "Baholash so'rovlari" },
            { key: "order", label: "Yangi zakas" },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#fff",
            background: "#001529",
            padding: "0 20px",
          }}
        >
          <h1>Antikvar Admin Panel</h1>
          <Button onClick={logout}>Chiqish</Button>
        </Header>

        <Content style={{ padding: 24 }}>
          {page === "posts" && <Posts />}
          {page === "estimate" && <Estimates />}
          {page === "order" && <Orders />}
        </Content>
      </Layout>
    </Layout>
  );
}

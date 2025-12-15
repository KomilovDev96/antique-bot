import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { Table, Tag, Button, Modal, Input, message, Image } from "antd";
import { useState } from "react";

export default function Estimates() {
    const queryClient = useQueryClient();
    const [replyModal, setReplyModal] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 8 });

    const { data: estimatesResp, isLoading } = useQuery({
        queryKey: ["estimates", pagination.current, pagination.pageSize],
        queryFn: async () => {
            const res = await axiosClient.get("/admin/estimates", {
                params: {
                    page: pagination.current,
                    limit: pagination.pageSize,
                },
            });
            return res.data;
        },
    });
    const data = estimatesResp?.items || [];
    const total = estimatesResp?.total || 0;

    const replyMutation = useMutation({
        mutationFn: async ({ id, reply }) =>
            axiosClient.patch(`/admin/estimates/${id}/reply`, { reply }),
        onSuccess: () => {
            message.success("Javob yuborildi va foydalanuvchiga yetkazildi.");
            setReplyModal(null);
            setReplyText("");
            queryClient.invalidateQueries({ queryKey: ["estimates"] });
        },
    });

    const columns = [
        {
            title: "Foydalanuvchi",
            dataIndex: "username",
            render: (text) => (text ? "@" + text : "Anonim"),
        },
        {
            title: "Tavsif",
            dataIndex: "description",
            ellipsis: true,
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (text) => (
                <Tag color={text === "replied" ? "green" : "orange"}>{text}</Tag>
            ),
        },
        {
            title: "Amallar",
            render: (_, record) => (
                <Button onClick={() => { setReplyModal(record); setReplyText(""); }}>
                    ✉️ Javob berish
                </Button>
            ),
        },
    ];

    return (
        <div>
            <h2 style={{ marginBottom: 16 }}>Baholash so‘rovlari</h2>
            <Table
                loading={isLoading}
                rowKey="_id"
                columns={columns}
                dataSource={data}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total,
                    showSizeChanger: true,
                    onChange: (page, pageSize) => setPagination({ current: page, pageSize })
                }}
                expandable={{
                    expandedRowRender: (record) => {
                        const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5000";
                        const list = record.photos?.length ? record.photos : record.photoPath ? [record.photoPath] : [];
                        return (
                            <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    {list.map((p, idx) => (
                                        <Image
                                            key={idx}
                                            src={`${apiBase}/api/telegram/${p}`}
                                            width={140}
                                            height={140}
                                            style={{ borderRadius: 8, objectFit: "cover" }}
                                            fallback="/no-photo.png"
                                            alt="Predmet rasmi"
                                        />
                                    ))}
                                </div>
                                <div>
                                    <b>Tavsif:</b> {record.description}
                                    {record.adminReply && (
                                        <p>
                                            <b>Admin javobi:</b> {record.adminReply}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    },
                }}
            />

            <Modal
                open={!!replyModal}
                onCancel={() => setReplyModal(null)}
                title={`@${replyModal?.username || "anonim"} so‘roviga javob`}
                onOk={() =>
                    replyMutation.mutate({ id: replyModal._id, reply: replyText })
                }
                okText="Yuborish"
            >
                <p><b>Foydalanuvchi:</b> {replyModal?.username ? `@${replyModal.username}` : "anonim"}</p>
                <p><b>ID:</b> {replyModal?._id}</p>
                <Input.TextArea
                    rows={4}
                    placeholder="Masalan: Taxminan 250 ming so‘m..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                />
            </Modal>
        </div>
    );
}

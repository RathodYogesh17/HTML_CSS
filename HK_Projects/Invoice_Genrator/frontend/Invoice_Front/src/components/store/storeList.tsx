import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import {
  Card,
  Table,
  Input,
  Button,
  Space,
  Typography,
  Row,
  Col,
  message,
  Tooltip,
  Popconfirm,
  Tag,
  Badge,
} from "antd";
import { getAllStores, deleteStore, type Store } from "../../API/storeAPI";

const { Title, Text } = Typography;

const colors = {
  primary: "#2C3E50",
  secondary: "#4A5568",
  accent: "#718096",
  success: "#1A202C",
  warning: "#A0AEC0",
  danger: "#000000",
  light: "#F7FAFC",
  border: "#E2E8F0",
  text: {
    primary: "#1A202C",
    secondary: "#4A5568",
    light: "#718096"
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return { date: 'N/A', time: '' };
  
  const date = new Date(dateString);
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedTime = `${hours}:${minutes} ${ampm}`;
  
  return { date: formattedDate, time: formattedTime };
};

const StoreList = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchStores();
  }, [page, limit, debouncedSearch]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await getAllStores({
        page,
        limit,
        search: debouncedSearch
      });

      console.log("Store response:", response);

      if (response?.data) {
        const storeData = Array.isArray(response.data) ? response.data : response.data.stores || [];
        setStores(storeData);
        setTotal(response.data.pagination?.total || storeData.length);
      } else {
        setStores([]);
        setTotal(0);
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      message.error(error.response?.data?.message || "Error fetching stores");
      setStores([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStore(id);
      message.success("Store deleted successfully");
      fetchStores();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Error deleting store");
    }
  };

  const columns = [
    {
      title: "#",
      key: "no",
      width: 50,
      align: "center" as const,
      render: (_: any, __: any, index: number) => (
        <Text style={{ fontSize: 14, color: colors.text.light }}>
          {(page - 1) * limit + index + 1}
        </Text>
      ),
    },
    {
      title: "Store Details",
      key: "store",
      width: 280,
      render: (record: Store) => (
        <Space size={12}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <ShopOutlined style={{ fontSize: 22, color: "#fff" }} />
          </div>
          <div>
            <Tooltip title={record.name}>
              <Text strong style={{ fontSize: 15, color: colors.text.primary, display: "block" }}>
                {record.name?.length > 25 ? `${record.name.substring(0, 25)}...` : record.name}
              </Text>
            </Tooltip>
            <Space size={4} align="center" style={{ marginTop: 4 }}>
              <EnvironmentOutlined style={{ fontSize: 12, color: colors.text.light }} />
              <Text style={{ fontSize: 12, color: colors.text.light }}>
                {record.address?.length > 30 ? `${record.address.substring(0, 30)}...` : record.address}
              </Text>
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact Info",
      key: "contact",
      width: 220,
      render: (record: Store) => (
        <Space direction="vertical" size={2}>
          <Space size={4}>
            <MailOutlined style={{ color: colors.accent, fontSize: 12 }} />
            <Text style={{ fontSize: 13, color: colors.text.secondary }}>
              {record.email?.length > 20 ? `${record.email.substring(0, 20)}...` : record.email}
            </Text>
          </Space>
          <Space size={4}>
            <PhoneOutlined style={{ color: colors.accent, fontSize: 12 }} />
            <Text style={{ fontSize: 13, color: colors.text.secondary }}>
              {record.mobile}
            </Text>
          </Space>
        </Space>
      ),
    },

    {
      title: "GST/PAN",
      key: "tax",
      width: 180,
      render: (record: Store) => (
        <Space direction="vertical" size={2}>
          <Space size={4}>
            <FileTextOutlined style={{ color: colors.accent, fontSize: 12 }} />
            <Text style={{ fontSize: 13, color: colors.text.secondary }}>
              GST: {record.gstNumber}
            </Text>
          </Space>
          <Space size={4}>
            <IdcardOutlined style={{ color: colors.accent, fontSize: 12 }} />
            <Text style={{ fontSize: 13, color: colors.text.secondary }}>
              PAN: {record.panNumber}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
        title: "GST Config",
        key: "gstConfig",
        width: 130,
        render: (record: Store) => (
          <Space direction="vertical" size={2}>
            <Tag color={record.gstType === "IGST" ? "blue" : "green"} style={{ borderRadius: 12 }}>
              {record.gstType === "IGST" ? "IGST" : "CGST+SGST"}
            </Tag>
            <Text style={{ fontSize: 12, color: "#64748b" }}>
              {record.defaultGstRate}%
            </Text>
          </Space>
        ),
      },
    {
      title: "Status",
      key: "status",
      width: 100,
      align: "center" as const,
      render: (record: Store) => (
        record.isActive ? (
          <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 12 }}>
            Active
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error" style={{ borderRadius: 12 }}>
            Inactive
          </Tag>
        )
      ),
    },
    {
      title: "Created",
      key: "createdAt",
      width: 110,
      render: (record: Store) => {
        const { date, time } = formatDate(record.createdAt);
        return (
          <Tooltip title={record.createdAt ? new Date(record.createdAt).toLocaleString() : "N/A"}>
            <Space size={2} direction="vertical" style={{ gap: 2 }}>
              <Text style={{ fontSize: 13, fontWeight: 500, color: colors.text.primary }}>
                {date}
              </Text>
              {time && (
                <Text style={{ fontSize: 11, color: colors.text.light }}>
                  {time}
                </Text>
              )}
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      align: "center" as const,
      render: (record: Store) => (
        <Space size={4}>
          <Tooltip title="View">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`view/${record._id}`)}
              style={{
                background: colors.primary,
                border: "none",
                color: "#ffffff",
                width: 32,
                height: 32,
                borderRadius: 8,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Tooltip>

          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`edit/${record._id}`)}
              style={{
                background: colors.primary,
                border: "none",
                color: "#ffffff",
                width: 32,
                height: 32,
                borderRadius: 8,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Tooltip>

          <Popconfirm
            title="Delete Store?"
            description="Are you sure you want to delete this store?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button
                icon={<DeleteOutlined />}
                size="small"
                style={{
                  background: colors.primary,
                  border: "none",
                  color: "#ffffff",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const totalWidth = 50 + 280 + 220 + 180 + 100 + 110 + 120;

  return (
    <div style={{ 
      padding: "24px",
      background: colors.light,
      minHeight: "100vh",
      width: "100%"
    }}>
      {/* Header Card */}
      <Card
        style={{
          borderRadius: 16,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          marginBottom: 24,
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, color: colors.primary }}>
              Medical Stores
            </Title>
            <Text style={{ color: colors.text.light }}>
              {total} total {total === 1 ? "store" : "stores"}
            </Text>
          </Col>

          <Col>
            <Button
              icon={<PlusOutlined />}
              onClick={() => navigate("/stores/create")}
              style={{
                background: colors.primary,
                color: "#ffffff",
                border: "none",
                borderRadius: 10,
                fontWeight: 600,
                height: 44,
                minWidth: 150,
                boxShadow: `0 4px 12px ${colors.primary}40`,
              }}
            >
              Create Store
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Search Card */}
      <Card
        style={{
          borderRadius: 16,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          marginBottom: 24,
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} lg={24}>
            <Input
              placeholder="Search by store name, email, mobile, GST or PAN..."
              prefix={<SearchOutlined style={{ color: colors.text.light }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                borderRadius: 8,
                background: colors.light,
                border: `1px solid ${colors.border}`,
              }}
              allowClear
            />
          </Col>
        </Row>
      </Card>

      {/* Table Card */}
      <Card
        style={{
          borderRadius: 16,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={columns}
          dataSource={stores}
          rowKey="_id"
          loading={loading}
          scroll={{ x: totalWidth }}
          pagination={{
            current: page,
            pageSize: limit,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: (page, pageSize) => {
              setPage(page);
              setLimit(pageSize);
            },
            showTotal: (total) => `Total ${total} stores`,
            style: { marginRight: 16 },
          }}
          size="middle"
          locale={{ emptyText: 'No stores found' }}
        />
      </Card>
    </div>
  );
};

export default StoreList;
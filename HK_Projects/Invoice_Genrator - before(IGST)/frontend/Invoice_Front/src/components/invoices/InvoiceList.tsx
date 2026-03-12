import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  UserOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Row,
  Col,
  message,
  Avatar,
  Tooltip,
  Popconfirm,
} from "antd";
import { getAllInvoices, deleteInvoice } from "../../API/InvoicesAPI";

const { Title, Text } = Typography;
const { Option } = Select;

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  customerMobile?: string;
  customerEmail?: string;
  grandTotal: number;
  items?: any[];
  storeId?: {
    _id: string;
    name: string;
    ownerName?: string;
    email?: string;
  };
  createdBy?: {
    _id: string;
    ownerName: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

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

const InvoiceList = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [limit, setLimit] = useState(10);

  const navigate = useNavigate();
  const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = loggedUser.role === "ADMIN";

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchInvoices();
  }, [page, limit, debouncedSearch, sortBy, order]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await getAllInvoices({
        page,
        limit,
        search: debouncedSearch,
        sortBy,
        order,
      });

      setInvoices(response.data || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Error fetching invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInvoice(id);
      message.success("Invoice deleted successfully");
      fetchInvoices();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Error deleting invoice");
    }
  };

  const columns = [
    {
      title: "#",
      key: "no",
      width: 50,
      align: "center" as const,
      render: (_: any, __: any, index: number) => (
        <Text style={{ fontSize: 14, color: "#64748b" }}>
          {(page - 1) * limit + index + 1}
        </Text>
      ),
    },
    {
      title: "Invoice",
      key: "invoice",
      width: 200,
      render: (_: any, record: Invoice) => (
        <Space size={8}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileTextOutlined style={{ fontSize: 18, color: "#fff" }} />
          </div>
          <div>
            <Tooltip title={record.invoiceNumber}>
              <Text strong style={{ fontSize: 14, color: "#1e293b", display: "block" }}>
                #{record.invoiceNumber?.length > 15 
                  ? `${record.invoiceNumber.substring(0, 15)}...` 
                  : record.invoiceNumber}
              </Text>
            </Tooltip>
            <Tooltip title={record._id}>
              <Text style={{ fontSize: 11, color: "#64748b" }}>
                ID: {record._id?.slice(-8).toUpperCase()}
              </Text>
            </Tooltip>
          </div>
        </Space>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      width: 200,
      render: (_: any, record: Invoice) => (
        <div>
          <Tooltip title={record.customerName}>
            <Text style={{ fontSize: 14, fontWeight: 500, color: "#1e293b", display: "block" }}>
              {record.customerName?.length > 20 
                ? `${record.customerName.substring(0, 20)}...` 
                : record.customerName || "N/A"}
            </Text>
          </Tooltip>
          {record.customerMobile && (
            <Text style={{ fontSize: 11, color: "#64748b" }}>
              {record.customerMobile}
            </Text>
          )}
        </div>
      ),
    },
    ...(isAdmin ? [
      {
        title: "Store",
        key: "store",
        width: 150,
        render: (_: any, record: Invoice) => (
          <Tooltip title={record.storeId?.name}>
            <Space size={4}>
              <ShopOutlined style={{ color: "#64748b", fontSize: 12 }} />
              <Text style={{ fontSize: 13, color: "#1e293b" }}>
                {record.storeId?.name 
                  ? record.storeId.name.length > 15 
                    ? `${record.storeId.name.substring(0, 15)}...` 
                    : record.storeId.name
                  : "Main Store"}
              </Text>
            </Space>
          </Tooltip>
        ),
      }
    ] : []),
    {
      title: "Created By",
      key: "createdBy",
      width: 160,
      render: (_: any, record: Invoice) => {
        const ownerName = record.createdBy?.ownerName || record.storeId?.ownerName || "N/A";
        const email = record.createdBy?.email || record.storeId?.email || "";
        
        return (
          <Tooltip title={`${ownerName} (${email})`}>
            <Space size={4}>
              <Avatar 
                size={24} 
                style={{ 
                  background: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <UserOutlined style={{ color: "#475569", fontSize: 12 }} />
              </Avatar>
              <Text style={{ fontSize: 13, color: "#1e293b" }}>
                {ownerName.length > 12 
                  ? `${ownerName.substring(0, 12)}...` 
                  : ownerName}
              </Text>
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: "Created",
      key: "createdAt",
      width: 110,
      sorter: true,
      render: (_: any, record: Invoice) => {
        const { date, time } = formatDate(record.createdAt);
        return (
          <Tooltip title={record.createdAt ? new Date(record.createdAt).toLocaleString() : "N/A"}>
            <Space size={2} direction="vertical" style={{ gap: 2 }}>
              <Text style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>
                {date}
              </Text>
              {time && (
                <Text style={{ fontSize: 11, color: "#94a3b8" }}>
                  {time}
                </Text>
              )}
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: "Updated",
      key: "updatedAt",
      width: 110,
      sorter: true,
      render: (_: any, record: Invoice) => {
        const { date, time } = formatDate(record.updatedAt);
        return (
          <Tooltip title={record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "N/A"}>
            <Space size={2} direction="vertical" style={{ gap: 2 }}>
              <Text style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>
                {date}
              </Text>
              {time && (
                <Text style={{ fontSize: 11, color: "#94a3b8" }}>
                  {time}
                </Text>
              )}
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: "Amount",
      key: "amount",
      width: 120,
      align: "right" as const,
      sorter: true,
      render: (_: any, record: Invoice) => (
        <div style={{ textAlign: "right" }}>
          <Text style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
            ₹{record.grandTotal?.toLocaleString() || 0}
          </Text>
          <br />
          <Text style={{ fontSize: 11, color: "#94a3b8" }}>
            {record.items?.length || 0} items
          </Text>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      align: "center" as const,
      render: (_: any, record: Invoice) => {
        const canEdit = isAdmin || record.createdBy?._id === loggedUser.userId;
        
        return (
          <Space size={4}>
            <Tooltip title="View">
              <Button
                icon={<EyeOutlined />}
                size="small"
                onClick={() => navigate(`view/${record._id}`)}
                style={{
                  background: "#000000",
                  border: "1px solid #000000",
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
                onClick={() => {
                  if (!canEdit) {
                    message.warning("Only the creator or admin can edit this invoice");
                    return;
                  }
                  navigate(`edit/${record._id}`);
                }}
                style={{
                  background: "#000000",
                  border: "1px solid #000000",
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
              title="Delete Invoice?"
              description="Are you sure you want to delete this invoice?"
              onConfirm={() => {
                if (!canEdit) {
                  message.warning("Only the creator or admin can delete this invoice");
                  return;
                }
                handleDelete(record._id);
              }}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Delete">
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  style={{
                    background: "#000000",
                    border: "1px solid #000000",
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
        );
      },
    },
  ];

  const totalWidth = 50 + 200 + 200 + (isAdmin ? 150 : 0) + 160 + 110 + 110 + 120 + 90 + 120;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px 32px",
        background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Header Card */}
        <Card
          style={{
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            marginBottom: 24,
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0, color: "#1e293b" }}>
                Invoices
              </Title>
              <Text style={{ color: "#64748b" }}>
                {total} total {total === 1 ? "invoice" : "invoices"}
              </Text>
            </Col>

            {!isAdmin && (
              <Col>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => navigate("create")}
                  style={{
                    background: "#fff",
                    color: "#111827",
                    border: "2px solid #111827",
                    borderRadius: 10,
                    fontWeight: 600,
                    height: 44,
                    minWidth: 130,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  Create Invoice
                </Button>
              </Col>
            )}
          </Row>
        </Card>

        {/* Search and Filter Card */}
        <Card
          style={{
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            marginBottom: 24,
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} lg={14}>
              <Input
                placeholder="Search by invoice number, customer name, or mobile..."
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  borderRadius: 8,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
                allowClear
              />
            </Col>

            <Col xs={24} lg={10}>
              <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  style={{ width: 130 }}
                  size="middle"
                >
                  <Option value="createdAt">Created</Option>
                  <Option value="updatedAt">Updated</Option>
                  <Option value="grandTotal">Amount</Option>
                  <Option value="customerName">Customer</Option>
                </Select>

                <Select
                  value={order}
                  onChange={setOrder}
                  style={{ width: 100 }}
                  size="middle"
                >
                  <Option value="desc">Desc</Option>
                  <Option value="asc">Asc</Option>
                </Select>
              </Space>
            </Col>
          </Row>
        </Card>

        <Card
          style={{
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            columns={columns}
            dataSource={invoices}
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
              showTotal: (total) => `Total ${total} invoices`,
              style: { marginRight: 16 },
            }}
            size="middle"
          />
        </Card>
      </div>
    </div>
  );
};

export default InvoiceList;
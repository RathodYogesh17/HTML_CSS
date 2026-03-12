import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCompanies, deleteCompany } from "../../API/companiesAPI";  
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  BankOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Popconfirm,
  Row,
  Col,
  message,
  Avatar,
  Tooltip,
  Tag,
} from "antd";
import "../../../public/css/company.css";

const { Title, Text } = Typography;
const { Option } = Select;

interface Company {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  gstNumber?: string;
  storeId?: {
    _id: string;
    name: string;
  };
  createdBy?: {
    _id: string;
    ownerName: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
  isActive: boolean;
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

export const CompaniesList = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
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
    fetchCompanies();
  }, [page, limit, debouncedSearch, sortBy, order]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await getAllCompanies({
        page,
        limit,
        search: debouncedSearch,
        sortBy,
        order,
      });

      setCompanies(response.data || []); 
      setTotal(response.total || 0);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Error fetching companies");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCompany(id);
      message.success("Company deleted successfully");
      fetchCompanies();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Error deleting company");
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
      title: "Company",
      key: "company",
      width: 250,
      render: (_: any, record: Company) => (
        <Space size={8}>
          <div className="company-icon-container">
            <BankOutlined className="company-icon" />
          </div>
          <div>
            <Tooltip title={record.name}>
              <Text className="company-name-text">
                {record.name.length > 25 
                  ? `${record.name.substring(0, 25)}...` 
                  : record.name}
              </Text>
            </Tooltip>
            <Tooltip title={record.address}>
              <Text className="company-address-text">
                {record.address.length > 30 
                  ? `${record.address.substring(0, 30)}...` 
                  : record.address}
              </Text>
            </Tooltip>
          </div>
        </Space>
      ),
    },
    {
      title: "Email",
      key: "email",
      width: 180,
      render: (_: any, record: Company) => (
        <Tooltip title={record.email}>
          <Text className="company-email-text">
            {record.email?.length > 20 
              ? `${record.email.substring(0, 20)}...` 
              : record.email}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Mobile",
      key: "phone",
      width: 100,
      render: (_: any, record: Company) => (
        <Text className="company-phone-text">
          {record.phone || "N/A"}
        </Text>
      ),
    },
    ...(isAdmin ? [
      {
        title: "Store",
        key: "store",
        width: 130,
        render: (_: any, record: Company) => (
          <Tooltip title={record.storeId?.name}>
            <Space size={4}>
              <ShopOutlined style={{ color: "#64748b", fontSize: 12 }} />
              <Text className="company-store-text">
                {record.storeId?.name 
                  ? record.storeId.name.length > 15 
                    ? `${record.storeId.name.substring(0, 15)}...` 
                    : record.storeId.name
                  : "N/A"}
              </Text>
            </Space>
          </Tooltip>
        ),
      }
    ] : []),
    {
      title: "Created By",
      key: "createdBy",
      width: 140,
      render: (_: any, record: Company) => (
        <Tooltip title={`${record.createdBy?.ownerName || "N/A"} (${record.createdBy?.email || ""})`}>
          <Space size={4}>
            <Avatar size={24} className="company-avatar">
              <UserOutlined className="company-avatar-icon" />
            </Avatar>
            <Text className="company-createdby-text">
              {record.createdBy?.ownerName 
                ? record.createdBy.ownerName.length > 12 
                  ? `${record.createdBy.ownerName.substring(0, 12)}...` 
                  : record.createdBy.ownerName
                : "N/A"}
            </Text>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: "Created",
      key: "createdAt",
      width: 110,
      sorter: true,
      render: (_: any, record: Company) => {
        const { date, time } = formatDate(record.createdAt);
        return (
          <Tooltip title={record.createdAt ? new Date(record.createdAt).toLocaleString() : "N/A"}>
            <div className="company-timestamp-container">
              <span className="company-timestamp-date">{date}</span>
              {time && (
                <span className="company-timestamp-time">{time}</span>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Updated",
      key: "updatedAt",
      width: 110,
      sorter: true,
      render: (_: any, record: Company) => {
        const { date, time } = formatDate(record.updatedAt);
        return (
          <Tooltip title={record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "N/A"}>
            <div className="company-timestamp-container">
              <span className="company-timestamp-date">{date}</span>
              {time && (
                <span className="company-timestamp-time">{time}</span>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Status",
      key: "isActive",
      width: 80,
      align: "center" as const,
      render: (_: any, record: Company) => (
        <Tag
          color={record.isActive ? "#10b981" : "#ef4444"}
          className="company-status-tag"
        >
          {record.isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      align: "center" as const,
      render: (_: any, record: Company) => {
        
        return (
          <Space size={4}>
            <Tooltip title="Edit">
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => {
                 
                  navigate(`/edit-company/${record._id}`);
                }}
                className="company-action-btn"
              />
            </Tooltip>

            <Popconfirm
              title="Delete Company?"
              description="Are you sure you want to delete this company?"
              onConfirm={() => {
               
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
                  className="company-action-btn"
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const totalWidth = 50 + 250 + 180 + 100 + (isAdmin ? 130 : 0) + 140 + 110 + 110 + 80 + 100;

  return (
    <div className="company-page-container-full">
      <div className="max-width-1400">
        {/* Header */}
        <Card className="company-header-card">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} className="company-header-title">
                Companies
              </Title>
              <Text className="company-header-count">
                {total} total {total === 1 ? "company" : "companies"}
              </Text>
            </Col>

            {!isAdmin && (
              <Col>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/add-company")}
                  className="company-add-btn"
                >
                  Add Company
                </Button>
              </Col>
            )}
          </Row>
        </Card>

        <Card className="company-header-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} lg={14}>
              <Input
                placeholder="Search by name, email, phone, or GST..."
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="company-search-input"
                allowClear
              />
            </Col>

            <Col xs={24} lg={10}>
              <Space className="company-filter-row">
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  style={{ width: 130 }}
                  size="middle"
                >
                  <Option value="createdAt">Created</Option>
                  <Option value="updatedAt">Updated</Option> 
                  <Option value="name">Name</Option>
                  <Option value="email">Email</Option>
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

        <Card className="company-table-card company-table-padding">
          <Table
            columns={columns}
            dataSource={companies}
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
              showTotal: (total) => `Total ${total} companies`,
              style: { marginRight: 16 },
            }}
            size="middle"
          />
        </Card>
      </div>
    </div>
  );
};
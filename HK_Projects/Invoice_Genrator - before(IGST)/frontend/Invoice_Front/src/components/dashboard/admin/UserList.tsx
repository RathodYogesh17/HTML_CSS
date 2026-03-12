import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllUsers,
  toggleUserActive,
  deleteUserByAdmin,
} from "../../../API/userAPI";
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PlusOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  Table, Button, Spin, Card, Typography, Space,
  Input, DatePicker, Row, Col, Switch, message, Tooltip, Avatar, Select
} from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../../public/css/auth.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface User {
  _id: string;
  role: "USER" | "ADMIN";
  ownerName: string;
  email: string;
  mobileNumber: string;
  address: string;
  gstNumber?: string;
  profileImage?: string;
  stores: any[];
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
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

const UserList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateRange, setDateRange] = useState<[any, any]>([null, null]);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = loggedUser.role === "ADMIN";

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: users = [], isLoading, isError, refetch } = useQuery<User[]>({
    queryKey: ["users", page, limit, debouncedSearch, sortBy, order],
    queryFn: () => getAllUsers(),
  });

  const toggleMutation = useMutation({
    mutationFn: (userId: string) => {
      setActiveUserId(userId);
      return toggleUserActive(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      message.success("User status updated successfully");
    },
    onError: (error: any) => {
      message.error(error?.message || "Failed to update status");
    },
    onSettled: () => setActiveUserId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteUserByAdmin(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      message.success("User deleted successfully");
    },
    onError: (error: any) => {
      message.error(error?.message || "Failed to delete user");
    },
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.ownerName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      user.mobileNumber?.includes(debouncedSearch) ||
      user.address?.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesStatus = !filterStatus || user.isActive === (filterStatus === "active");

    const userDate = new Date(user.createdAt);
    const matchesDate =
      !dateRange[0] ||
      !dateRange[1] ||
      (userDate >= dateRange[0] && userDate <= dateRange[1]);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
  };

  const columns = [
    {
      title: "#",
      key: "no",
      width: 50,
      align: "center" as const,
      render: (_: any, __: User, index: number) => (
        <Text style={{ fontSize: 14, color: "#64748b" }}>
          {(page - 1) * limit + index + 1}
        </Text>
      ),
    },
    {
      title: "User",
      key: "user",
      width: 220,
      render: (_: any, record: User) => (
        <Space size={12}>
          <Avatar size={40} className="user-avatar">
            <UserOutlined className="user-avatar-icon" />
          </Avatar>
          <div>
            <Tooltip title={record.ownerName}>
              <Text className="user-name-text">
                {record.ownerName?.length > 20 
                  ? `${record.ownerName.substring(0, 20)}...` 
                  : record.ownerName}
              </Text>
            </Tooltip>
            <Tooltip title={record.email}>
              <Text className="user-email-text">
                {record.email?.length > 25 
                  ? `${record.email.substring(0, 25)}...` 
                  : record.email}
              </Text>
            </Tooltip>
          </div>
        </Space>
      ),
    },
    {
      title: "Mobile",
      key: "mobile",
      width: 120,
      render: (_: any, record: User) => (
        <Text className="user-mobile-text">
          {record.mobileNumber || "N/A"}
        </Text>
      ),
    },
    {
      title: "Address",
      key: "address",
      width: 200,
      render: (_: any, record: User) => (
        <Tooltip title={record.address}>
          <Text className="user-address-text">
            {record.address?.length > 30 
              ? `${record.address.substring(0, 30)}...` 
              : record.address || "N/A"}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "GST",
      key: "gst",
      width: 120,
      render: (_: any, record: User) => (
        <Text className="user-gst-text">
          {record.gstNumber || "—"}
        </Text>
      ),
    },
    {
      title: "Toggle",
      key: "toggle",
      width: 80,
      align: "center" as const,
      render: (_: any, record: User) => (
        <Tooltip title={record.isActive ? "Deactivate User" : "Activate User"}>
          <Switch
            size="small"
            checked={record.isActive}
            onChange={(checked, e) => {
              e.stopPropagation(); 
              toggleMutation.mutate(record._id);
            }}
            loading={toggleMutation.isPending && activeUserId === record._id}
            className={record.isActive ? "user-switch-active" : "user-switch-inactive"}
            onClick={(e) => e.stopPropagation()}
          />
        </Tooltip>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 90,
      align: "center" as const,
      render: (_: any, record: User) => {
        const statusClass = record.isActive ? "user-status-active" : "user-status-inactive";
        
        return (
          <div className={`user-status-badge ${statusClass}`}>
            {record.isActive ? "ACTIVE" : "INACTIVE"}
          </div>
        );
      },
    },
    {
      title: "Created",
      key: "createdAt",
      width: 110,
      sorter: true,
      render: (_: any, record: User) => {
        const { date, time } = formatDate(record.createdAt);
        return (
          <Tooltip title={record.createdAt ? new Date(record.createdAt).toLocaleString() : "N/A"}>
            <div className="user-timestamp-container">
              <span className="user-timestamp-date">{date}</span>
              {time && (
                <span className="user-timestamp-time">{time}</span>
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
      render: (_: any, record: User) => {
        const { date, time } = formatDate(record.updatedAt);
        return (
          <Tooltip title={record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "N/A"}>
            <div className="user-timestamp-container">
              <span className="user-timestamp-date">{date}</span>
              {time && (
                <span className="user-timestamp-time">{time}</span>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      align: "center" as const,
      render: (_: any, record: User) => {
        const canEdit = isAdmin;
        
        return (
          <Space size={4} onClick={(e) => e.stopPropagation()}>
            <Tooltip title="View">
              <Button
                icon={<EyeOutlined />}
                size="small"
                onClick={() => navigate(`/users/${record._id}`)}
                className="user-action-btn"
              />
            </Tooltip>
            <Tooltip title="Edit">
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => {
                  if (!canEdit) {
                    message.warning("Only admin can edit users");
                    return;
                  }
                  navigate(`/users/edit/${record._id}`);
                }}
                className="user-action-btn"
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => {
                  if (!canEdit) {
                    message.warning("Only admin can delete users");
                    return;
                  }
                  if (window.confirm('Are you sure you want to delete this user?')) {
                    deleteMutation.mutate(record._id);
                  }
                }}
                className="user-action-btn"
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const totalWidth = 50 + 220 + 120 + 200 + 120 + 80 + 90 + 110 + 110 + 120;

  if (isLoading)
    return (
      <div className="user-center-container">
        <Spin size="large" tip="Loading users..." />
      </div>
    );

  if (isError)
    return (
      <div className="user-center-container">
        <Space direction="vertical" align="center">
          <Text type="danger">Error loading users</Text>
          <Button onClick={() => refetch()}>Retry</Button>
        </Space>
      </div>
    );

  return (
    <div className="user-page-container">
      <div className="max-width-1400">
        {/* Header Card */}
        <Card className="user-header-card">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} className="user-header-title">
                Users
              </Title>
              <Text className="user-header-count">
                {stats.total} total {stats.total === 1 ? "user" : "users"}
              </Text>
            </Col>

            <Col>
              <Button
                icon={<PlusOutlined />}
                onClick={() => navigate("/register")}
                className="user-add-btn"
              >
                Add User
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Stats Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card className="user-stats-card user-stats-body">
              <div>
                <Text type="secondary" className="user-stats-label">Total Users</Text>
                <Title level={1} className="user-stats-title">
                  {stats.total}
                </Title>
              </div>
              <div className="user-stats-icon user-stats-icon-total">
                <TeamOutlined className="user-stats-icon-inner" />
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="user-stats-card user-stats-body">
              <div>
                <Text type="secondary" className="user-stats-label">Active Users</Text>
                <Title level={1} className="user-stats-title" style={{ color: "#2e7d32" }}>
                  {stats.active}
                </Title>
              </div>
              <div className="user-stats-icon user-stats-icon-active">
                <CheckCircleOutlined className="user-stats-icon-inner" />
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="user-stats-card user-stats-body">
              <div>
                <Text type="secondary" className="user-stats-label">Inactive Users</Text>
                <Title level={1} className="user-stats-title" style={{ color: "#d32f2f" }}>
                  {stats.inactive}
                </Title>
              </div>
              <div className="user-stats-icon user-stats-icon-inactive">
                <StopOutlined className="user-stats-icon-inner" />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Search and Filter Card */}
        <Card className="user-header-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} lg={8}>
              <Input
                placeholder="Search by name, email, phone..."
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="user-search-input"
                allowClear
              />
            </Col>
            <Col xs={24} lg={8}>
              <RangePicker
                style={{ 
                  width: "100%",
                  borderRadius: 8,
                  background: "#f8fafc",
                }}
                onChange={(dates) => setDateRange(dates as any)}
                format="DD/MM/YYYY"
                placeholder={["Start Date", "End Date"]}
              />
            </Col>
            <Col xs={24} lg={8}>
              <Space className="user-filter-row">
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  style={{ width: 120 }}
                  size="middle"
                >
                  <Option value="createdAt">Created</Option>
                  <Option value="updatedAt">Updated</Option>
                  <Option value="ownerName">Name</Option>
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
          <Row gutter={8} style={{ marginTop: 16 }}>
            <Col>
              <Button 
                size="small" 
                type={filterStatus === null ? "primary" : "default"}
                onClick={() => setFilterStatus(null)}
                className={filterStatus === null ? "user-filter-btn" : ""}
              >
                All ({stats.total})
              </Button>
            </Col>
            <Col>
              <Button 
                size="small"
                type={filterStatus === "active" ? "primary" : "default"}
                onClick={() => setFilterStatus("active")}
                className={filterStatus === "active" ? "user-filter-btn" : ""}
              >
                Active ({stats.active})
              </Button>
            </Col>
            <Col>
              <Button 
                size="small"
                type={filterStatus === "inactive" ? "primary" : "default"}
                onClick={() => setFilterStatus("inactive")}
                className={filterStatus === "inactive" ? "user-filter-btn" : ""}
              >
                Inactive ({stats.inactive})
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Table Card */}
        <Card className="user-table-card" bodyClassName="user-table-padding">
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="_id"
            loading={isLoading}
            scroll={{ x: totalWidth }}
            pagination={{
              current: page,
              pageSize: limit,
              total: filteredUsers.length,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (page, pageSize) => {
                setPage(page);
                setLimit(pageSize);
              },
              showTotal: (total) => `Total ${total} users`,
              style: { marginRight: 16 },
            }}
            onRow={(record) => ({
              onClick: () => navigate(`/users/${record._id}`),
              style: { cursor: "pointer" },
            })}
            size="middle"
          />
        </Card>
      </div>
    </div>
  );
};

export default UserList;
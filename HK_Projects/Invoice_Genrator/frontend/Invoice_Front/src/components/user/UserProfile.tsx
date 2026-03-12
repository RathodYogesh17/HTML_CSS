import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteProfile,
  deleteUserByAdmin,
  getProfile,
  getSingleUser,
  updateProfile,
  updateUserByAdmin,
} from "../../API/userAPI";
import { useNavigate, useParams } from "react-router-dom";
import {
  UserOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  LogoutOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  ShopOutlined,
  IdcardOutlined,
  BankOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  Card,
  Spin,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Avatar,
  Form,
  Input,
  Divider,
  Tag,
  message,
  Tabs,
  Badge,
  Descriptions,
  Switch,
  Select,
} from "antd";
import { useState } from "react";
import { MdStore, MdVerified } from "react-icons/md";
import "../../../public/css/auth.css";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

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

const UserProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => (id ? getSingleUser(id) : getProfile()),
  });

  const updateMutation = useMutation({
    mutationFn: (values: any) =>
      id ? updateUserByAdmin(id, values) : updateProfile(values),
    onSuccess: () => {
      message.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      message.error(error?.message || "Failed to update profile");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      id ? deleteUserByAdmin(id) : deleteProfile(),
    onSuccess: () => {
      message.success(id ? "User deleted successfully" : "Account deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate(id ? "/dashboard/users" : "/login");
    },
  });

  const handleSubmit = (values: any) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="user-center-container">
        <Spin size="large" tip="Loading profile..." />
      </div>
    );
  }

  const userData = user?.data || user;
  const isOwnProfile = !id;
  const isAdmin = userData?.role === "ADMIN";
  
  const { date: joinedDate } = formatDate(userData?.createdAt);
  const { date: updatedDate, time: updatedTime } = formatDate(userData?.updatedAt);

  return (
    <div className="user-page-container">
      <div className="max-width-1400">
        {/* Header with back button */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              className="user-back-btn"
            >
              Back
            </Button>
          </Col>
          <Col>
            <Title level={2} className="user-header-title">
              {isOwnProfile ? "My Profile" : "User Profile"}
            </Title>
          </Col>
          <Col style={{ width: 96 }} />
        </Row>

        <Row gutter={[24, 24]}>
          {/* Left Column - Profile Card */}
          <Col xs={24} lg={8}>
            <Card className="user-profile-card" bodyClassName="user-profile-body">
              {/* Profile Header */}
              <div className="user-profile-header">
                <Badge
                  count={
                    userData?.isActive ? (
                      <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 20 }} />
                    ) : (
                      <StopOutlined style={{ color: "#ff4d4f", fontSize: 20 }} />
                    )
                  }
                  offset={[-10, 90]}
                >
                  <Avatar
                    size={120}
                    className="user-profile-avatar"
                    icon={<UserOutlined className="user-profile-avatar-icon" />}
                  />
                </Badge>

                <Title level={3} className="user-profile-name">
                  {userData?.ownerName}
                </Title>
                
                <Space size={8} style={{ marginBottom: 12 }}>
                  <Tag
                    className={`user-profile-tag ${isAdmin ? "user-profile-tag-admin" : ""}`}
                  >
                    {userData?.role}
                  </Tag>
                  <Tag
                    className={`user-profile-tag ${userData?.isActive ? "user-profile-tag-active" : "user-profile-tag-inactive"}`}
                  >
                    {userData?.isActive ? "ACTIVE" : "INACTIVE"}
                  </Tag>
                  {userData?.isApproved && (
                    <Tag className="user-profile-tag-approved">
                      <MdVerified /> APPROVED
                    </Tag>
                  )}
                </Space>

                <Text className="user-profile-info">
                  <MailOutlined className="user-profile-info-icon" />
                  {userData?.email}
                </Text>
                <Text className="user-profile-info">
                  <PhoneOutlined className="user-profile-info-icon" />
                  {userData?.mobileNumber || "No phone number"}
                </Text>
                {userData?.address && (
                  <Text className="user-profile-info">
                    <HomeOutlined className="user-profile-info-icon" />
                    {userData.address}
                  </Text>
                )}
              </div>

              <Divider style={{ margin: "16px 0" }} />

              {/* Store Information */}
              {userData?.stores && userData.stores.length > 0 && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <Space align="center" style={{ marginBottom: 12 }}>
                      <ShopOutlined style={{ fontSize: 18, color: "#1e293b" }} />
                      <Text strong style={{ fontSize: 16, color: "#1e293b" }}>
                        Stores ({userData.stores.length})
                      </Text>
                    </Space>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {userData.stores.map((store: any) => (
                        <Tag key={store._id} className="user-store-tag">
                          <MdStore className="user-store-icon" />
                          {store.name}
                        </Tag>
                      ))}
                    </div>
                  </div>
                  <Divider style={{ margin: "16px 0" }} />
                </>
              )}

              {/* Quick Stats */}
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="user-quick-stat">
                    <Text type="secondary" className="user-quick-stat-label">Joined</Text>
                    <div className="user-quick-stat-value">{joinedDate}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="user-quick-stat">
                    <Text type="secondary" className="user-quick-stat-label">Last Updated</Text>
                    <div className="user-quick-stat-value">{updatedDate}</div>
                    <div className="user-quick-stat-time">{updatedTime}</div>
                  </div>
                </Col>
              </Row>

              <Divider style={{ margin: "16px 0" }} />

              {/* Action Buttons */}
              <Space direction="vertical" style={{ width: "100%" }} size={12}>
                {!isEditing ? (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    block
                    onClick={() => {
                      setIsEditing(true);
                      form.setFieldsValue(userData);
                    }}
                    style={{
                      borderRadius: 10,
                      background: "#000000",
                      border: "none",
                      height: 44,
                      fontWeight: 500,
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    block
                    onClick={() => {
                      setIsEditing(false);
                      form.resetFields();
                    }}
                    className="user-cancel-btn"
                  >
                    Cancel Editing
                  </Button>
                )}

                <Button
                  danger
                  icon={<DeleteOutlined />}
                  block
                  loading={deleteMutation.isPending}
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${isOwnProfile ? "your account" : "this user"}?`)) {
                      deleteMutation.mutate();
                    }
                  }}
                  className="user-cancel-btn"
                >
                  {isOwnProfile ? "Delete Account" : "Delete User"}
                </Button>

                {isOwnProfile && (
                  <Button
                    icon={<LogoutOutlined />}
                    block
                    onClick={() => {
                      localStorage.clear();
                      navigate("/login");
                    }}
                    className="user-cancel-btn"
                  >
                    Logout
                  </Button>
                )}
              </Space>
            </Card>
          </Col>

          {/* Right Column - Edit Form */}
          <Col xs={24} lg={16}>
            <Card className="user-profile-card" bodyStyle={{ padding: "24px" }}>
              <Tabs activeKey={activeTab} onChange={setActiveTab} className="user-tabs">
                <TabPane tab="Profile Information" key="profile" />
                <TabPane tab="Security" key="security" />
                {isAdmin && <TabPane tab="Account Settings" key="settings" />}
              </Tabs>

              <Form
                layout="vertical"
                form={form}
                initialValues={userData}
                onFinish={handleSubmit}
                disabled={!isEditing}
              >
                {activeTab === "profile" && (
                  <>
                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Medical Store Name"
                          name="medicalStoreName"
                          rules={[{ required: true, message: "Please enter store name" }]}
                        >
                          <Input
                            size="large"
                            prefix={<BankOutlined style={{ color: "#94a3b8" }} />}
                            placeholder="Enter medical store name"
                            style={{ borderRadius: 8 }}
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Owner Name"
                          name="ownerName"
                          rules={[{ required: true, message: "Please enter owner name" }]}
                        >
                          <Input
                            size="large"
                            prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                            placeholder="Enter owner name"
                            style={{ borderRadius: 8 }}
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Email"
                          name="email"
                          rules={[
                            { required: true, message: "Please enter email" },
                            { type: "email", message: "Please enter valid email" }
                          ]}
                        >
                          <Input
                            size="large"
                            prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
                            placeholder="Enter email address"
                            style={{ borderRadius: 8 }}
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Mobile Number"
                          name="mobileNumber"
                          rules={[{ required: true, message: "Please enter mobile number" }]}
                        >
                          <Input
                            size="large"
                            prefix={<PhoneOutlined style={{ color: "#94a3b8" }} />}
                            placeholder="Enter mobile number"
                            style={{ borderRadius: 8 }}
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item label="GST Number" name="gstNumber">
                          <Input
                            size="large"
                            prefix={<IdcardOutlined style={{ color: "#94a3b8" }} />}
                            placeholder="Enter GST number"
                            style={{ borderRadius: 8 }}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={24}>
                        <Form.Item label="Address" name="address">
                          <Input.TextArea
                            rows={3}
                            placeholder="Enter complete address"
                            style={{ borderRadius: 8 }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                )}

                {activeTab === "security" && (
                  <>
                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="New Password"
                          name="password"
                          rules={[
                            { min: 6, message: "Password must be at least 6 characters" }
                          ]}
                        >
                          <Input.Password
                            size="large"
                            placeholder="Enter new password"
                            style={{ borderRadius: 8 }}
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Confirm Password"
                          name="confirmPassword"
                          dependencies={['password']}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(new Error('Passwords do not match'));
                              },
                            }),
                          ]}
                        >
                          <Input.Password
                            size="large"
                            placeholder="Confirm new password"
                            style={{ borderRadius: 8 }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider />
                    
                    <Descriptions column={1} bordered size="small">
                      <Descriptions.Item label="Account Created" className="user-descriptions-label">
                        {joinedDate} at {formatDate(userData?.createdAt).time}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Updated" className="user-descriptions-label">
                        {updatedDate} at {updatedTime}
                      </Descriptions.Item>
                    </Descriptions>
                  </>
                )}

                {activeTab === "settings" && isAdmin && (
                  <>
                    <Row gutter={24}>
                      <Col span={24}>
                        <Form.Item label="User Role" name="role">
                          <Select size="large" style={{ borderRadius: 8 }}>
                            <Select.Option value="USER">User</Select.Option>
                            <Select.Option value="ADMIN">Admin</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      
                      <Col span={12}>
                        <Form.Item label="Account Status" name="isActive" valuePropName="checked">
                          <Switch
                            checkedChildren="ACTIVE"
                            unCheckedChildren="INACTIVE"
                            className={userData?.isActive ? "user-switch-active" : "user-switch-inactive"}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item label="Approval Status" name="isApproved" valuePropName="checked">
                          <Switch
                            checkedChildren="APPROVED"
                            unCheckedChildren="PENDING"
                            style={{
                              background: userData?.isApproved ? "#52c41a" : "#faad14",
                            }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                )}

                {isEditing && (
                  <>
                    <Divider />
                    <Space size={16}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={updateMutation.isPending}
                        style={{
                          borderRadius: 10,
                          background: "#000000",
                          border: "none",
                          padding: "0 32px",
                          height: 44,
                          fontWeight: 500,
                        }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        size="large"
                        onClick={() => {
                          setIsEditing(false);
                          form.resetFields();
                        }}
                        className="user-cancel-btn"
                      >
                        Cancel
                      </Button>
                    </Space>
                  </>
                )}
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default UserProfile;
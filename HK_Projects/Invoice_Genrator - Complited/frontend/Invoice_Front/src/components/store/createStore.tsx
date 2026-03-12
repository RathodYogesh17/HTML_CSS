import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined,
  ShopOutlined,
  SaveOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  FileTextOutlined,
  BankOutlined,
  PercentageOutlined
} from "@ant-design/icons";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  message,
  Card,
  Space,
  Divider,
  Spin,
  Select,
  Radio,
  InputNumber
} from "antd";
import { createStore, getStoreById, updateStore } from "../../API/storeAPI";

const { Title, Text } = Typography;
const { Option } = Select;

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

const CreateStore = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [gstType, setGstType] = useState<string>("IGST");
  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetchStoreDetails();
    }
  }, [id]);

  const fetchStoreDetails = async () => {
    try {
      setInitialLoading(true);
      const response = await getStoreById(id!);
      const storeData = response.data;
      
      // Type-safe way to set values
      form.setFieldsValue({
        name: storeData.name,
        address: storeData.address,
        gstNumber: storeData.gstNumber,
        panNumber: storeData.panNumber,
        email: storeData.email,
        mobile: storeData.mobile,
        gstType: (storeData as any).gstType || "IGST",  // Use type assertion
        defaultGstRate: (storeData as any).defaultGstRate || 18  // Use type assertion
      });
      setGstType((storeData as any).gstType || "IGST");
    } catch (error: any) {
      console.error("Error fetching store:", error);
      message.error(error.response?.data?.message || "Failed to fetch store details");
      navigate("/stores");
    } finally {
      setInitialLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      if (isEditMode) {
        await updateStore(id!, values);
        message.success("Store updated successfully!");
      } else {
        await createStore(values);
        message.success("Store created successfully!");
      }
      
      navigate("/stores");
    } catch (error: any) {
      console.error("Error saving store:", error);
      message.error(error.response?.data?.message || "Failed to save store");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: colors.light,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
      }}>
        <Card style={{ 
          padding: 64, 
          borderRadius: 24, 
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          border: "none",
        }}>
          <Spin size="large" style={{ marginBottom: 24 }} />
          <Title level={4} style={{ color: colors.primary }}>
            Loading Store Details...
          </Title>
        </Card>
      </div>
    );
  }

  return (
    <div style={{
      padding: "24px",
      background: colors.light,
      minHeight: "100vh",
      width: "100%"
    }}>
      {/* Header */}
      <div style={{ 
        padding: "24px 32px",
        background: "white",
        borderRadius: 16,
        border: `1px solid ${colors.border}`,
        marginBottom: 24,
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/stores")}
            style={{
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              background: "white",
              color: colors.text.primary,
              padding: "8px 20px",
              height: "auto",
            }}
          >
            Back to Stores
          </Button>
          <Title style={{ 
            margin: 0, 
            fontSize: 24, 
            fontWeight: 600, 
            color: colors.primary 
          }}>
            {isEditMode ? "Edit Store" : "Create New Store"}
          </Title>
          <div style={{ width: 120 }} />
        </div>
      </div>

      {/* Form Card */}
      <Card
        style={{
          borderRadius: 16,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            gstType: "IGST",
            defaultGstRate: 18
          }}
        >
          {/* Store Information Section */}
          <div style={{ marginBottom: 32 }}>
            <Space align="center" style={{ marginBottom: 24 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: colors.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <ShopOutlined style={{ color: "white", fontSize: 20 }} />
              </div>
              <Title level={4} style={{ margin: 0, color: colors.primary }}>
                Store Information
              </Title>
            </Space>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="Store Name"
                  rules={[
                    { required: true, message: "Please enter store name" },
                    { min: 3, message: "Store name must be at least 3 characters" },
                    { max: 100, message: "Store name cannot exceed 100 characters" }
                  ]}
                >
                  <Input
                    placeholder="Enter store name"
                    size="large"
                    prefix={<ShopOutlined style={{ color: colors.accent }} />}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: "Please enter email address" },
                    { type: "email", message: "Please enter a valid email" }
                  ]}
                >
                  <Input
                    placeholder="Enter email address"
                    size="large"
                    prefix={<MailOutlined style={{ color: colors.accent }} />}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="mobile"
                  label="Mobile Number"
                  rules={[
                    { required: true, message: "Please enter mobile number" },
                    { pattern: /^[6-9]\d{9}$/, message: "Please enter a valid 10-digit Indian mobile number" }
                  ]}
                >
                  <Input
                    placeholder="Enter 10-digit mobile number"
                    size="large"
                    prefix={<PhoneOutlined style={{ color: colors.accent }} />}
                    maxLength={10}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="address"
                  label="Store Address"
                  rules={[
                    { required: true, message: "Please enter store address" },
                    { min: 5, message: "Address must be at least 5 characters" }
                  ]}
                >
                  <Input.TextArea
                    placeholder="Enter complete store address"
                    size="large"
                    rows={3}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider style={{ borderColor: colors.border, margin: "24px 0" }} />

          {/* Tax Information Section */}
          <div style={{ marginBottom: 32 }}>
            <Space align="center" style={{ marginBottom: 24 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: colors.secondary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <BankOutlined style={{ color: "white", fontSize: 20 }} />
              </div>
              <Title level={4} style={{ margin: 0, color: colors.secondary }}>
                Tax Information
              </Title>
            </Space>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="gstNumber"
                  label="GST Number"
                  rules={[
                    { required: true, message: "Please enter GST number" },
                    { 
                      pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 
                      message: "Please enter a valid GST number (e.g., 27ABCDE1234F1Z5)" 
                    }
                  ]}
                >
                  <Input
                    placeholder="Enter GST number"
                    size="large"
                    prefix={<FileTextOutlined style={{ color: colors.accent }} />}
                    style={{
                      borderRadius: 8,
                      textTransform: "uppercase"
                    }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="panNumber"
                  label="PAN Number"
                  rules={[
                    { required: true, message: "Please enter PAN number" },
                    { 
                      pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 
                      message: "Please enter a valid PAN number (e.g., ABCDE1234F)" 
                    }
                  ]}
                >
                  <Input
                    placeholder="Enter PAN number"
                    size="large"
                    prefix={<IdcardOutlined style={{ color: colors.accent }} />}
                    style={{
                      borderRadius: 8,
                      textTransform: "uppercase"
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="gstType"
                  label="GST Type"
                  rules={[{ required: true, message: "Please select GST type" }]}
                >
                  <Radio.Group 
                    onChange={(e) => setGstType(e.target.value)}
                    size="large"
                  >
                    <Radio.Button value="IGST">IGST (Single Rate)</Radio.Button>
                    <Radio.Button value="CGST_SGST">CGST + SGST (Split)</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="defaultGstRate"
                  label="Default GST Rate (%)"
                  rules={[{ required: true, message: "Please enter default GST rate" }]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    step={0.1}
                    size="large"
                    style={{ width: "100%", borderRadius: 8 }}
                    prefix={<PercentageOutlined style={{ color: colors.accent }} />}
                    addonAfter="%"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* GST Type Explanation */}
            <div style={{
              background: colors.light,
              padding: "16px 20px",
              borderRadius: 8,
              border: `1px dashed ${colors.accent}`,
              marginTop: 16
            }}>
              <Space direction="vertical" size={8}>
                <Text strong style={{ color: colors.primary }}>
                  GST Calculation Method:
                </Text>
                {gstType === "IGST" ? (
                  <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                    • <strong>IGST (Integrated GST):</strong> Single tax rate applied to interstate transactions.
                    <br />• Example: If GST rate is 18%, total tax = 18% (all goes to IGST)
                  </Text>
                ) : (
                  <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                    • <strong>CGST + SGST (Central + State GST):</strong> Tax split equally for intrastate transactions.
                    <br />• Example: If GST rate is 18%, tax split = 9% CGST + 9% SGST
                  </Text>
                )}
              </Space>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ 
            display: "flex", 
            justifyContent: "flex-end",
            gap: 12,
            paddingTop: 24,
            borderTop: `1px solid ${colors.border}`
          }}>
            <Button
              size="large"
              onClick={() => navigate("/stores")}
              style={{
                padding: "8px 24px",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 500,
                border: `1px solid ${colors.border}`,
                background: "white",
                color: colors.text.secondary,
                height: "auto",
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              icon={<SaveOutlined />}
              style={{
                padding: "8px 32px",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 500,
                background: colors.primary,
                border: "none",
                boxShadow: `0 4px 12px ${colors.primary}40`,
                height: "auto",
              }}
            >
              {isEditMode ? "Update Store" : "Create Store"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CreateStore;
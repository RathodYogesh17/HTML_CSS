import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addCompany } from "../../API/companiesAPI";
import { useSelector } from "react-redux"; 
import type { RootState } from "../../store/store";
import {
  ArrowLeftOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  Form,
  Input,
  Button,
  Card,
  Switch,
  Typography,
  Row,
  Col,
  message,
} from "antd";
import "../../../public/css/company.css";

const { Title, Text } = Typography;

const AddCompany = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const user = useSelector((state: RootState) => state.auth.user);
  
  const userStoreId = user?.stores?.[0]; 
  useEffect(() => {
    if (!userStoreId) {
      message.error("No store assigned to your account");
      navigate("/companies");
    }
  }, [userStoreId, navigate]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const payload = {
        name: values.name,
        address: values.address,
        gstNumber: values.gstNumber,
        phone: values.phone,
        email: values.email,
        logo: values.logo || "",
        storeId: userStoreId, 
        isActive: values.isActive ?? true,
      };

      console.log(" Adding company with store:", userStoreId);
      await addCompany(payload);
      message.success("Company Added Successfully");
      navigate("/companies");
    } catch (error: any) {
      console.error(" Error:", error);
      
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error("Error adding company");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!userStoreId) {
    return null;
  }

  return (
    <div className="company-page-container">
      <div className="max-width-1400">
        <div className="company-header-section">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            size="large"
            className="company-back-btn"
          >
            Back
          </Button>
          <div className="company-header-content">
            <Title level={2} className="company-title">
              Add Company
            </Title>
            <Text className="company-subtitle">
              Fill in company details below
            </Text>
          </div>
        </div>

        <Card className="company-form-card">
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleSubmit}
            initialValues={{ isActive: true }}
          >
            <Row gutter={[32, 32]}>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="name"
                  label={<Text strong>Company Name *</Text>}
                  rules={[
                    { required: true, message: "Please enter company name" },
                    { min: 2, message: "Minimum 2 characters" },
                    { max: 100, message: "Maximum 100 characters" }
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Enter company name"
                    className="company-input"
                  />
                </Form.Item>

                <Form.Item
                  name="address"
                  label={<Text strong>Address *</Text>}
                  rules={[
                    { required: true, message: "Please enter address" },
                    { min: 5, message: "Minimum 5 characters" },
                    { max: 200, message: "Maximum 200 characters" }
                  ]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Enter complete business address"
                    className="company-textarea"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} lg={12}>
                <Form.Item
                  name="gstNumber"
                  label={<Text strong>GST Number *</Text>}
                  rules={[
                    { required: true, message: "Please enter GST number" },
                    {
                      pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                      message: "Please enter valid GST number format (e.g., 27ABCDE1234F1Z5)",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="27ABCDE1234F1Z5"
                    className="company-gst-input"
                  />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label={<Text strong>Phone Number *</Text>}
                  rules={[
                    { required: true, message: "Please enter phone number" },
                    { 
                      pattern: /^[0-9]{10}$/, 
                      message: "Please enter valid 10-digit phone number" 
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    className="company-input"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={<Text strong>Email *</Text>}
                  rules={[
                    { required: true, message: "Please enter email" },
                    { type: "email", message: "Please enter valid email address" },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="business@example.com"
                    className="company-input"
                  />
                </Form.Item>

                <Form.Item
                  name="logo"
                  label={<Text strong>Logo URL (Optional)</Text>}
                >
                  <Input
                    size="large"
                    placeholder="https://example.com/logo.png"
                    className="company-input"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row style={{ marginTop: 24 }}>
              <Col span={24}>
                <Card className="company-status-card" size="small">
                  <Row align="middle" gutter={16}>
                    <Col flex="auto">
                      <Text strong>Company Status</Text>
                      <div>
                        <Text type="secondary">
                          Set company as active or inactive
                        </Text>
                      </div>
                    </Col>
                    <Col>
                      <Form.Item name="isActive" valuePropName="checked" noStyle>
                        <Switch
                          defaultChecked
                          checkedChildren="Active"
                          unCheckedChildren="Inactive"
                          className="company-status-switch"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            <div className="company-button-container">
              <Button
                size="large"
                onClick={() => navigate("/companies")}
                className="company-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                icon={<CheckOutlined />}
                className="company-submit-btn"
              >
                {loading ? "Adding Company..." : "Add Company"}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AddCompany;
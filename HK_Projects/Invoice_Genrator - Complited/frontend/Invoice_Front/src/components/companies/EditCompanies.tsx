import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCompanyById, updateCompany } from "../../API/companiesAPI"; 
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
  Spin,
  message,  
} from "antd";
import "../../../public/css/company.css";

const { Title, Text } = Typography;

const EditCompany = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setFetchLoading(true);
        const companyData = await getCompanyById(id as string);
        
        form.setFieldsValue({
          name: companyData.name || "",
          address: companyData.address || "",
          phone: companyData.phone || "",
          email: companyData.email || "",
          gstNumber: companyData.gstNumber || "",
          logo: companyData.logo || "",
          isActive: companyData.isActive ?? true,
        });
      } catch (error: any) {
        message.error(error.response?.data?.message || "Error loading company");
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchCompany();
    }
  }, [id, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await updateCompany(id as string, values);
      message.success("Company Updated Successfully ");
      navigate("/companies");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Error updating company");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="company-center-container">
        <Card className="company-loading-card">
          <Spin size="large" className="company-loading-spinner" />
          <Title level={4} className="company-loading-title">
            Loading Company...
          </Title>
        </Card>
      </div>
    );
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
              Edit Company
            </Title>
            <Text className="company-subtitle">
              Update company details below
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
                  label={<Text strong>Logo URL</Text>}
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
                          Toggle to activate/deactivate company
                        </Text>
                      </div>
                    </Col>
                    <Col>
                      <Form.Item name="isActive" valuePropName="checked" noStyle>
                        <Switch
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
                {loading ? "Updating..." : "Update Company"}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default EditCompany;
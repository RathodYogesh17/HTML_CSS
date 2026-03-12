import { useEffect, useState } from "react";
import {
  createInvoice,  
  getMyCompanies,
  getMyProducts,
} from "../../API/InvoicesAPI";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined,
  PercentageOutlined,
  DollarOutlined
} from "@ant-design/icons";
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Row, 
  Col, 
  Typography, 
  message,
  InputNumber,
  Divider,
  Space,
  Tag
} from "antd";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const { Title, Text } = Typography;
const { Option } = Select;

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [companies, setCompanies] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([{ productId: "", qty: 1 }]);
  const [discountType, setDiscountType] = useState<"FIXED" | "PERCENTAGE">("FIXED");
  const [discountValue, setDiscountValue] = useState<number>(0);

  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      navigate("/invoices");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setCompaniesLoading(true);
      setProductsLoading(true);
  
      const [companyRes, productRes] = await Promise.all([
        getMyCompanies(),
        getMyProducts(),
      ]);
      
      setCompanies(companyRes);
      setProducts(productRes);
  
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch data");
    } finally {
      setCompaniesLoading(false);
      setProductsLoading(false);
    }
  };

  const addNewItem = () => {
    setItems([...items, { productId: "", qty: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
    }
  };

  const calculateSubTotal = () => {
    return items.reduce((total, item) => {
      const product = products.find(p => p._id === item.productId);
      return total + (product?.rate || 0) * (item.qty || 0);
    }, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubTotal();
    if (discountType === "PERCENTAGE") {
      return (subtotal * discountValue) / 100;
    } else {
      return discountValue;
    }
  };

  const calculateGST = () => {
    // This is a simplified GST calculation
    // In real scenario, you'd get GST from store settings
    const subtotal = calculateSubTotal();
    const discountAmount = calculateDiscount();
    const taxableAmount = subtotal - discountAmount;
    // Assuming 18% GST for now
    const gstAmount = (taxableAmount * 18) / 100;
    return gstAmount;
  };

  const subtotal = calculateSubTotal();
  const discountAmount = calculateDiscount();
  const gstAmount = calculateGST();
  const grandTotal = subtotal - discountAmount + gstAmount;

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      // Validate all items have products selected
      const invalidItems = items.filter(item => !item.productId);
      if (invalidItems.length > 0) {
        message.error("Please select products for all items");
        setLoading(false);
        return;
      }

      await createInvoice({
        ...values,
        items,
        discount: discountValue,
        discountType,
      });

      message.success("Invoice Created Successfully!");
      navigate("/invoices");
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      padding: "24px",
      background: "#fafafa",
    }}>
      {/* Header */}
      <div style={{ 
        padding: "24px 32px",
        background: "white",
        borderRadius: 16,
        border: "1px solid #e5e5e5",
        marginBottom: 24,
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "white",
              color: "#374151",
              padding: "8px 20px",
              height: "auto",
            }}
          >
            Back
          </Button>
          <Title style={{ 
            margin: 0, 
            fontSize: 24, 
            fontWeight: 600, 
            color: "#111827" 
          }}>
            New Invoice
          </Title>
          <div style={{ width: 120 }} />
        </div>
      </div>

      {/* Form Card */}
      <div style={{
        background: "white",
        borderRadius: 16,
        border: "1px solid #e5e5e5",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ padding: "32px" }}
        >
          {/* Basic Info */}
          <div style={{ marginBottom: 32 }}>
            <Title level={5} style={{ 
              marginBottom: 24, 
              color: "#111827", 
              fontWeight: 600 
            }}>
              Invoice Details
            </Title>
            
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item 
                  name="companyId" 
                  label="Company"
                  rules={[{ required: true, message: "Please select company" }]}
                >
                  <Select
                    placeholder="Select company"
                    loading={companiesLoading}
                    size="large"
                    style={{ borderRadius: 8 }}
                  >
                    {companies.map((company) => (
                      <Option key={company._id} value={company._id}>
                        {company.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item 
                  name="customerName" 
                  label="Customer Name"
                  rules={[{ required: true, message: "Please enter customer name" }]}
                >
                  <Input
                    placeholder="Enter customer name"
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item 
                  name="customerMobile" 
                  label="Mobile Number"
                >
                  <Input
                    placeholder="Enter mobile number"
                    size="large"
                    style={{ borderRadius: 8 }}
                    maxLength={10}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item 
                  name="paymentMethod" 
                  label="Payment Method"
                  rules={[{ required: true, message: "Please select payment method" }]}
                >
                  <Select size="large" style={{ borderRadius: 8 }}>
                    <Option value="CASH">Cash</Option>
                    <Option value="CARD">Card</Option>
                    <Option value="UPI">UPI</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Discount">
                  <Space.Compact style={{ width: "100%" }}>
                    <Select
                      value={discountType}
                      onChange={setDiscountType}
                      size="large"
                      style={{ width: "40%" }}
                    >
                      <Option value="FIXED">Fixed (₹)</Option>
                      <Option value="PERCENTAGE">Percentage (%)</Option>
                    </Select>
                    <InputNumber
                      placeholder={discountType === "FIXED" ? "Enter amount" : "Enter percentage"}
                      value={discountValue}
                      onChange={(value) => setDiscountValue(value || 0)}
                      size="large"
                      min={0}
                      max={discountType === "PERCENTAGE" ? 100 : undefined}
                      style={{ width: "60%", borderRadius: 0 }}
                      formatter={(value) => `${value}`}
                      parser={(value) => parseFloat(value || '0')}
                    />
                  </Space.Compact>
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider style={{ margin: "24px 0" }} />

          {/* Items Section */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: 24
            }}>
              <Title level={5} style={{ 
                margin: 0, 
                color: "#111827", 
                fontWeight: 600 
              }}>
                Items ({items.length})
              </Title>
              <Button
                icon={<PlusOutlined />}
                onClick={addNewItem}
                style={{
                  borderRadius: 8,
                  border: "1px solid #111827",
                  background: "white",
                  color: "#111827",
                }}
              >
                Add Item
              </Button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {items.map((item, index) => {
                const product = products.find(p => p._id === item.productId);
                const itemTotal = (product?.rate || 0) * (item.qty || 0);
                
                return (
                  <div
                    key={index}
                    style={{
                      padding: "20px",
                      background: "#f9fafb",
                      borderRadius: 12,
                      border: "1px solid #e5e5e5",
                    }}
                  >
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      marginBottom: 16 
                    }}>
                      <Text style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                        Item {index + 1}
                      </Text>
                      {items.length > 1 && (
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeItem(index)}
                          size="small"
                          style={{ borderRadius: 6 }}
                        />
                      )}
                    </div>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Text style={{ 
                          color: "#6b7280", 
                          fontSize: 13, 
                          fontWeight: 500,
                          display: "block",
                          marginBottom: 4
                        }}>
                          Product *
                        </Text>
                        <Select
                          placeholder="Select product"
                          loading={productsLoading}
                          size="large"
                          style={{ width: "100%", borderRadius: 8 }}
                          onChange={(value) => {
                            const updatedItems = [...items];
                            updatedItems[index].productId = value;
                            updatedItems[index].qty = 1; // Reset quantity when product changes
                            setItems(updatedItems);
                          }}
                          value={item.productId || undefined}
                        >
                          {products.map((product) => (
                            <Option key={product._id} value={product._id}>
                              <Space direction="vertical" size={2}>
                                <Text strong>{product.name}</Text>
                                <Space size={4}>
                                  <Tag color="blue">₹{product.rate}</Tag>
                                  <Tag color={product.stock > 0 ? "green" : "red"}>
                                    Stock: {product.stock}
                                  </Tag>
                                  {product.gstPercent && (
                                    <Tag color="purple">GST: {product.gstPercent}%</Tag>
                                  )}
                                </Space>
                              </Space>
                            </Option>
                          ))}
                        </Select>
                      </Col>
                      
                      <Col xs={24} md={6}>
                        <Text style={{ 
                          color: "#6b7280", 
                          fontSize: 13, 
                          fontWeight: 500,
                          display: "block",
                          marginBottom: 4
                        }}>
                          Quantity
                        </Text>
                        <InputNumber
                          min={1}
                          max={product?.stock || 99}
                          value={item.qty}
                          size="large"
                          style={{ width: "100%", borderRadius: 8 }}
                          onChange={(value) => {
                            const updatedItems = [...items];
                            updatedItems[index].qty = value || 1;
                            setItems(updatedItems);
                          }}
                        />
                      </Col>

                      <Col xs={24} md={6}>
                        <Text style={{ 
                          color: "#6b7280", 
                          fontSize: 13, 
                          fontWeight: 500,
                          display: "block",
                          marginBottom: 4
                        }}>
                          Item Total
                        </Text>
                        <div style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: "#111827",
                          background: "white",
                          padding: "8px 16px",
                          borderRadius: 8,
                          border: "1px solid #e5e5e5",
                          textAlign: "right"
                        }}>
                          ₹{itemTotal.toLocaleString()}
                        </div>
                      </Col>
                    </Row>

                    {product && (
                      <div style={{ 
                        marginTop: 12, 
                        padding: "8px 12px", 
                        background: "#e5e7eb", 
                        borderRadius: 6,
                        fontSize: 12,
                        color: "#4b5563"
                      }}>
                        <Space split={<span>•</span>}>
                          {product.batchNo && <span>Batch: {product.batchNo}</span>}
                          {product.expiry && <span>Expiry: {new Date(product.expiry).toLocaleDateString()}</span>}
                          {product.gstPercent && <span>GST: {product.gstPercent}%</span>}
                        </Space>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Section */}
          <div style={{ 
            background: "#f9fafb",
            padding: "24px",
            borderRadius: 12,
            marginTop: 24
          }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Text type="secondary">Subtotal</Text>
                <Title level={4} style={{ margin: 0, color: "#111827" }}>
                  ₹{subtotal.toLocaleString()}
                </Title>
              </Col>
              
              {discountAmount > 0 && (
                <Col xs={24} sm={12} md={6}>
                  <Text type="secondary" style={{ color: "#ef4444" }}>Discount</Text>
                  <Title level={4} style={{ margin: 0, color: "#ef4444" }}>
                    - ₹{discountAmount.toLocaleString()}
                    {discountType === "PERCENTAGE" && ` (${discountValue}%)`}
                  </Title>
                </Col>
              )}
              
              <Col xs={24} sm={12} md={6}>
                <Text type="secondary">GST (18%)</Text>
                <Title level={4} style={{ margin: 0, color: "#059669" }}>
                  + ₹{gstAmount.toLocaleString()}
                </Title>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Text type="secondary">Grand Total</Text>
                <Title level={3} style={{ margin: 0, color: "#111827" }}>
                  ₹{grandTotal.toLocaleString()}
                </Title>
              </Col>
            </Row>
          </div>

          {/* Form Actions */}
          <div style={{ 
            display: "flex", 
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid #e5e5e5"
          }}>
            <Button
              size="large"
              onClick={() => navigate("/invoices")}
              style={{
                padding: "8px 24px",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 500,
                border: "1px solid #d1d5db",
                background: "white",
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
              icon={<FileTextOutlined />}
              style={{
                padding: "8px 32px",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 500,
                background: "#111827",
                border: "none",
                height: "auto",
              }}
            >
              Create Invoice
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default CreateInvoice;
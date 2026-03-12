import { useEffect, useState } from "react";
import {
  getInvoiceById,
  updateInvoice,
  getMyCompanies,
  getMyProducts,
} from "../../API/InvoicesAPI";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined
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
  Spin,
  Alert
} from "antd";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const { Title, Text } = Typography;

const EditInvoice = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [companies, setCompanies] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingInvoice, setFetchingInvoice] = useState(true);
  const [items, setItems] = useState([{ productId: "", qty: 1 }]);
  const [errorMessage, setErrorMessage] = useState("");

  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (id) {
      fetchInvoiceDetails();
    }
  }, [id]);

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

  const fetchInvoiceDetails = async () => {
    try {
      setFetchingInvoice(true);
      setErrorMessage("");
      
      const response = await getInvoiceById(id!);
      const invoiceData = response.data || response;
      
      console.log("Invoice Data:", invoiceData);
      
      // Set form values
      form.setFieldsValue({
        companyId: invoiceData.companyId,
        customerName: invoiceData.customerName,
        customerMobile: invoiceData.customerMobile,
        paymentMethod: invoiceData.paymentMethod,
      });
      
      // Set items
      if (invoiceData.items && invoiceData.items.length > 0) {
        const formattedItems = invoiceData.items.map((item: any) => ({
          productId: typeof item.productId === 'object' ? item.productId._id : item.productId,
          qty: item.qty
        }));
        setItems(formattedItems);
      }
      
    } catch (error: any) {
      console.error("Error fetching invoice:", error);
      setErrorMessage(error.response?.data?.message || "Failed to fetch invoice details");
    } finally {
      setFetchingInvoice(false);
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

  const subTotal = calculateSubTotal();

  // 🔥 FIXED: Clean payload function
  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      setErrorMessage("");
      
      // Validate items
      const invalidItems = items.filter(item => !item.productId);
      if (invalidItems.length > 0) {
        message.error("Please select product for all items");
        setLoading(false);
        return;
      }
      
      // 🔥 Build payload - only include fields that exist
      const payload: any = {};
      
      if (values.companyId) payload.companyId = values.companyId;
      if (values.customerName) payload.customerName = values.customerName;
      if (values.customerMobile) payload.customerMobile = values.customerMobile;
      if (values.paymentMethod) payload.paymentMethod = values.paymentMethod;
      
      // Always send items
      payload.items = items.map(item => ({
        productId: item.productId,
        qty: item.qty
      }));

      console.log("SENDING PAYLOAD:", JSON.stringify(payload, null, 2));
      
      const response = await updateInvoice(id!, payload);
      
      console.log("UPDATE RESPONSE:", response);
      message.success("Invoice Updated Successfully!");
      navigate("/invoices");
      
    } catch (error: any) {
      console.error("UPDATE ERROR:", error);
      console.error("ERROR RESPONSE:", error.response?.data);
      
      const errorMsg = error.response?.data?.message || "Failed to update invoice";
      setErrorMessage(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingInvoice) {
    return (
      <div style={{
        minHeight: "100vh",
        padding: "48px 48px",
        background: "#fafafa",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <Spin size="large" tip="Loading invoice details..." />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      padding: "48px 48px",
      background: "#fafafa",
    }}>
      <div style={{ maxWidth: "none" }}>
        {/* Header */}
        <div style={{ 
          padding: "32px 40px",
          background: "white",
          borderRadius: 16,
          border: "1px solid #e5e5e5",
          marginBottom: 32,
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
                padding: "12px 20px",
              }}
            >
              Back
            </Button>
            <Title style={{ 
              margin: 0, 
              fontSize: 28, 
              fontWeight: 600, 
              color: "#111827" 
            }}>
              Edit Invoice
            </Title>
            <div style={{ width: 120 }} />
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <Alert
            message="Error"
            description={errorMessage}
            type="error"
            showIcon
            style={{ marginBottom: 24, borderRadius: 8 }}
            closable
            onClose={() => setErrorMessage("")}
          />
        )}

        {/* Single Form Card */}
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
            style={{ padding: "48px" }}
          >
            {/* Basic Info */}
            <div style={{ marginBottom: 48 }}>
              <Title level={5} style={{ 
                marginBottom: 32, 
                color: "#111827", 
                fontWeight: 600 
              }}>
                Invoice Details
              </Title>
              
              <Row gutter={24}>
                <Col xs={24} md={8}>
                  <div style={{ marginBottom: 24 }}>
                    <Text style={{ 
                      color: "#6b7280", 
                      fontSize: 14, 
                      fontWeight: 500,
                      marginBottom: 8,
                      display: "block"
                    }}>
                      Company *
                    </Text>
                    <Form.Item 
                      name="companyId" 
                      rules={[{ required: true, message: "Please select company" }]}
                    >
                      <Select
                        placeholder="Select company"
                        loading={companiesLoading}
                        size="large"
                        style={{ borderRadius: 12 }}
                      >
                        {companies.map((company) => (
                          <Select.Option key={company._id} value={company._id}>
                            {company.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </Col>
                
                <Col xs={24} md={8}>
                  <div style={{ marginBottom: 24 }}>
                    <Text style={{ 
                      color: "#6b7280", 
                      fontSize: 14, 
                      fontWeight: 500,
                      marginBottom: 8,
                      display: "block"
                    }}>
                      Customer *
                    </Text>
                    <Form.Item 
                      name="customerName" 
                      rules={[{ required: true, message: "Please enter customer name" }]}
                    >
                      <Input
                        placeholder="Customer name"
                        size="large"
                        style={{
                          borderRadius: 12,
                          border: "1px solid #d1d5db",
                          padding: "16px 20px",
                        }}
                      />
                    </Form.Item>
                  </div>
                </Col>
                
                <Col xs={24} md={8}>
                  <div style={{ marginBottom: 24 }}>
                    <Text style={{ 
                      color: "#6b7280", 
                      fontSize: 14, 
                      fontWeight: 500,
                      marginBottom: 8,
                      display: "block"
                    }}>
                      Mobile
                    </Text>
                    <Form.Item name="customerMobile">
                      <Input
                        placeholder="Customer mobile"
                        size="large"
                        style={{
                          borderRadius: 12,
                          border: "1px solid #d1d5db",
                          padding: "16px 20px",
                        }}
                      />
                    </Form.Item>
                  </div>
                </Col>
              </Row>

              <div style={{ marginBottom: 24 }}>
                <Text style={{ 
                  color: "#6b7280", 
                  fontSize: 14, 
                  fontWeight: 500,
                  marginBottom: 8,
                  display: "block"
                }}>
                  Payment Method *
                </Text>
                <Form.Item 
                  name="paymentMethod" 
                  rules={[{ required: true, message: "Please select payment method" }]}
                >
                  <Select size="large" style={{ borderRadius: 12 }}>
                    <Select.Option value="CASH">Cash</Select.Option>
                    <Select.Option value="CARD">Card</Select.Option>
                    <Select.Option value="UPI">UPI</Select.Option>
                  </Select>
                </Form.Item>
              </div>
            </div>

            {/* Items Section */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: 32,
                paddingBottom: 24,
                borderBottom: "1px solid #e5e5e5"
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
                    padding: "12px 24px",
                  }}
                >
                  Add Item
                </Button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "32px",
                      background: "#f9fafb",
                      borderRadius: 12,
                      border: "1px solid #e5e5e5",
                    }}
                  >
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      marginBottom: 24 
                    }}>
                      <Text style={{ 
                        fontSize: 18, 
                        fontWeight: 600, 
                        color: "#111827" 
                      }}>
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

                    <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
                      <div style={{ flex: 3 }}>
                        <Text style={{ 
                          color: "#6b7280", 
                          fontSize: 14, 
                          fontWeight: 500,
                          marginBottom: 8,
                          display: "block"
                        }}>
                          Product *
                        </Text>
                        <Select
                          placeholder="Select product"
                          loading={productsLoading}
                          size="large"
                          style={{ borderRadius: 12, width: "100%" }}
                          onChange={(value) => {
                            const updatedItems = [...items];
                            updatedItems[index].productId = value;
                            setItems(updatedItems);
                          }}
                          value={item.productId || undefined}
                        >
                          {products.map((product) => (
                            <Select.Option key={product._id} value={product._id}>
                              {product.name} - ₹{product.rate} (Stock: {product.stock})
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <Text style={{ 
                          color: "#6b7280", 
                          fontSize: 14, 
                          fontWeight: 500,
                          marginBottom: 8,
                          display: "block"
                        }}>
                          Qty
                        </Text>
                        <Input
                          type="number"
                          min={1}
                          value={item.qty}
                          size="large"
                          style={{
                            borderRadius: 12,
                            textAlign: "center",
                            fontSize: 18,
                            fontWeight: 600,
                          }}
                          onChange={(e) => {
                            const updatedItems = [...items];
                            updatedItems[index].qty = Number(e.target.value) || 1;
                            setItems(updatedItems);
                          }}
                        />
                      </div>

                      <div style={{ flex: 1, textAlign: "right" }}>
                        <Text style={{ 
                          color: "#6b7280", 
                          fontSize: 14, 
                          fontWeight: 500,
                          marginBottom: 8,
                          display: "block"
                        }}>
                          Amount
                        </Text>
                        <div style={{
                          fontSize: 24,
                          fontWeight: 700,
                          color: "#111827",
                        }}>
                          ₹{(() => {
                            const product = products.find(p => p._id === item.productId);
                            return ((product?.rate || 0) * (item.qty || 0)).toLocaleString();
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "flex-end",
              paddingTop: 32,
              borderTop: "2px solid #e5e5e5",
              gap: 24
            }}>
              <div>
                <Text style={{ 
                  fontSize: 32, 
                  fontWeight: 700, 
                  color: "#111827" 
                }}>
                  Subtotal ({items.length} items)
                </Text>
              </div>
              
              <div style={{ 
                display: "flex", 
                gap: 16, 
                flexDirection: "column",
                alignItems: "flex-end"
              }}>
                <div style={{ 
                  fontSize: 48, 
                  fontWeight: 800, 
                  color: "#111827" 
                }}>
                  ₹{subTotal.toLocaleString()}
                </div>
                
                <div style={{ display: "flex", gap: 12 }}>
                  <Button
                    size="large"
                    onClick={() => navigate(-1)}
                    style={{
                      padding: "16px 32px",
                      borderRadius: 12,
                      fontSize: 16,
                      fontWeight: 600,
                      border: "1px solid #d1d5db",
                      background: "white",
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
                      padding: "16px 32px",
                      borderRadius: 12,
                      fontSize: 16,
                      fontWeight: 600,
                      background: "#111827",
                      border: "none",
                    }}
                  >
                    Update Invoice
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EditInvoice;
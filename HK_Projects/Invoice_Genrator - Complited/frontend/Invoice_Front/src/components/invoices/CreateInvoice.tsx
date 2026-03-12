// import { useEffect, useState } from "react";
// import {
//   createInvoice,  
//   getMyCompanies,
//   getMyProducts,
// } from "../../API/InvoicesAPI";
// import { useNavigate } from "react-router-dom";
// import {
//   ArrowLeftOutlined,
//   PlusOutlined,
//   DeleteOutlined,
//   FileTextOutlined
// } from "@ant-design/icons";
// import { 
//   Form, 
//   Input, 
//   Select, 
//   Button, 
//   Row, 
//   Col, 
//   Typography, 
//   message
// } from "antd";
// import { useSelector } from "react-redux";
// import type { RootState } from "../../store/store";

// const { Title, Text } = Typography;

// const CreateInvoice = () => {
//   const navigate = useNavigate();
//   const [form] = Form.useForm();
//   const [companies, setCompanies] = useState<any[]>([]);
//   const [products, setProducts] = useState<any[]>([]);
//   const [companiesLoading, setCompaniesLoading] = useState(false);
//   const [productsLoading, setProductsLoading] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [items, setItems] = useState([{ productId: "", qty: 1 }]);

//   const user = useSelector((state: RootState) => state.auth.user);

//   useEffect(() => {
//     if (user?.role === "ADMIN") {
//       navigate("/invoices");
//     }
//   }, [user, navigate]);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       setCompaniesLoading(true);
//       setProductsLoading(true);
  
//       const [companyRes, productRes] = await Promise.all([
//         getMyCompanies(),
//         getMyProducts(),
//       ]);
      
      
      
//       setCompanies(companyRes);
//       setProducts(productRes);
  
//     } catch (error) {
//       console.error(error);
//       message.error("Failed to fetch data");
//     } finally {
//       setCompaniesLoading(false);
//       setProductsLoading(false);
//     }
//   };

//   const addNewItem = () => {
//     setItems([...items, { productId: "", qty: 1 }]);
//   };

//   const removeItem = (index: number) => {
//     if (items.length > 1) {
//       const updatedItems = items.filter((_, i) => i !== index);
//       setItems(updatedItems);
//     }
//   };

//   const calculateSubTotal = () => {
//     return items.reduce((total, item) => {
//       const product = products.find(p => p._id === item.productId);
//       return total + (product?.rate || 0) * (item.qty || 0);
//     }, 0);
//   };

//   const subTotal = calculateSubTotal();

//   const onFinish = async (values: any) => {
//     try {
//       setLoading(true);
//       await createInvoice({
//         ...values,
//         items,
//       });

//       console.log("FORM VALUES:", values);
//       console.log("ITEMS:", items);
//       message.success("Invoice Created Successfully!");
//       navigate("/invoices");
//     } catch (error: any) {
//       console.error(error);
//       message.error(error.response?.data?.message || "Failed to create invoice");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{
//       minHeight: "100vh",
//       padding: "48px 48px",
//       background: "#fafafa",
//     }}>
//       <div style={{ maxWidth: "none" }}>
//         {/* Header */}
//         <div style={{ 
//           padding: "32px 40px",
//           background: "white",
//           borderRadius: 16,
//           border: "1px solid #e5e5e5",
//           marginBottom: 32,
//         }}>
//           <div style={{ 
//             display: "flex", 
//             justifyContent: "space-between", 
//             alignItems: "center" 
//           }}>
//             <Button
//               icon={<ArrowLeftOutlined />}
//               onClick={() => navigate(-1)}
//               style={{
//                 borderRadius: 8,
//                 border: "1px solid #d1d5db",
//                 background: "white",
//                 color: "#374151",
//                 padding: "12px 20px",
//               }}
//             >
//               Back
//             </Button>
//             <Title style={{ 
//               margin: 0, 
//               fontSize: 28, 
//               fontWeight: 600, 
//               color: "#111827" 
//             }}>
//               New Invoice
//             </Title>
//             <div style={{ width: 120 }} />
//           </div>
//         </div>

//         {/* Single Form Card */}
//         <div style={{
//           background: "white",
//           borderRadius: 16,
//           border: "1px solid #e5e5e5",
//           overflow: "hidden",
//           boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//         }}>
//           <Form
//             form={form}
//             layout="vertical"
//             onFinish={onFinish}
//             style={{ padding: "48px" }}
//           >
//             {/* Basic Info */}
//             <div style={{ marginBottom: 48 }}>
//               <Title level={5} style={{ 
//                 marginBottom: 32, 
//                 color: "#111827", 
//                 fontWeight: 600 
//               }}>
//                 Invoice Details
//               </Title>
              
//               <Row gutter={24}>
//                 <Col xs={24} md={8}>
//                   <div style={{ marginBottom: 24 }}>
//                     <Text style={{ 
//                       color: "#6b7280", 
//                       fontSize: 14, 
//                       fontWeight: 500,
//                       marginBottom: 8,
//                       display: "block"
//                     }}>
//                       Company *
//                     </Text>
//                     <Form.Item 
//                       name="companyId" 
//                       rules={[{ required: true, message: "Please select company" }]}
//                     >
//                       <Select
//                         placeholder="Select company"
//                         loading={companiesLoading}
//                         size="large"
//                         style={{ borderRadius: 12 }}
//                       >
//                         {companies.map((company) => (
//                           <Select.Option key={company._id} value={company._id}>
//                             {company.name}
//                           </Select.Option>
//                         ))}
//                       </Select>
//                     </Form.Item>
//                   </div>
//                 </Col>
                
//                 <Col xs={24} md={8}>
//                   <div style={{ marginBottom: 24 }}>
//                     <Text style={{ 
//                       color: "#6b7280", 
//                       fontSize: 14, 
//                       fontWeight: 500,
//                       marginBottom: 8,
//                       display: "block"
//                     }}>
//                       Customer *
//                     </Text>
//                     <Form.Item 
//                       name="customerName" 
//                       rules={[{ required: true, message: "Please enter customer name" }]}
//                     >
//                       <Input
//                         placeholder="Customer name"
//                         size="large"
//                         style={{
//                           borderRadius: 12,
//                           border: "1px solid #d1d5db",
//                           padding: "16px 20px",
//                         }}
//                       />
//                     </Form.Item>
//                   </div>
//                 </Col>
                
//                 <Col xs={24} md={8}>
//                   <div style={{ marginBottom: 24 }}>
//                     <Text style={{ 
//                       color: "#6b7280", 
//                       fontSize: 14, 
//                       fontWeight: 500,
//                       marginBottom: 8,
//                       display: "block"
//                     }}>
//                       Mobile
//                     </Text>
//                     <Form.Item name="customerMobile">
//                       <Input
//                         placeholder="Customer mobile"
//                         size="large"
//                         style={{
//                           borderRadius: 12,
//                           border: "1px solid #d1d5db",
//                           padding: "16px 20px",
//                         }}
//                       />
//                     </Form.Item>
//                   </div>
//                 </Col>
//               </Row>

//               <div style={{ marginBottom: 24 }}>
//                 <Text style={{ 
//                   color: "#6b7280", 
//                   fontSize: 14, 
//                   fontWeight: 500,
//                   marginBottom: 8,
//                   display: "block"
//                 }}>
//                   Payment Method *
//                 </Text>
//                 <Form.Item 
//                   name="paymentMethod" 
//                   rules={[{ required: true, message: "Please select payment method" }]}
//                 >
//                   <Select size="large" style={{ borderRadius: 12 }}>
//                     <Select.Option value="CASH">Cash</Select.Option>
//                     <Select.Option value="CARD">Card</Select.Option>
//                     <Select.Option value="UPI">UPI</Select.Option>
//                   </Select>
//                 </Form.Item>
//               </div>
//             </div>

//             {/* Items Section */}
//             <div style={{ marginBottom: 48 }}>
//               <div style={{ 
//                 display: "flex", 
//                 justifyContent: "space-between", 
//                 alignItems: "center", 
//                 marginBottom: 32,
//                 paddingBottom: 24,
//                 borderBottom: "1px solid #e5e5e5"
//               }}>
//                 <Title level={5} style={{ 
//                   margin: 0, 
//                   color: "#111827", 
//                   fontWeight: 600 
//                 }}>
//                   Items ({items.length})
//                 </Title>
//                 <Button
//                   icon={<PlusOutlined />}
//                   onClick={addNewItem}
//                   style={{
//                     borderRadius: 8,
//                     border: "1px solid #111827",
//                     background: "white",
//                     color: "#111827",
//                     padding: "12px 24px",
//                   }}
//                 >
//                   Add Item
//                 </Button>
//               </div>

//               <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
//                 {items.map((item, index) => (
//                   <div
//                     key={index}
//                     style={{
//                       padding: "32px",
//                       background: "#f9fafb",
//                       borderRadius: 12,
//                       border: "1px solid #e5e5e5",
//                     }}
//                   >
//                     <div style={{ 
//                       display: "flex", 
//                       justifyContent: "space-between", 
//                       alignItems: "center", 
//                       marginBottom: 24 
//                     }}>
//                       <Text style={{ 
//                         fontSize: 18, 
//                         fontWeight: 600, 
//                         color: "#111827" 
//                       }}>
//                         Item {index + 1}
//                       </Text>
//                       {items.length > 1 && (
//                         <Button
//                           danger
//                           icon={<DeleteOutlined />}
//                           onClick={() => removeItem(index)}
//                           size="small"
//                           style={{ borderRadius: 6 }}
//                         />
//                       )}
//                     </div>

//                     <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
//                       <div style={{ flex: 3 }}>
//                         <Text style={{ 
//                           color: "#6b7280", 
//                           fontSize: 14, 
//                           fontWeight: 500,
//                           marginBottom: 8,
//                           display: "block"
//                         }}>
//                           Product *
//                         </Text>
//                         <Select
//                           placeholder="Select product"
//                           loading={productsLoading}
//                           size="large"
//                           style={{ borderRadius: 12, width: "100%" }}
//                           onChange={(value) => {
//                             const updatedItems = [...items];
//                             updatedItems[index].productId = value;
//                             setItems(updatedItems);
//                           }}
//                           value={item.productId || undefined}
//                         >
//                           {products.map((product) => (
//                             <Select.Option key={product._id} value={product._id}>
//                               {product.name} - ₹{product.rate} (Stock: {product.stock})
//                             </Select.Option>
//                           ))}
//                         </Select>
//                       </div>
                      
//                       <div style={{ flex: 1 }}>
//                         <Text style={{ 
//                           color: "#6b7280", 
//                           fontSize: 14, 
//                           fontWeight: 500,
//                           marginBottom: 8,
//                           display: "block"
//                         }}>
//                           Qty
//                         </Text>
//                         <Input
//                           type="number"
//                           min={1}
//                           value={item.qty}
//                           size="large"
//                           style={{
//                             borderRadius: 12,
//                             textAlign: "center",
//                             fontSize: 18,
//                             fontWeight: 600,
//                           }}
//                           onChange={(e) => {
//                             const updatedItems = [...items];
//                             updatedItems[index].qty = Number(e.target.value) || 1;
//                             setItems(updatedItems);
//                           }}
//                         />
//                       </div>

//                       <div style={{ flex: 1, textAlign: "right" }}>
//                         <Text style={{ 
//                           color: "#6b7280", 
//                           fontSize: 14, 
//                           fontWeight: 500,
//                           marginBottom: 8,
//                           display: "block"
//                         }}>
//                           Amount
//                         </Text>
//                         <div style={{
//                           fontSize: 24,
//                           fontWeight: 700,
//                           color: "#111827",
//                         }}>
//                           ₹{(() => {
//                             const product = products.find(p => p._id === item.productId);
//                             return ((product?.rate || 0) * (item.qty || 0)).toLocaleString();
//                           })()}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div style={{ 
//               display: "flex", 
//               justifyContent: "space-between", 
//               alignItems: "flex-end",
//               paddingTop: 32,
//               borderTop: "2px solid #e5e5e5",
//               gap: 24
//             }}>
//               <div>
//                 <Text style={{ 
//                   fontSize: 32, 
//                   fontWeight: 700, 
//                   color: "#111827" 
//                 }}>
//                   Subtotal ({items.length} items)
//                 </Text>
//               </div>
              
//               <div style={{ 
//                 display: "flex", 
//                 gap: 16, 
//                 flexDirection: "column",
//                 alignItems: "flex-end"
//               }}>
//                 <div style={{ 
//                   fontSize: 48, 
//                   fontWeight: 800, 
//                   color: "#111827" 
//                 }}>
//                   ₹{subTotal.toLocaleString()}
//                 </div>
                
//                 <div style={{ display: "flex", gap: 12 }}>
//                   <Button
//                     size="large"
//                     onClick={() => navigate(-1)}
//                     style={{
//                       padding: "16px 32px",
//                       borderRadius: 12,
//                       fontSize: 16,
//                       fontWeight: 600,
//                       border: "1px solid #d1d5db",
//                       background: "white",
//                     }}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     type="primary"
//                     htmlType="submit"
//                     size="large"
//                     loading={loading}
//                     icon={<FileTextOutlined />}
//                     style={{
//                       padding: "16px 32px",
//                       borderRadius: 12,
//                       fontSize: 16,
//                       fontWeight: 600,
//                       background: "#111827",
//                       border: "none",
//                     }}
//                   >
//                     Create Invoice
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </Form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateInvoice;



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
  Card,
  Space,
  Table
} from "antd";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const { Title, Text } = Typography;
const { Option } = Select;

interface InvoiceItem {
  productId: string;
  productName?: string;
  qty: number;
  rate: number;
  mrp: number;
  total?: number;
}

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [companies, setCompanies] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([
    { productId: "", qty: 1, rate: 0, mrp: 0 }
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"FIXED" | "PERCENTAGE">("FIXED");

  const user = useSelector((state: RootState) => state.auth.user);

  // Redirect admin
  useEffect(() => {
    if (user?.role === "ADMIN") {
      navigate("/invoices");
    }
  }, [user, navigate]);

  // Fetch initial data
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

      setCompanies(companyRes || []);
      setProducts(productRes || []);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch data");
    } finally {
      setCompaniesLoading(false);
      setProductsLoading(false);
    }
  };

  // Calculate totals with live updates
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.rate * item.qty);
    }, 0);

    let discountAmount = 0;
    if (discountType === "PERCENTAGE") {
      discountAmount = (subtotal * discount) / 100;
    } else {
      discountAmount = discount;
    }

    const taxableAmount = subtotal - discountAmount;
    // GST will be calculated on backend based on store settings
    // For display, we'll show approximate GST (will be replaced with actual from backend)
    const estimatedGst = taxableAmount * 0.18; // Assuming 18% GST
    const grandTotal = taxableAmount + estimatedGst;

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      estimatedGst,
      grandTotal
    };
  };

  const totals = calculateTotals();

  const addNewItem = () => {
    setItems([...items, { productId: "", qty: 1, rate: 0, mrp: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // If product is selected, auto-fill with product data
    if (field === "productId") {
      const selectedProduct = products.find(p => p._id === value);
      if (selectedProduct) {
        updatedItems[index].productName = selectedProduct.name;
        // Don't auto-fill rate/mrp - user will enter manually
      }
    }
    
    setItems(updatedItems);
  };

  const onFinish = async (values: any) => {
    try {
      // Validate all items have required fields
      const invalidItems = items.filter(
        item => !item.productId || item.rate <= 0 || item.qty < 1
      );
      
      if (invalidItems.length > 0) {
        message.error("Please fill all item details correctly");
        return;
      }

      setLoading(true);
      
      const invoiceData = {
        ...values,
        items: items.map(({ productId, qty, rate, mrp }) => ({
          productId,
          qty,
          rate,
          mrp
        })),
        discount,
        discountType
      };

      await createInvoice(invoiceData);
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
    <div style={{ padding: 24, background: "#fafafa", minHeight: "100vh" }}>
      <Card>
        {/* Header */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: 24
        }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            size="large"
          >
            Back
          </Button>
          <Title level={3} style={{ margin: 0 }}>Create New Invoice</Title>
          <div style={{ width: 100 }} />
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          {/* Basic Info Row */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="companyId"
                label="Company"
                rules={[{ required: true, message: "Please select company" }]}
              >
                <Select
                  placeholder="Select company"
                  loading={companiesLoading}
                  size="large"
                  showSearch
                  optionFilterProp="children"
                >
                  {companies.map((company) => (
                    <Option key={company._id} value={company._id}>
                      {company.name} - {company.gstNumber}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="customerName"
                label="Customer Name"
                rules={[{ required: true, message: "Please enter customer name" }]}
              >
                <Input placeholder="Enter customer name" size="large" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item name="customerMobile" label="Mobile Number">
                <Input placeholder="Enter mobile number" size="large" maxLength={10} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="paymentMethod"
                label="Payment Method"
                rules={[{ required: true, message: "Please select payment method" }]}
              >
                <Select size="large" placeholder="Select payment method">
                  <Option value="CASH">Cash</Option>
                  <Option value="CREDIT">Credit</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
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
                    value={discount}
                    onChange={(value) => setDiscount(value || 0)}
                    size="large"
                    min={0}
                    max={discountType === "PERCENTAGE" ? 100 : undefined}
                    style={{ width: "60%" }}
                    formatter={(value) => `${value}`}
                    parser={(value) => parseFloat(value || '0')}
                    placeholder={discountType === "FIXED" ? "Amount" : "Percentage"}
                  />
                </Space.Compact>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Items</Divider>

          {/* Items Header */}
          <Row gutter={16} style={{ marginBottom: 8, fontWeight: "bold" }}>
            <Col span={8}>Product</Col>
            <Col span={4}>MRP (₹)</Col>
            <Col span={4}>Rate (₹)</Col>
            <Col span={3}>Qty</Col>
            <Col span={4}>Total (₹)</Col>
            <Col span={1}></Col>
          </Row>

          {/* Items List */}
          {items.map((item, index) => {
            const selectedProduct = products.find(p => p._id === item.productId);
            const itemTotal = item.rate * item.qty;

            return (
              <Row gutter={16} key={index} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Select
                    placeholder="Select product"
                    loading={productsLoading}
                    size="large"
                    style={{ width: "100%" }}
                    value={item.productId || undefined}
                    onChange={(value) => updateItem(index, "productId", value)}
                    showSearch
                    optionFilterProp="children"
                  >
                    {products.map((product) => (
                      <Option key={product._id} value={product._id}>
                        {product.name} - {product.companyId?.name}
                      </Option>
                    ))}
                  </Select>
                </Col>

                <Col span={4}>
                  <InputNumber
                    min={0}
                    value={item.mrp}
                    onChange={(value) => updateItem(index, "mrp", value || 0)}
                    size="large"
                    style={{ width: "100%" }}
                    placeholder="MRP"
                  />
                </Col>

                <Col span={4}>
                  <InputNumber
                    min={0}
                    value={item.rate}
                    onChange={(value) => updateItem(index, "rate", value || 0)}
                    size="large"
                    style={{ width: "100%" }}
                    placeholder="Rate"
                  />
                </Col>

                <Col span={3}>
                  <InputNumber
                    min={1}
                    value={item.qty}
                    onChange={(value) => updateItem(index, "qty", value || 1)}
                    size="large"
                    style={{ width: "100%" }}
                  />
                </Col>

                <Col span={4}>
                  <InputNumber
                    value={itemTotal}
                    size="large"
                    style={{ width: "100%", fontWeight: "bold" }}
                    disabled
                    formatter={(value) => `₹ ${value}`}
                  />
                </Col>

                <Col span={1}>
                  {items.length > 1 && (
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeItem(index)}
                      size="large"
                    />
                  )}
                </Col>
              </Row>
            );
          })}

          {/* Add Item Button */}
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addNewItem}
            size="large"
            style={{ width: "100%", marginTop: 8 }}
          >
            Add Item
          </Button>

          <Divider />

          {/* Summary Section with Live Updates */}
          <Row gutter={16}>
            <Col span={16} offset={8}>
              <Card style={{ background: "#f5f5f5" }}>
                <Row>
                  <Col span={12}>
                    <Text strong>Subtotal:</Text>
                  </Col>
                  <Col span={12} style={{ textAlign: "right" }}>
                    <Text strong>₹ {totals.subtotal.toFixed(2)}</Text>
                  </Col>
                </Row>

                {totals.discountAmount > 0 && (
                  <Row>
                    <Col span={12}>
                      <Text type="danger">Discount:</Text>
                    </Col>
                    <Col span={12} style={{ textAlign: "right" }}>
                      <Text type="danger">- ₹ {totals.discountAmount.toFixed(2)}</Text>
                    </Col>
                  </Row>
                )}

                <Row>
                  <Col span={12}>
                    <Text>Taxable Amount:</Text>
                  </Col>
                  <Col span={12} style={{ textAlign: "right" }}>
                    <Text>₹ {totals.taxableAmount.toFixed(2)}</Text>
                  </Col>
                </Row>

                <Row>
                  <Col span={12}>
                    <Text>Estimated GST (18%):</Text>
                  </Col>
                  <Col span={12} style={{ textAlign: "right" }}>
                    <Text>₹ {totals.estimatedGst.toFixed(2)}</Text>
                  </Col>
                </Row>

                <Divider style={{ margin: "12px 0" }} />

                <Row>
                  <Col span={12}>
                    <Title level={4} style={{ margin: 0 }}>Grand Total:</Title>
                  </Col>
                  <Col span={12} style={{ textAlign: "right" }}>
                    <Title level={4} style={{ margin: 0, color: "#2C3E50" }}>
                      ₹ {totals.grandTotal.toFixed(2)}
                    </Title>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Form Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
            <Button size="large" onClick={() => navigate("/invoices")}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              icon={<FileTextOutlined />}
              style={{ background: "#2C3E50" }}
            >
              Create Invoice
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CreateInvoice;
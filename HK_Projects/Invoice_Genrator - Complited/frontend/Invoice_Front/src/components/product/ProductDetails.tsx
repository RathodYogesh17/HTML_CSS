import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSingleProduct, deleteProduct } from "../../API/productAPI";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  BarcodeOutlined,
  CalendarOutlined,
  NumberOutlined,
  PercentageOutlined,
  ShopOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Divider,
  message,
  Spin,
  Descriptions,
  Tag,
  Space,
  Progress,
  Avatar,
} from "antd";
import { FaBoxOpen, FaRupeeSign } from "react-icons/fa";
import { MdInventory, MdCategory } from "react-icons/md";
import "../../../public/css/products.css";

const { Title, Text } = Typography;

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

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getSingleProduct(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      message.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/products");
    },
  });

  if (isLoading) return (
    <div className="center-container">
      <Spin size="large" tip="Loading product details..." />
    </div>
  );

  if (!product) return (
    <div className="center-container">
      <Card style={{ textAlign: "center", padding: 40, borderRadius: 16 }}>
        <ShoppingOutlined className="empty-state-icon" />
        <Title level={4}>Product Not Found</Title>
        <Button type="primary" onClick={() => navigate("/products")} style={{ marginTop: 16 }} className="btn-submit">
          Back to Products
        </Button>
      </Card>
    </div>
  );

  const productData = product?.data?.data || product?.data || product;
  
  const categoryName = typeof productData.category === "object"
    ? productData.category?.name
    : productData.category;

  const storeName = typeof productData.storeId === "object"
    ? productData.storeId?.name
    : productData.storeId;

  const createdByName = typeof productData.createdBy === "object"
    ? productData.createdBy?.ownerName
    : productData.createdBy;

  // Calculate discount percentage
  const discountPercent = productData.mrp && productData.rate
    ? Math.round(((productData.mrp - productData.rate) / productData.mrp) * 100)
    : 0;

  // Check if expiry is near (within 30 days)
  const isExpiryNear = productData.expiry 
    ? (new Date(productData.expiry).getTime() - Date.now()) <= 30 * 24 * 60 * 60 * 1000
    : false;

  // Stock status
  const stockStatus = productData.stock <= 0 ? "out" : productData.stock <= 5 ? "low" : "good";
  const stockColors = {
    out: { bg: "#ffebee", text: "#d32f2f", label: "Out of Stock" },
    low: { bg: "#fff7e6", text: "#ed6c02", label: "Low Stock" },
    good: { bg: "#e6f7e6", text: "#2e7d32", label: "In Stock" }
  };

  const { date: createdDate, time: createdTime } = formatDate(productData.createdAt);
  const { date: updatedDate, time: updatedTime } = formatDate(productData.updatedAt);

  return (
    <div className="product-page-container-full">
      <div className="max-width-1400">
        {/* Header with back button and actions */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/products")}
              style={{
                borderRadius: 10,
                background: "#fff",
                border: "1px solid #e2e8f0",
                color: "#1e293b",
                height: 40,
                padding: "0 20px",
                display: "flex",
                alignItems: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              Back to Products
            </Button>
          </Col>
          <Col>
            <Space size={12}>
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/products/${id}/edit`)}
                className="btn-submit"
                style={{ height: 40, padding: "0 20px", fontWeight: 500 }}
              >
                Edit Product
              </Button>
              <Button
                icon={<DeleteOutlined />}
                loading={deleteMutation.isPending}
                onClick={() => {
                  if (confirm("Are you sure you want to delete this product?")) {
                    deleteMutation.mutate(id!);
                  }
                }}
                className="delete-btn"
              >
                Delete
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Main Content */}
        <Row gutter={[24, 24]}>
          {/* Left Column - Product Image & Quick Stats */}
          <Col xs={24} lg={8}>
            <Card className="details-card" bodyStyle={{ padding: "24px" }}>
              {/* Product Icon/Image */}
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div className="product-icon-container">
                  <FaBoxOpen className="product-icon" />
                </div>
                <Title level={3} style={{ margin: "0 0 4px 0", color: "#1e293b" }}>
                  {productData.name}
                </Title>
                <Space>
                  <Tag className="category-tag">
                    <MdCategory style={{ marginRight: 4 }} /> {categoryName || "N/A"}
                  </Tag>
                  {productData.hsnCode && (
                    <Tag className="hsn-tag">
                      <BarcodeOutlined style={{ marginRight: 4 }} /> HSN: {productData.hsnCode}
                    </Tag>
                  )}
                </Space>
              </div>

              <Divider style={{ margin: "16px 0" }} />

              {/* Quick Stats Grid */}
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="stat-card">
                    <div className="stat-label">Rate</div>
                    <div className="stat-value">₹{productData.rate?.toLocaleString()}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="stat-card">
                    <div className="stat-label">MRP</div>
                    <div className="stat-value-mrp">₹{productData.mrp?.toLocaleString()}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={`stat-card stat-stock-${stockStatus}`}>
                    <div className={`stat-label stat-stock-${stockStatus}-text`}>Stock</div>
                    <div className={`stat-value stat-stock-${stockStatus}-text`}>
                      {productData.stock} units
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={`stat-card ${discountPercent > 10 ? 'stat-discount-high' : 'stat-discount-normal'}`}>
                    <div className="stat-label">Discount</div>
                    <div className={`stat-value ${discountPercent > 10 ? 'stat-discount-high-text' : ''}`}>
                      {discountPercent}%
                    </div>
                  </div>
                </Col>
              </Row>

              <Divider style={{ margin: "24px 0 16px" }} />

              {/* Store & Creator Info */}
              {(storeName || createdByName) && (
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  {storeName && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar size={40} className="avatar-store">
                        <ShopOutlined className="avatar-icon" />
                      </Avatar>
                      <div>
                        <div className="stat-label">Store</div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>
                          {storeName}
                        </div>
                      </div>
                    </div>
                  )}
                  {createdByName && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar size={40} className="avatar-store">
                        <UserOutlined className="avatar-icon" />
                      </Avatar>
                      <div>
                        <div className="stat-label">Created By</div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>
                          {createdByName}
                        </div>
                      </div>
                    </div>
                  )}
                </Space>
              )}
            </Card>
          </Col>

          {/* Right Column - Detailed Information */}
          <Col xs={24} lg={16}>
            <Card className="details-card" bodyStyle={{ padding: "24px" }}>
              {/* Stock Status Bar */}
              <div className="stock-status-container">
                <div className="stock-status-header">
                  <Text strong style={{ color: "#1e293b" }}>Stock Status</Text>
                  <Tag className={`stock-status-tag-${stockStatus}`}>
                    {stockColors[stockStatus].label}
                  </Tag>
                </div>
                <Progress
                  percent={Math.min((productData.stock / 100) * 100, 100)}
                  showInfo={false}
                  strokeColor={stockColors[stockStatus].text}
                  trailColor="#e2e8f0"
                  style={{ margin: 0 }}
                />
              </div>

              {/* Product Details Grid */}
              <Descriptions
                title="Product Information"
                bordered
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                style={{ marginBottom: 24 }}
                labelStyle={{ 
                  fontWeight: 600, 
                  color: "#1e293b",
                  background: "#f8fafc",
                  width: "150px",
                }}
                contentStyle={{ color: "#334155" }}
              >
                <Descriptions.Item label="Product Name">
                  <Space>
                    <ShoppingOutlined style={{ color: "#64748b" }} />
                    {productData.name}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Category">
                  <Space>
                    <MdCategory style={{ color: "#64748b" }} />
                    {categoryName || "N/A"}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Rate (Selling Price)">
                  <Space>
                    <FaRupeeSign style={{ color: "#64748b" }} />
                    <Text strong style={{ color: "#1e293b" }}>₹{productData.rate?.toLocaleString()}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="MRP">
                  <Space>
                    <FaRupeeSign style={{ color: "#64748b" }} />
                    <Text style={{ color: "#94a3b8", textDecoration: "line-through" }}>
                      ₹{productData.mrp?.toLocaleString()}
                    </Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Discount">
                  <Tag color={discountPercent > 10 ? "success" : "default"}>
                    {discountPercent}% off
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Stock">
                  <Space>
                    <MdInventory style={{ color: "#64748b" }} />
                    <Text style={{ color: stockColors[stockStatus].text, fontWeight: 600 }}>
                      {productData.stock} units
                    </Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="GST Rate">
                  <Space>
                    <PercentageOutlined style={{ color: "#64748b" }} />
                    {productData.gstRate || productData.gstPercent}%
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="HSN Code">
                  <Space>
                    <BarcodeOutlined style={{ color: "#64748b" }} />
                    {productData.hsnCode || "N/A"}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Batch Number">
                  <Space>
                    <NumberOutlined style={{ color: "#64748b" }} />
                    {productData.batchNo || "N/A"}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Expiry Date">
                  <Space>
                    <CalendarOutlined style={{ color: isExpiryNear ? "#d32f2f" : "#64748b" }} />
                    <Text style={{ color: isExpiryNear ? "#d32f2f" : "inherit", fontWeight: isExpiryNear ? 600 : 400 }}>
                      {productData.expiry ? new Date(productData.expiry).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      }) : "N/A"}
                    </Text>
                    {isExpiryNear && <Tag color="error" size="small">Expiring Soon</Tag>}
                  </Space>
                </Descriptions.Item>
              </Descriptions>

              {/* Timestamps */}
              <Row gutter={24}>
                <Col span={12}>
                  <Card size="small" className="info-card">
                    <Space>
                      <ClockCircleOutlined style={{ color: "#64748b" }} />
                      <div>
                        <div className="stat-label">Created</div>
                        <div style={{ fontWeight: 500, color: "#1e293b" }}>{createdDate}</div>
                        <div className="stat-label">{createdTime}</div>
                      </div>
                    </Space>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" className="info-card">
                    <Space>
                      <ClockCircleOutlined style={{ color: "#64748b" }} />
                      <div>
                        <div className="stat-label">Last Updated</div>
                        <div style={{ fontWeight: 500, color: "#1e293b" }}>{updatedDate}</div>
                        <div className="stat-label">{updatedTime}</div>
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>

              {/* Description if available */}
              {productData.description && (
                <>
                  <Divider orientation="left" style={{ margin: "24px 0 16px" }}>
                    Description
                  </Divider>
                  <Card className="info-card">
                    <Text>{productData.description}</Text>
                  </Card>
                </>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProductDetails;
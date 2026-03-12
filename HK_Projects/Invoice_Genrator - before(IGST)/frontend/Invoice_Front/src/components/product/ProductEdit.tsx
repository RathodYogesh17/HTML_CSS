import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getSingleProduct, updateProduct } from "../../API/productAPI";
import { getAllCategories } from "../../API/categoryAPI";
import {
  ArrowLeftOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Divider,
  InputNumber,
  Spin,
  message,
  Space
} from "antd";
import "../../../public/css/products.css";

const { Title, Text } = Typography;
const { Option } = Select;

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Fetch product data
  const {
    data: productResponse,
    isLoading: isLoadingProduct,
    error: productError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getSingleProduct(id as string),
    enabled: !!id,
    retry: 1,
  });

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getAllCategories({ page: 1, limit: 100 });
      return res;
    },
  });

  // Extract data
  const product = productResponse?.data?.data || productResponse?.data || productResponse;
  const categories = categoriesData?.data?.data || [];

  // Set form values when product data is loaded
  useEffect(() => {
    if (product) {
      // Format date for input field
      let formattedExpiry = "";
      if (product.expiry) {
        const date = new Date(product.expiry);
        formattedExpiry = date.toISOString().split('T')[0];
      }

      // Set form fields
      form.setFieldsValue({
        name: product.name,
        category: typeof product.category === 'object'
          ? product.category?._id || product.category
          : product.category,
        rate: product.rate,
        mrp: product.mrp,
        stock: product.stock,
        batchNo: product.batchNo,
        expiry: formattedExpiry,
        gstPercent: product.gstPercent || 12,
      });
    }
  }, [product, form]);

  useEffect(() => {
    if (categoriesError) {
      message.error("Failed to load categories");
    }
  }, [categoriesError]);

  // Update mutation
  const mutation = useMutation({
    mutationFn: (data: any) => updateProduct(id as string, data),
    onSuccess: () => {
      message.success("Product updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      navigate("/products");
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Failed to update product";
      message.error(errorMsg);
      
      if (errorMsg.includes("ACCESS_DENIED")) {
        setPermissionError("Access denied. You don't have permission to edit this product.");
      }
    },
  });

  const onFinish = (values: any) => {
    if (!values.category) {
      message.error("Please select a category");
      return;
    }

    const payload = {
      ...values,
      mrp: values.mrp || undefined,
      rate: Number(values.rate),
      stock: Number(values.stock),
      gstPercent: Number(values.gstPercent || 12),
    };

    mutation.mutate(payload);
  };

  // Loading state
  if (isLoadingProduct || isLoadingCategories) {
    return (
      <div className="center-container">
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Text>Loading product details...</Text>
        </Space>
      </div>
    );
  }

  // Permission error
  if (permissionError) {
    return (
      <div className="product-page-container">
        <div className="max-width-800">
          <Card>
            <div className="empty-state-card">
              <Title level={3} type="danger">Access Denied</Title>
              <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
                {permissionError}
              </Text>
              <Button
                type="primary"
                onClick={() => navigate("/products")}
                className="btn-submit"
              >
                Back to Products
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Error or product not found
  if (productError || !product) {
    return (
      <div className="product-page-container">
        <div className="max-width-800">
          <Card>
            <div className="empty-state-card">
              <Title level={3} type="danger">Error Loading Product</Title>
              <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
                The product may not exist or you don't have permission to edit it.
              </Text>
              <Space>
                <Button
                  type="primary"
                  onClick={() => navigate("/products")}
                  className="btn-submit"
                >
                  Back to Products
                </Button>
                <Button onClick={() => window.location.reload()} className="btn-retry">
                  Retry
                </Button>
              </Space>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Empty categories
  if (!categories || categories.length === 0) {
    return (
      <div className="product-page-container">
        <div className="max-width-800">
          <Card>
            <div className="empty-state-card">
              <Title level={3}>No Categories Found</Title>
              <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
                Please add categories first before editing products.
              </Text>
              <Button
                type="primary"
                onClick={() => navigate("/categories/add")}
                className="btn-add-category"
              >
                Add Category
              </Button>
              <Button onClick={() => navigate("/products")}>
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page-container">
      <div className="max-width-800">
        {/* Header */}
        <Card className="header-card">
          <div className="header-with-back">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/products")}
              size="large"
              className="btn-back"
            >
              Back
            </Button>
            <Title level={3} className="page-title">Edit Product</Title>
          </div>
        </Card>

        {/* Form Card */}
        <Card className="form-card">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            disabled={mutation.isPending}
          >
            {/* Product Name */}
            <Form.Item
              name="name"
              label="Product Name"
              rules={[{ required: true, message: "Please enter product name" }]}
            >
              <Input
                size="large"
                placeholder="Enter product name"
                className="input-rounded"
              />
            </Form.Item>

            <Row gutter={16}>
              {/* Category */}
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: "Please select a category" }]}
                >
                  <Select
                    size="large"
                    loading={isLoadingCategories}
                    placeholder="Select Category"
                    className="select-rounded"
                    showSearch
                    optionFilterProp="children"
                  >
                    {categories.map((cat: any) => (
                      <Option key={cat._id} value={cat._id}>
                        {cat.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Rate */}
              <Col span={12}>
                <Form.Item
                  name="rate"
                  label="Rate (₹)"
                  rules={[
                    { required: true, message: "Please enter rate" },
                    { type: 'number', min: 0, message: 'Rate must be positive' }
                  ]}
                >
                  <InputNumber
                    min={0}
                    className="input-number-full"
                    size="large"
                    placeholder="0.00"
                    formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/[^\d.]/g, '') as any}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              {/* MRP */}
              <Col span={8}>
                <Form.Item name="mrp" label="MRP (₹)">
                  <InputNumber
                    min={0}
                    className="input-number-full"
                    size="large"
                    placeholder="0.00"
                    formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/[^\d.]/g, '') as any}
                  />
                </Form.Item>
              </Col>

              {/* Stock */}
              <Col span={8}>
                <Form.Item
                  name="stock"
                  label="Stock"
                  rules={[
                    { required: true, message: "Please enter stock" },
                    { type: 'number', min: 0, message: 'Stock must be positive' }
                  ]}
                >
                  <InputNumber
                    min={0}
                    className="input-number-full"
                    size="large"
                    placeholder="0"
                  />
                </Form.Item>
              </Col>

              {/* GST */}
              <Col span={8}>
                <Form.Item name="gstPercent" label="GST (%)">
                  <InputNumber
                    min={0}
                    max={28}
                    step={0.5}
                    className="input-number-full"
                    size="large"
                    placeholder="12"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              {/* Batch No */}
              <Col span={12}>
                <Form.Item name="batchNo" label="Batch Number">
                  <Input
                    size="large"
                    placeholder="Enter batch number"
                    className="input-rounded"
                  />
                </Form.Item>
              </Col>

              {/* Expiry Date */}
              <Col span={12}>
                <Form.Item name="expiry" label="Expiry Date">
                  <Input
                    type="date"
                    size="large"
                    className="input-rounded"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            {/* Buttons */}
            <div className="button-container-end">
              <Button
                size="large"
                onClick={() => navigate("/products")}
                className="btn-cancel"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={mutation.isPending}
                icon={<SaveOutlined />}
                size="large"
                className="btn-submit"
              >
                {mutation.isPending ? "Updating..." : "Update Product"}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default EditProduct;
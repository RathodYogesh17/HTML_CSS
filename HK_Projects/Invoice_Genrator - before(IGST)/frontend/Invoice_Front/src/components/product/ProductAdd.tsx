import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addProduct } from "../../API/productAPI";
import { getAllCategories } from "../../API/categoryAPI";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  ArrowLeftOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Form,Input, Select, Button, Card, Typography, Row, Col, Divider, InputNumber,Spin, message, Space
} from "antd";
import "../../../public/css/products.css";

const { Title, Text } = Typography;
const { Option } = Select;

const AddProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getAllCategories({ page: 1, limit: 100 });
      return res;
    },
  });

  const categories = categoriesData?.data?.data || [];
  

  useEffect(() => {
    if (categoriesData) {
    }
    
    if (categoriesError) {
      message.error("Failed to load categories");
    }
  }, [categoriesData, categoriesError]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return addProduct(data);
    },
    onSuccess: () => {
      message.success("Product added successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      form.resetFields();
      navigate("/products");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to add product");
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

  if (isLoadingCategories) {
    return (
      <div className="center-container">
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Text>Loading categories...</Text>
        </Space>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="center-container">
        <Card>
          <Text type="danger">Failed to load categories</Text>
          <Button 
            className="btn-retry"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="product-page-container">
        <div className="max-width-800">
          <Card>
            <div className="empty-state-card">
              <Title level={3}>No Categories Found</Title>
              <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
                Please add categories first before adding products.
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
            <Title level={3} className="page-title">Add New Product</Title>
          </div>
        </Card>

        <Card className="form-card">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ gstPercent: 12 }}
            disabled={mutation.isPending}
          >
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
              <Col span={12}>
                <Form.Item name="batchNo" label="Batch Number">
                  <Input 
                    size="large" 
                    placeholder="Enter batch number"
                    className="input-rounded"
                  />
                </Form.Item>
              </Col>

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
                icon={<PlusOutlined />}
                size="large"
                className="btn-submit"
              >
                {mutation.isPending ? "Adding..." : "Add Product"}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AddProduct;
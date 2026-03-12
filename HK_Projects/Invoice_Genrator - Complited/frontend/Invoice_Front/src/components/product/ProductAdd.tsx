
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addProduct } from "../../API/productAPI";
import { getAllCategories } from "../../API/categoryAPI";
import { getMyCompanies } from "../../API/InvoicesAPI";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { useEffect, useState } from "react";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  TagOutlined,
} from "@ant-design/icons";
import {
  Form, Input, Select, Button, Card, Typography, message, Spin, Space
} from "antd";

const { Title } = Typography;
const { Option } = Select;

const AddProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const user = useSelector((state: RootState) => state.auth.user);
  const [storeId, setStoreId] = useState<string>("");

  // Get user's store ID
  useEffect(() => {
    if (user?.stores && user.stores.length > 0) {
      setStoreId(user.stores[0]);
    }
  }, [user]);

  // Fetch categories for this store
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories", storeId],
    queryFn: async () => {
      if (!storeId) return { data: { data: [] } };
      const res = await getAllCategories({ page: 1, limit: 100 });
      return res;
    },
    enabled: !!storeId,
  });

  // Fetch companies
  const { data: companiesData, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["companies", storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const res = await getMyCompanies();
      return res;
    },
    enabled: !!storeId,
  });

  const categories = categoriesData?.data?.data || [];
  const companies = companiesData || [];

  const mutation = useMutation({
    mutationFn: addProduct,
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
    mutation.mutate(values);
  };

  if (!storeId) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Title level={4}>No Store Assigned</Title>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/products")}>
            Back
          </Button>
          <Title level={3} style={{ margin: 0 }}>Add New Product</Title>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: "Please enter product name" }]}
          >
            <Input placeholder="Enter product name" prefix={<TagOutlined />} />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select
              loading={isLoadingCategories}
              placeholder="Select Category"
              showSearch
            >
              {categories.map((cat: any) => (
                <Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="companyId"
            label="Company"
            rules={[{ required: true, message: "Please select a company" }]}
          >
            <Select
              loading={isLoadingCompanies}
              placeholder="Select Company"
              showSearch
            >
              {companies.map((company: any) => (
                <Option key={company._id} value={company._id}>
                  {company.name} - {company.gstNumber}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ marginTop: 24 }}>
            <Space>
              <Button onClick={() => navigate("/products")}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={mutation.isPending}
                icon={<PlusOutlined />}
              >
                Add Product
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddProduct;
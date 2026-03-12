import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCategoryById, updateCategory } from "../../API/categoryAPI";
import { Card, Form, Input, Button, Typography, message, Spin } from "antd";
import "../../../public/css/category.css";

const { Title, Text } = Typography;

const CategoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const res = await getCategoryById(id);
        const category = res?.data || res;
        
        form.setFieldsValue({
          name: category?.name,
          description: category?.description,
        });
      } catch (error) {
        console.error("Error fetching category:", error);
        message.error("Failed to load category");
        navigate("/category");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, form, navigate]);

  const onFinish = async (values: any) => {
    if (!id) return;
    
    try {
      setSubmitting(true);
      
      const response = await updateCategory(id, values);
      console.log("Update response:", response);
      
      message.success("Category updated successfully!");
      navigate("/category");
    } catch (error: any) {
      console.error(" Update error:", error);
      message.error(error.response?.data?.message || "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="category-center-container">
        <Spin size="large" tip="Loading category..." />
      </div>
    );
  }

  return (
    <div className="category-center-container">
      <Card className="category-card">
        <Title level={3} className="category-title">
          Edit Category
        </Title>
        <Text type="secondary" className="category-subtitle">
          Update category information
        </Text>

        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          style={{ marginTop: 30 }}
        >
          <Form.Item
            label="Category Name"
            name="name"
            rules={[{ required: true, message: "Category name is required" }]}
          >
            <Input
              size="large"
              className="category-input"
            />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              rows={4}
              className="category-textarea"
            />
          </Form.Item>

          <Button
            htmlType="submit"
            size="large"
            block
            loading={submitting}
            className="category-submit-btn"
          >
            {submitting ? "Updating..." : "Update Category"}
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default CategoryEdit;
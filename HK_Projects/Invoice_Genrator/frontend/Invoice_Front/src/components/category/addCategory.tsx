import { Form, Input, Button, Card, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { addCategory } from "../../API/categoryAPI";
import "../../../public/css/category.css";

const { Title, Text } = Typography;

const AddCategory = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    await addCategory(values);
    form.resetFields();
    navigate("/category");
  };

  return (
    <div className="category-center-container">
      <Card className="category-card">
        <Title level={3} className="category-title">
          Create Category
        </Title>
        <Text type="secondary" className="category-subtitle">
          Add a new category to manage your products
        </Text>

        <Form
          form={form}
          layout="vertical"
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
              placeholder="Enter category name"
              className="category-input"
            />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              rows={4}
              placeholder="Enter category description"
              className="category-textarea"
            />
          </Form.Item>

          <Button
            htmlType="submit"
            size="large"
            block
            className="category-submit-btn"
          >
            Add Category
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default AddCategory;
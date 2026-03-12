import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getAllProducts, deleteProduct } from "../../../API/productAPI";
import { 
  PlusOutlined,   
  UnorderedListOutlined,
  DeleteOutlined,
  SearchOutlined,
  EditOutlined,
  UserOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Card, 
  Spin, 
  Empty, 
  Space, 
  Typography, 
  Pagination, 
  Tag, 
  Avatar,
  Tooltip
} from "antd";
import type { User } from "../../../types/authTypes";
import "../../../../public/css/products.css";

const { Title, Text } = Typography;
const { Option } = Select;

interface Product {
  _id: string;
  name: string;
  category: string | { name: string };
  rate: number;
  mrp: number;
  stock: number;
  batchNo?: string;
  expiry?: string;
  gstPercent?: number;
  storeId?: {
    _id: string;
    name: string;
  };
  createdBy?: {
    _id: string;
    ownerName: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const ProductList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", page, debouncedSearch, sortBy, order],
    queryFn: () =>
      getAllProducts({
        page,
        limit,
        search: debouncedSearch,
        sortBy,
        order,
      }),
    keepPreviousData: true,
  });

  const products = data?.data?.products || data?.products || data?.data || [];
  const totalPages = data?.data?.totalPages || data?.totalPages || 1;
  const total = data?.data?.total || data?.total || 0;

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const handleAddProduct = () => navigate("/products/add");
  const handleRowClick = (id: string) =>
    navigate(`/products/${id}`);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Product delete karna hai?")) {
      deleteMutation.mutate(id);
    }
  };

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
  

  const baseColumns = [
    {
      title: "#",
      key: "no",
      width: 50,
      align: "center" as const,
      render: (_: any, __: User, index: number) => (
        <Text style={{ fontSize: 14, color: "#64748b" }}>
          {(page - 1) * limit + index + 1}
        </Text>
      ),
    },
    {
      title: "Product",
      key: "product",
      width: 180,
      render: (_: any, record: Product) => (
        <Space size={8}>
          <div className="product-icon-small">
            <UnorderedListOutlined className="product-icon-small-icon" />
          </div>
          <div>
            <Text className="product-name-text">
              {record.name.length > 20 
                ? `${record.name.substring(0, 20)}...` 
                : record.name}
            </Text>
            {record.batchNo && (
              <div>
                <Text className="product-batch-text">
                  Batch: {record.batchNo}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Category",
      key: "category",
      width: 100,
      render: (_: any, record: Product) => {
        const categoryName = typeof record.category === "object"
          ? record.category?.name
          : record.category || "N/A";
        return (
          <Tag className="category-tag" style={{ margin: 0 }}>
            {categoryName.length > 12 ? `${categoryName.substring(0, 12)}...` : categoryName}
          </Tag>
        );
      },
    },
    {
      title: "Price",
      key: "rate",
      width: 70,
      align: "right" as const,
      render: (_: any, record: Product) => (
        <Text strong style={{ fontSize: 14, color: "#000000" }}>
          ₹{record.rate}
        </Text>
      ),
    },
    {
      title: "Stock",
      key: "stock",
      width: 70,
      align: "center" as const,
      render: (_: any, record: Product) => {
        let stockClass = "stock-cell";
        if (record.stock > 10) stockClass += " stock-cell-high";
        else if (record.stock > 0) stockClass += " stock-cell-medium";
        else stockClass += " stock-cell-low";
        
        return (
          <div className={stockClass}>
            {record.stock}
          </div>
        );
      },
    },
  ];

  const storeColumn = isAdmin ? [
    {
      title: "Store",
      key: "store",
      width: 120,
      render: (_: any, record: Product) => (
        <Tooltip title={record.storeId?.name}>
          <Space size={4}>
            <ShopOutlined style={{ color: "#64748b", fontSize: 12 }} />
            <Text className="store-cell">
              {record.storeId?.name 
                ? record.storeId.name.length > 12 
                  ? `${record.storeId.name.substring(0, 12)}...` 
                  : record.storeId.name
                : "N/A"}
            </Text>
          </Space>
        </Tooltip>
      ),
    }
  ] : [];

  const createdByColumn = [
    {
      title: "Created By",
      key: "createdBy",
      width: 130,
      render: (_: any, record: Product) => (
        <Tooltip title={`${record.createdBy?.ownerName || "N/A"} (${record.createdBy?.email || ""})`}>
          <Space size={4}>
            <Avatar size={24} className="avatar-small">
              <UserOutlined className="avatar-small-icon" />
            </Avatar>
            <Text className="created-by-cell">
              {record.createdBy?.ownerName 
                ? record.createdBy.ownerName.length > 12 
                  ? `${record.createdBy.ownerName.substring(0, 12)}...` 
                  : record.createdBy.ownerName
                : "N/A"}
            </Text>
          </Space>
        </Tooltip>
      ),
    }
  ];


const dateColumns = [
  {
    title: "Created",
    key: "createdAt",
    width: 110,
    render: (_: any, record: Product) => {
      const { date, time } = formatDate(record.createdAt);
      return (
        <Tooltip title={record.createdAt ? new Date(record.createdAt).toLocaleString() : "N/A"}>
          <div className="timestamp-container">
            <span className="timestamp-date">{date}</span>
            {time && (
              <span className="timestamp-time">{time}</span>
            )}
          </div>
        </Tooltip>
      );
    },
  },
  {
    title: "Updated",
    key: "updatedAt",
    width: 110,
    render: (_: any, record: Product) => {
      const { date, time } = formatDate(record.updatedAt);
      return (
        <Tooltip title={record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "N/A"}>
          <div className="timestamp-container">
            <span className="timestamp-date">{date}</span>
            {time && (
              <span className="timestamp-time">{time}</span>
            )}
          </div>
        </Tooltip>
      );
    },
  },
];

  const actionsColumn = [
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center" as const,
      render: (_: any, record: Product) => (
        <Space size={4}>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={(e) => { e.stopPropagation(); navigate(`/products/${record._id}/edit`)}}
              className="action-btn"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              onClick={(e) => handleDelete(record._id, e)}
              className="action-btn"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const columns = [
    ...baseColumns,
    ...storeColumn,
    ...createdByColumn,
    ...dateColumns,
    ...actionsColumn,
  ];

  const totalWidth = 50 + 180 + 100 + 70 + 70 + 
    (isAdmin ? 120 : 0) + 130 + 85 + 85 + 80;

  if (isLoading) {
    return (
      <div className="center-container" style={{ padding: 32 }}>
        <Card style={{ width: 400, textAlign: "center", borderRadius: 16 }}>
          <Spin size="large" style={{ marginBottom: 16 }} />
          <Title level={4} style={{ color: "#64748b", margin: 0 }}>
            Loading Products...
          </Title>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="center-container" style={{ padding: 32 }}>
        <Card style={{ width: 400, textAlign: "center", borderRadius: 16 }}>
          <Title level={4} style={{ color: "#ef4444", margin: 16 }}>
            Error loading products
          </Title>
          <Text style={{ color: "#64748b" }}>
            {error?.message || "Please try again later"}
          </Text>
        </Card>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="product-page-container-full">
        <div className="max-width-1200">
          <Card className="details-card" style={{ marginBottom: 24 }}>
            <div className="product-list-header">
              <Space direction="vertical" size={4}>
                <Title level={2} style={{ margin: 0, color: "#1e293b" }}>
                  Products
                </Title>
                <Text style={{ color: "#64748b" }}>
                  (0 total products)
                </Text>
              </Space>
              <Button
                icon={<PlusOutlined />}
                onClick={handleAddProduct}
                className="add-btn"
              >
                Add Product
              </Button>
            </div>
          </Card>

          <Card className="details-card" style={{ padding: "48px" }}>
            <Empty
              description={
                <Space direction="vertical" style={{ textAlign: "center" }}>
                  <Title level={4} style={{ margin: 0, color: "#64748b" }}>
                    No Products Found
                  </Title>
                  <Text style={{ color: "#94a3b8" }}>
                    {search ? "Try different search terms." : "Add your first product to get started."}
                  </Text>
                </Space>
              }
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page-container-full">
      <div className="max-width-1400">
        <Card className="details-card" style={{ marginBottom: 24 }}>
          <div className="product-list-header">
            <Space direction="vertical" size={4}>
              <Title level={2} style={{ margin: 0, color: "#1e293b" }}>
                Products
              </Title>
              <Text style={{ color: "#64748b" }}>
                ({total} total products)
              </Text>
            </Space>
            <Button
              icon={<PlusOutlined />}
              onClick={handleAddProduct}
              className="add-btn"
            >
              Add Product
            </Button>
          </div>
        </Card>

        <Card className="details-card" style={{ marginBottom: 24 }}>
          <div className="filter-container">
            <Input
              placeholder="Search products..."
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <Space>
              <span className="sort-label">Sort:</span>
              <Select
                value={sortBy}
                style={{ width: 100 }}
                onChange={setSortBy}
                size="middle"
              >
                <Option value="createdAt">Created</Option>
                <Option value="name">Name</Option>
                <Option value="rate">Price</Option>
              </Select>
              <Select
                value={order}
                style={{ width: 80 }}
                onChange={setOrder}
                size="middle"
              >
                <Option value="desc">Desc</Option>
                <Option value="asc">Asc</Option>
              </Select>
            </Space>
          </div>
        </Card>

        <Card className="table-container" bodyClassName="table-padding">
          <Table
            columns={columns}
            dataSource={products}
            rowKey="_id"
            pagination={false}
            scroll={{ x: totalWidth }}
            onRow={(record) => ({
              onClick: () => handleRowClick(record._id),
              style: { cursor: "pointer" },
            })}
            size="middle"
          />
        </Card>

        {totalPages > 1 && (
          <Card className="pagination-card">
            <div className="pagination-container">
              <span className="pagination-text">
                Page {page} of {totalPages}
              </span>
              <Pagination
                current={page}
                total={total}
                pageSize={limit}
                onChange={setPage}
                showSizeChanger={false}
                size="small"
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
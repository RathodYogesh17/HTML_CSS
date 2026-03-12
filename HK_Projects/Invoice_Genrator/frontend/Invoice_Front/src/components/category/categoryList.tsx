import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCategories, deleteCategory } from "../../API/categoryAPI";
import { 
  DeleteOutlined, 
  EditOutlined, 
  PlusOutlined, 
  SearchOutlined,
  ShopOutlined,
  UserOutlined,
  TagOutlined,
} from "@ant-design/icons";
import {
  Card, Typography, Table,Input,Button,Space,Spin,Modal,Tooltip,Avatar,Pagination,
} from "antd";
import "../../../public/css/category.css";

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

const CategoryList = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "ADMIN";

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCategories = useCallback(
    async (
      currentPage = 1,
      pageSize = limit,
      sortBy = "createdAt",
      order = "desc"
    ) => {
      try {
        setLoading(true);
        const res = await getAllCategories({
          search: debouncedSearch,
          page: currentPage,
          limit: pageSize,
          sortBy,
          order,
        });
        
        const categoriesData = res.data?.data || res.data || [];
        setCategories(categoriesData);
        setTotal(res.data?.total || res.total || 0);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, limit]
  );

  useEffect(() => {
    fetchCategories(1);
  }, [debouncedSearch, limit]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Delete Category?",
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        await deleteCategory(id);
        fetchCategories(page);
      },
    });
  };

  const columns = [
    {
      title: "#",
      key: "no",
      width: 50,
      align: "center" as const,
      render: (_: any, __: any, index: number) => (
        <Text style={{ fontSize: 14, color: "#64748b" }}>
          {(page - 1) * limit + index + 1}
        </Text>
      ),
    },
    {
      title: "Category",
      key: "category",
      width: 180,
      sorter: true,
      render: (record: any) => (
        <Space size={8}>
          <div className="category-icon-small">
            <TagOutlined className="category-icon-small-icon" />
          </div>
          <Text strong style={{ fontSize: 14, color: "#1e293b" }}>
            {record.name?.length > 25 
              ? `${record.name.substring(0, 25)}...` 
              : record.name}
          </Text>
        </Space>
      ),
    },
    {
      title: "Description",
      key: "description",
      width: 200,
      render: (record: any) => (
        <Tooltip title={record.description || "No description"}>
          <Text className="category-description-text">
            {record.description 
              ? record.description.length > 30 
                ? `${record.description.substring(0, 30)}...` 
                : record.description
              : "—"}
          </Text>
        </Tooltip>
      ),
    },


    ...(isAdmin ? [
      {
        title: "Store",
        key: "store",
        width: 130,
        render: (record: any) => (
          <Tooltip title={record.storeId?.name}>
            <Space size={4}>
              <ShopOutlined style={{ color: "#64748b", fontSize: 12 }} />
              <Text className="category-store-text">
                {record.storeId?.name 
                  ? record.storeId.name.length > 15 
                    ? `${record.storeId.name.substring(0, 15)}...` 
                    : record.storeId.name
                  : "N/A"}
              </Text>
            </Space>
          </Tooltip>
        ),
      }
    ] : []),
    {
      title: "Created By",
      key: "createdBy",
      width: 140,
      render: (record: any) => (
        <Tooltip title={`${record.createdBy?.ownerName || "N/A"} (${record.createdBy?.email || ""})`}>
          <Space size={4}>
            <Avatar size={24} className="category-avatar">
              <UserOutlined className="category-avatar-icon" />
            </Avatar>
            <Text className="category-createdby-text">
              {record.createdBy?.ownerName 
                ? record.createdBy.ownerName.length > 12 
                  ? `${record.createdBy.ownerName.substring(0, 12)}...` 
                  : record.createdBy.ownerName
                : "N/A"}
            </Text>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: "Created",
      key: "createdAt",
      width: 110,
      sorter: true,
      render: (record: any) => {
        const { date, time } = formatDate(record.createdAt);
        return (
          <Tooltip title={record.createdAt ? new Date(record.createdAt).toLocaleString() : "N/A"}>
            <div className="category-timestamp-container">
              <span className="category-timestamp-date">{date}</span>
              {time && (
                <span className="category-timestamp-time">{time}</span>
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
      sorter: true,
      render: (record: any) => {
        const { date, time } = formatDate(record.updatedAt);
        return (
          <Tooltip title={record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "N/A"}>
            <div className="category-timestamp-container">
              <span className="category-timestamp-date">{date}</span>
              {time && (
                <span className="category-timestamp-time">{time}</span>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 90,
      align: "center" as const,
      render: (record: any) => {
        const canEdit = isAdmin ||  user.userId;
        
        return (
          <Space size={4}>
            <Tooltip title="Edit">
              <Button
                icon={<EditOutlined />}
                size="small"
                className="category-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!canEdit) {
                    Modal.warning({
                      title: "Permission Denied",
                      content: "Only the category creator or admin can update this category.",
                    });
                    return;
                  }
                  navigate(`/categories/edit/${record._id}`);
                }}
              />
            </Tooltip>
            
            <Tooltip title="Delete">
              <Button
                icon={<DeleteOutlined />}
                size="small"
                className="category-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  
                  handleDelete(record._id);
                }}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const totalWidth = 50 + 180 + 200 + (isAdmin ? 130 : 0) + 140 + 110 + 110 + 90;

  if (loading) {
    return (
      <div className="category-center-container-gradient">
        <Card className="category-loading-card">
          <Spin size="large" className="category-loading-spinner" />
          <Title level={4} className="category-loading-title">
            Loading Categories...
          </Title>
        </Card>
      </div>
    );
  }

  return (
    <div className="category-page-container-full">
      <div className="max-width-1400">
        {/* Header */}
        <Card className="category-list-card" style={{ marginBottom: 24 }}>
          <div className="category-header">
            <div>
              <Title level={2} className="category-header-title">
                Categories
              </Title>
              <Text className="category-header-count">
                ({total} total categories)
              </Text>
            </div>

            <Button
              icon={<PlusOutlined />}
              onClick={() => navigate("create")}
              className="category-add-btn"
            >
              Add Category
            </Button>
          </div>
        </Card>

        {/* Search */}
        <Card className="category-list-card" style={{ marginBottom: 24 }}>
          <Input
            placeholder="Search categories..."
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="category-search-input"
          />
        </Card>

        {/* Table */}
        <Card className="category-table-container category-table-padding">
          <Table
            columns={columns}
            dataSource={Array.isArray(categories) ? categories : []}
            rowKey="_id"
            pagination={false}
            scroll={{ x: totalWidth }}
            onChange={(pagination, sorter: any) => {
              setPage(pagination.current || 1);
              setLimit(pagination.pageSize || 10);

              const sortField = sorter.field || "createdAt";
              const sortOrder = sorter.order === "ascend" ? "asc" : "desc";

              fetchCategories(
                pagination.current || 1,
                pagination.pageSize,
                sortField,
                sortOrder
              );
            }}
            size="middle"
          />
        </Card>

        {/* Pagination */}
        {total > limit && (
          <Card className="category-pagination-card">
            <div className="category-pagination-container">
              <Text className="category-pagination-text">
                Page {page} of {Math.ceil(total / limit)}
              </Text>
              <Pagination
                current={page}
                total={total}
                pageSize={limit}
                onChange={setPage}
                showSizeChanger={true}
                pageSizeOptions={["10", "30", "50", "100"]}
                size="small"
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
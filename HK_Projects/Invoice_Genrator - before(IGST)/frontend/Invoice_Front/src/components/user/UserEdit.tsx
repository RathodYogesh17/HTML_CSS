import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSingleUser, updateUserByAdmin } from "../../API/userAPI";
import { getAllStores } from "../../API/storeAPI";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Select, Spin, message } from "antd";
import { 
  ShopOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  HomeOutlined, 
  LockOutlined,
  FileTextOutlined,
  BankOutlined
} from "@ant-design/icons";
import "../../../public/css/auth.css";

const { Option } = Select;

interface Store {
  _id: string;
  name: string;
  address: string;
  mobile: string;
  email: string;
}

const EditUser = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  
  const [selectedRole, setSelectedRole] = useState<"USER" | "ADMIN">("USER");
  const [selectedStore, setSelectedStore] = useState<string>(""); 
  
  const [form, setForm] = useState({
    ownerName: "",
    email: "",
    password: "",
    mobileNumber: "",
    address: "",
    gstNumber: "",
  });

  const { data: storesData, isLoading: storesLoading } = useQuery({
    queryKey: ["all-stores"],
    queryFn: () => getAllStores({ page: 1, limit: 100 }),
  });

  const stores: Store[] = storesData?.data || [];

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => {
      if (!id) throw new Error("No ID provided");
      return getSingleUser(id);
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (userData) {
      const actualUser = userData?.data?.data || userData?.data || userData;
      
      if (actualUser) {
        setForm({
          ownerName: actualUser.ownerName || "",
          email: actualUser.email || "",
          password: "",
          mobileNumber: actualUser.mobileNumber || "",
          address: actualUser.address || "",
          gstNumber: actualUser.gstNumber || "",
        });
        
        setSelectedRole(actualUser.role || "USER");
        
        if (actualUser.stores && actualUser.stores.length > 0) {
          const storeId = actualUser.stores[0];
          setSelectedStore(typeof storeId === 'object' ? storeId._id : storeId);
        }
      }
    }
  }, [userData]);

  const mutation = useMutation({
    mutationFn: (payload: any) => {
      return updateUserByAdmin(id!, payload);
    },
    onSuccess: () => {
      message.success("User updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate("/dashboard/users");
    },
    onError: (error: any) => {
      console.error("Update error:", error.response?.data || error);
      message.error(error.response?.data?.message || "Update failed");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRoleChange = (value: "USER" | "ADMIN") => {
    setSelectedRole(value);
    
    if (value === "ADMIN") {
      setSelectedStore(""); 
    } else {
      setSelectedStore(""); 
    }
  };

  const handleStoreChange = (value: string) => {
    setSelectedStore(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.ownerName.trim()) {
      message.error("Owner name is required");
      return;
    }
    if (!form.email.trim()) {
      message.error("Email is required");
      return;
    }
    if (form.password && form.password.length < 6) {
      message.error("Password must be at least 6 characters");
      return;
    }
    if (!form.mobileNumber.trim()) {
      message.error("Mobile number is required");
      return;
    }
    if (!form.address.trim()) {
      message.error("Address is required");
      return;
    }
    
    if (selectedRole === "USER" && !selectedStore) {
      message.error("Please select a store");
      return;
    }
  
    const payload: any = {
      ownerName: form.ownerName.trim(),
      email: form.email.toLowerCase().trim(),
      mobileNumber: form.mobileNumber.trim(),
      address: form.address.trim(),
      role: selectedRole,
      stores: selectedRole === "ADMIN" 
        ? stores.map((store: Store) => store._id)
        : [selectedStore],
    };
    
    if (form.password?.trim()) {
      payload.password = form.password.trim();
    }
    
    if (form.gstNumber?.trim()) {
      payload.gstNumber = form.gstNumber.trim();
    }
  
    console.log("Sending payload:", JSON.stringify(payload, null, 2));
    
    mutation.mutate(payload);
  };

  if (userLoading || storesLoading) {
    return (
      <div className="user-center-container">
        <Spin size="large" tip="Loading user data..." />
      </div>
    );
  }

  return (
    <div className="user-center-container">
      <div className="max-width-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full mb-4">
            <BankOutlined className="text-white text-2xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Edit User Details
          </h1>
          <p className="text-gray-600 text-lg">
            Update user information and store access
          </p>
        </div>

        <div className="user-register-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="user-role-container">
              <label className="user-role-label">
                <UserOutlined className="mr-2" />
                Select Account Type
              </label>
              <div className="user-role-grid">
                <button
                  type="button"
                  onClick={() => handleRoleChange("USER")}
                  className={`user-role-btn ${selectedRole === "USER" ? "user-role-btn-active" : ""}`}
                >
                  <UserOutlined className="user-role-icon" />
                  <div className="user-role-title">Medical Store Owner</div>
                  <div className="user-role-desc">Access to one store</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleRoleChange("ADMIN")}
                  className={`user-role-btn ${selectedRole === "ADMIN" ? "user-role-btn-active" : ""}`}
                >
                  <BankOutlined className="user-role-icon" />
                  <div className="user-role-title">Administrator</div>
                  <div className="user-role-desc">Access to all stores</div>
                </button>
              </div>
            </div>

            {selectedRole === "USER" && (
              <div className="user-store-container">
                <label className="user-store-label">
                  <ShopOutlined className="user-store-label-icon" />
                  Select Medical Store *
                </label>
                <Select
                  placeholder="Search and select a store"
                  value={selectedStore || undefined}
                  onChange={handleStoreChange}
                  className="user-store-select"
                  size="large"
                  loading={storesLoading}
                  showSearch
                  optionFilterProp="children"
                  notFoundContent={storesLoading ? <Spin size="small" /> : "No stores found"}
                  allowClear
                >
                  {stores.map((store: Store) => (
                    <Option key={store._id} value={store._id}>
                      <div className="flex items-center gap-2">
                        <ShopOutlined className="text-blue-500" />
                        <div>
                          <span className="font-medium">{store.name}</span>
                          <span className="text-gray-400 text-xs ml-2">
                            {store.address.substring(0, 30)}...
                          </span>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
                <p className="user-store-hint">
                  * Select the store this user will manage
                </p>
              </div>
            )}

            {selectedRole === "ADMIN" && (
              <div className="user-admin-container">
                <div className="user-admin-content">
                  <BankOutlined className="user-admin-icon" />
                  <div>
                    <p className="user-admin-title">Administrator Access</p>
                    <p className="user-admin-text">
                      Will have access to all {stores.length} stores
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="user-form-grid">
              <div>
                <label className="user-input-label">
                  <UserOutlined className="user-input-label-icon" />
                  Owner Name *
                </label>
                <input
                  name="ownerName"
                  value={form.ownerName}
                  onChange={handleChange}
                  placeholder="Enter owner name"
                  className="user-input"
                  required
                />
              </div>

              <div>
                <label className="user-input-label">
                  <MailOutlined className="user-input-label-icon" />
                  Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="user-input"
                  required
                />
              </div>
            </div>

            <div className="user-form-grid">
              <div>
                <label className="user-input-label">
                  <PhoneOutlined className="user-input-label-icon" />
                  Mobile Number *
                </label>
                <input
                  name="mobileNumber"
                  type="tel"
                  value={form.mobileNumber}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  className="user-input"
                  required
                />
              </div>

              <div>
                <label className="user-input-label">
                  <LockOutlined className="user-input-label-icon" />
                  Password (Optional)
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep unchanged"
                  className="user-input"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="user-input-label">
                <HomeOutlined className="user-input-label-icon" />
                Address *
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Complete address"
                className="user-input"
                required
              />
            </div>

            <div>
              <label className="user-input-label">
                <FileTextOutlined className="user-input-label-icon" />
                GST Number (Optional)
              </label>
              <input
                name="gstNumber"
                value={form.gstNumber}
                onChange={handleChange}
                placeholder="GST number"
                className="user-input"
              />
            </div>

            <div className="user-summary-box">
              <h3 className="user-summary-title">Account Summary:</h3>
              <ul className="user-summary-list">
                <li>• Role: <span className="font-semibold">{selectedRole}</span></li>
                <li>• Store Access: 
                  <span className="font-semibold ml-1">
                    {selectedRole === "ADMIN" 
                      ? `All ${stores.length} stores` 
                      : selectedStore 
                        ? stores.find(s => s._id === selectedStore)?.name || "1 store"
                        : "No store selected"}
                  </span>
                </li>
                {selectedRole === "USER" && !selectedStore && (
                  <li className="user-summary-warning">⚠️ Please select a store</li>
                )}
              </ul>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending || (selectedRole === "USER" && !selectedStore)}
              className="user-submit-btn"
            >
              {mutation.isPending ? (
                <span className="flex items-center justify-center">
                  <Spin size="small" className="mr-2" />
                  Updating User...
                </span>
              ) : (
                "Update User"
              )}
            </button>

            <p className="user-login-link">
              Back to user list?{" "}
              <Link to="/dashboard/users">Click here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
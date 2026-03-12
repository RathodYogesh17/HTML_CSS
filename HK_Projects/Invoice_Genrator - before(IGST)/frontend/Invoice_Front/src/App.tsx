// App.tsx
import { Routes, Route } from "react-router-dom";
import Register from "./components/common/Register";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/common/Private";
import { ProductList } from "./components/dashboard/admin/productList";
import UserList from "./components/dashboard/admin/UserList";
import ProductDetails from "./components/product/ProductDetails";
import EditForm from "./components/product/ProductEdit";
import AddForm from "./components/product/ProductAdd";
import UserProfile from "./components/user/UserProfile";
import { CompaniesList } from "./components/companies/CompaniesList";
import AddCompany from "./components/companies/AddCompanies";
import EditCompany from "./components/companies/EditCompanies";
import InvoiceList from "./components/invoices/InvoiceList";
import CreateInvoice from "./components/invoices/CreateInvoice";
import InvoiceView from "./components/invoices/Invoices";
import CategoryList from "./components/category/categoryList";
import CategoryEdit from "./components/category/categoryEdit";
import AddCategory from "./components/category/addCategory";
import EditUser from "./components/user/UserEdit";
import Login from "./components/common/Login";
import ForgotPassword from "./components/password-otp/ForgotPassword";
import VerifyOTP from "./components/password-otp/VerifyOTP";
import ResetPassword from "./components/password-otp/ResetPassword";
import '../public/css/password-otp.css'; 
import "../public/css/products.css"
import EditProduct from "./components/product/ProductEdit";


// In your routes
function App() {
  return (
    <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword/>} />
    <Route path="/verify-otp" element={<VerifyOTP />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/register" element={<Register />} />
  
    <Route path="/" element={
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    }>
      <Route path="users" element={<UserList />} />
      <Route path="products" element={<ProductList />} />
      <Route path="products/:id" element={<ProductDetails />} />
      <Route path="products/:id/edit" element={<EditForm />} />
      <Route path="products/add" element={<AddForm />} />
      <Route path="profile" element={<UserProfile />}/>
      <Route path="users/:id" element={<UserProfile />} />
      <Route path="/users/edit/:id" element={<EditUser />} />
      <Route path="/profile/edit" element={<EditUser />} />
      <Route path="companies" element={<CompaniesList />} />
      <Route path="add-company" element={<AddCompany />} />
      <Route path="invoices" element={<InvoiceList />} />
      <Route path="invoices/create" element={<CreateInvoice/>} />
      <Route path="invoices/view/:id" element={<InvoiceView/>} />
      <Route path="category" element={<CategoryList/>} />
      <Route path="/category/create" element={<AddCategory/>} />
      <Route path="/categories/edit/:id" element={<CategoryEdit />}/>
      <Route path="/edit-company/:id" element={<EditCompany />} /></Route>
<Route path="/products/:id/edit" element={<EditProduct />} />

        </Routes>

  
  );
}

export default App;

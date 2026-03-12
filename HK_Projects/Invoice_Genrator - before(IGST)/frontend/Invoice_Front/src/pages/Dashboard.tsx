import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, } from "react-router-dom";
import {
  FaBox, FaUsers, FaFileInvoice, FaSignOutAlt,
   FaClipboardList, FaStore, FaBars,
  FaUserCircle
} from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { useQueryClient } from "@tanstack/react-query";
  import { useNavigate } from "react-router-dom";


const Dashboard = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  
    queryClient.clear();
  
    navigate("/login", { replace: true }); 
  };
  

  useEffect(() => setIsSidebarOpen(false), [location]);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center p-3 rounded-xl font-semibold transition-all duration-300 group hover:bg-gray-100 border-2 ${isActive
      ? "bg-black text-white border-black shadow-lg shadow-black/10"
      : "text-gray-700 border-gray-200 hover:border-gray-400 hover:shadow-md"
    } ${isCollapsed ? "justify-center p-3" : "px-4 py-3"}`;

  return (
    <div className="flex h-screen bg-Linear-to-br from-gray-50 via-white to-gray-100 overflow-hidden">

      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm ">
        <div className="max-w-full px-8 h-16 flex items-center justify-between">

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleCollapse}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all lg:hidden xl:block"
            >
              <FaBars className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent hidden lg:block">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 hidden md:block">
              {user?.ownerName?.split(" ")[0] || "User"}
            </span>
            <div className="w-10 h-10 bg-linear-to-br from-black to-gray-900 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
              <FaUserCircle onClick={() => navigate("/profile")}
                className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </header>

      <aside className={`fixed lg:static inset-y-16 lg:inset-y-0 left-0 z-40 bg-white shadow-2xl border-r border-gray-200 transition-all duration-300 ${isCollapsed
          ? "w-20 lg:w-20"
          : isSidebarOpen
            ? "w-80"
            : "-translate-x-full lg:translate-x-0 lg:w-80"
        }`}>
        <div className="flex flex-col h-full overflow-auto mt-16">

          <div className="p-6 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white sticky top-0">
            {!isCollapsed && (
              <>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-linear-to-br from-black to-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                    <FaStore className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-xs text-gray-600 mt-1">{isAdmin ? "Admin" : "Store"}</p>
                  </div>
                </div>
              </>
            )}
            {isCollapsed && (
              <div className="w-12 h-12 mx-auto bg-linear-to-br from-black to-gray-900 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <FaStore className="w-7 h-7 text-white" />
              </div>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {isAdmin ? (
              <>
                <NavLink to="products" className={navClass}><FaBox className={`w-5 h-5 ${isCollapsed ? '' : 'mr-4'}`} /><span className={!isCollapsed ? 'block' : 'hidden'}>Products</span></NavLink>
                <NavLink to="users" className={navClass}><FaUsers className={`w-5 h-5 ${isCollapsed ? '' : 'mr-4'}`} /><span className={!isCollapsed ? 'block' : 'hidden'}>Users</span></NavLink>
               
                <NavLink to="invoices" className={navClass}><FaFileInvoice className={`w-5 h-5 ${isCollapsed ? '' : 'mr-4'}`} /><span className={!isCollapsed ? 'block' : 'hidden'}>Invoices</span></NavLink>
                <NavLink to="category" className={navClass}><BiCategory className={`w-5 h-5 ${isCollapsed ? '' : 'mr-4'}`} /><span className={!isCollapsed ? 'block' : 'hidden'}>Category</span></NavLink>
                <NavLink to="companies" className={navClass}><HiOutlineBuildingOffice2 className={`w-5 h-5 ${isCollapsed ? '' : 'mr-4'}`} /><span className={!isCollapsed ? 'block' : 'hidden'}>companies</span></NavLink>
              </>
            ) : (
              <>
                <NavLink to="products" className={navClass}><FaBox className={`w-5 h-5 ${isCollapsed ? '' : 'mr-4'}`} /><span className={!isCollapsed ? 'block' : 'hidden'}>Products</span></NavLink>
                <NavLink to="category" className={navClass}><BiCategory className={`w-5 h-5 ${isCollapsed ? '' : 'mr-4'}`} /><span className={!isCollapsed ? 'block' : 'hidden'}>Category</span></NavLink>
                <NavLink to="invoices" className={navClass}><FaClipboardList className={`w-5 h-5 ${isCollapsed ? '' : 'mr-4'}`} /><span className={!isCollapsed ? 'block' : 'hidden'}>Invoices</span></NavLink>
                <NavLink to="companies" className={navClass}><HiOutlineBuildingOffice2 className={`w-5 h-5 ${isCollapsed ? '' : 'mr-4'}`} /><span className={!isCollapsed ? 'block' : 'hidden'}>companies</span></NavLink>
              </>
            )}
            <div className="border-t border-gray-200 my-6"></div>
          
            <button
  onClick={handleLogout}
  className={`${navClass({ isActive: false })} text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 mt-4 w-full text-left`}
>
  <FaSignOutAlt className={`w-5 h-5 ${isCollapsed ? '' : 'mr-4'}`} />
  <span className={!isCollapsed ? 'block' : 'hidden'}>Sign Out</span>
</button>

          </nav>
        </div>
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" onClick={toggleSidebar} />
      )}

      <main className={` mt-16 flex-1 transition-all duration-300 pt-16 lg:pt-0 lg:pl-${isCollapsed ? '20' : '80'} overflow-auto`}>
        <div className=" h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

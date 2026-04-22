import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiActivity,
  FiCalendar,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiUser,
  FiUserPlus,
  FiBriefcase
} from 'react-icons/fi';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Logged out successfully');
    navigate('/portal'); // Changed from '/admin/login' to '/'
  };

  const menuItems = [
    {
      path: 'dashboard',
      name: 'Dashboard',
      icon: <FiActivity className="w-5 h-5" />,
    },
    {
      path: 'accounts',
      name: 'Manage Accounts',
      icon: <FiUsers className="w-5 h-5" />,
    },
    {
      path: 'appointments',
      name: 'Appointments',
      icon: <FiCalendar className="w-5 h-5" />,
    },
    {
      path: 'assistants',
      name: 'Manage Assistants',
      icon: <FiUserPlus className="w-5 h-5" />,
    }
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div 
        className="w-64 h-screen sticky top-0 flex flex-col"
        style={{
          backgroundColor: '#ff5a5f',
          backgroundImage: 'linear-gradient(to bottom, #ff5a5f, #ff4248)'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-red-300/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/90 rounded-lg shadow-sm">
              <FiBriefcase className="h-6 w-6 text-[#ff5a5f]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">MediCarePro</h2>
              <p className="text-xs text-white/80">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-all duration-200 mx-2 ${
                  isActive
                    ? 'bg-white/90 text-[#ff5a5f] font-medium shadow-sm'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="mr-3">
                {item.icon}
              </span>
              <span className="text-sm">{item.name}</span>
              {location.pathname.includes(`/admin/${item.path}`) && (
                <span className="ml-auto h-2 w-2 rounded-full bg-[#ff5a5f]"></span>
              )}
            </NavLink>
          ))}

          {/* Quick Action */}
          <button 
            className="mx-2 mt-6 flex items-center justify-center px-4 py-2 bg-white/90 text-[#ff5a5f] rounded-lg shadow-sm hover:bg-white transition-colors text-sm font-medium"
            onClick={() => navigate('/admin/accounts/new')}
          >
            <FiUserPlus className="mr-2" />
            Create Account
          </button>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-red-300/30">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-white/90 hover:bg-white/10 rounded-lg transition-colors group"
          >
            <FiLogOut className="mr-3 text-white/80 group-hover:text-white" />
            <span className="text-sm">Logout</span>
            <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </span>
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-4 py-2 bg-[#e04a50] text-white/80 text-xs flex justify-between">
          <span>Connected</span>
          <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminSidebar;
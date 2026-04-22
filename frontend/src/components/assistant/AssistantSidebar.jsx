import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiHome,
  FiCalendar,
  FiUsers,
  FiLogOut,
  FiList,
  FiUser,
  FiPlusCircle,
  FiActivity
} from 'react-icons/fi';
import NewAppointment from './NewAppointment';

const AssistantSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNewAppointment, setShowNewAppointment] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('assistantToken');
    localStorage.removeItem('assistant');
    toast.success('Logged out successfully');
    navigate('/portal');
  };

  const menuItems = [
    {
      path: '/assistant/dashboard',
      name: 'Dashboard',
      icon: <FiActivity className="w-5 h-5" />,
      active: location.pathname === '/assistant/dashboard'
    },
    {
      path: '/assistant/queue',
      name: 'Doctor Queue',
      icon: <FiList className="w-5 h-5" />,
      active: location.pathname === '/assistant/queue'
    },
    {
      path: '/assistant/manage-queue',
      name: 'Manage Queue',
      icon: <FiList className="w-5 h-5" />,
      active: location.pathname === '/assistant/manage-queue'
    },
    {
      path: '/assistant/appointments',
      name: 'Manage Appointments',
      icon: <FiCalendar className="w-5 h-5" />,
      active: location.pathname === '/assistant/appointments'
    },
    {
      path: '/assistant/patients',
      name: 'Patients',
      icon: <FiUsers className="w-5 h-5" />,
      active: location.pathname === '/assistant/patients'
    }
  ];

  return (
    <div 
      className="w-64 h-screen flex flex-col"
      style={{ 
        backgroundColor: '#ff5a5f',
        backgroundImage: 'linear-gradient(to bottom, #ff5a5f, #ff4248)'
      }}
    >
      {/* Header */}
      <div className="p-6 border-b border-red-300/30">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/90 rounded-lg shadow-sm">
            <FiUser className="h-6 w-6 text-[#ff5a5f]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">MediCarePro</h2>
            <p className="text-xs text-white/80">Assistant Portal</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 mx-2 ${
              item.active 
                ? 'bg-white/90 text-[#ff5a5f] font-medium shadow-sm'
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className={`mr-3 ${
              item.active ? 'text-[#ff5a5f]' : 'text-white/80'
            }`}>
              {item.icon}
            </span>
            <span className="text-sm">{item.name}</span>
            {item.active && (
              <span className="ml-auto h-2 w-2 rounded-full bg-[#ff5a5f]"></span>
            )}
          </Link>
        ))}

        {/* Quick Action */}
        <button 
          className="mx-2 mt-6 flex items-center justify-center px-4 py-2 bg-white/90 text-[#ff5a5f] rounded-lg shadow-sm hover:bg-white transition-colors text-sm font-medium"
          onClick={() => setShowNewAppointment(true)}
        >
          <FiPlusCircle className="mr-2" />
          New Appointment
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

      {/* New Appointment Popup */}
      {showNewAppointment && (
        <NewAppointment onClose={() => setShowNewAppointment(false)} />
      )}
    </div>
  );
};

export default AssistantSidebar;
import React, { useMemo } from 'react';

const AdminDashboardSection = ({
  overviewLoading,
  financial,
  appointments = [],
  accounts = []
}) => {
  // Calculate stats from accounts and appointments data (no backend fetch)
  const stats = useMemo(() => {
    // Total users: all patients in accounts
    const totalUsers = accounts.filter(acc => acc.type === 'patient').length;
    // Active doctors: all doctors with status 'approved'
    const activeDoctors = accounts.filter(acc => acc.type === 'doctor' && acc.status === 'approved').length;
    // Appointments: from appointments prop
    const totalAppointments = appointments.length;
    // Monthly revenue: from financial analytics if available
    const monthlyRevenue =
      financial?.revenueByMonth && financial.revenueByMonth.length > 0
        ? financial.revenueByMonth[0].revenue
        : 0;

    // Example: Calculate changes (dummy values, replace with real logic if needed)
    const usersChange = 12; // %
    const doctorsChange = 5; // %
    const appointmentsChange = -2; // %
    const revenueChange = 18; // %

    return {
      totalUsers,
      usersChange,
      activeDoctors,
      doctorsChange,
      totalAppointments,
      appointmentsChange,
      monthlyRevenue,
      revenueChange
    };
  }, [accounts, appointments, financial]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-[#3ba7a7]">Admin Dashboard</h1>
      {overviewLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#56c3c3]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            change={stats.usersChange}
            trend="up"
          />
          <StatCard
            title="Active Doctors"
            value={stats.activeDoctors}
            change={stats.doctorsChange}
            trend="up"
          />
          <StatCard
            title="Appointments"
            value={stats.totalAppointments}
            change={stats.appointmentsChange}
            trend={stats.appointmentsChange >= 0 ? 'up' : 'down'}
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue || 0}`}
            change={stats.revenueChange}
            trend="up"
          />
        </div>
      )}
      {/* ...existing dashboard charts/sections... */}
    </div>
  );
};

const StatCard = ({ title, value, change, trend }) => (
  <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
    <div className="text-lg font-semibold text-gray-700 mb-2">{title}</div>
    <div className="text-3xl font-bold text-[#3ba7a7] mb-2">{value}</div>
    <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
      {trend === 'up' ? (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
      {change > 0 ? `↑ ${change}%` : `↓ ${Math.abs(change)}%`}
    </div>
  </div>
);

export default AdminDashboardSection;
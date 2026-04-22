import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  FiUsers, 
  FiBriefcase, 
  FiCalendar, 
  FiDollarSign, 
  FiTrendingUp, 
  FiActivity 
} from 'react-icons/fi';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  AreaChart,
  Bar, 
  Line, 
  Pie, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import AdminAccounts from './AdminAccounts';
import AdminAppointments from './AdminAppointments';
import { API_BASE_URL } from '../config/api';

const AdminDashboard = () => {
  const [overview, setOverview] = useState({ 
    users: 0, 
    doctors: 0, 
    appointments: 0,
    revenue: 0,
    pendingAppointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    appointments: [],
    revenue: [],
    userGrowth: [],
    appointmentTypes: []
  });
  const [accounts, setAccounts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [graphRange, setGraphRange] = useState('7'); // '7', '30', '180'
  const [recentActivity, setRecentActivity] = useState([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Define fetchRecentActivity before useEffect
  const fetchRecentActivity = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/activity/latest`);
      setRecentActivity(res.data || []);
    } catch {
      setRecentActivity([]);
    }
  }, []);

  useEffect(() => {
    // Use data from AdminAccounts and AdminAppointments components
    // Instead of fetching here, rely on their data if already loaded
    // Optionally, you can lift state up if using a parent or context

    // For demonstration, fetch once on mount and reuse for dashboard
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch accounts
        const accountsRes = await axios.get(`${API_BASE_URL}/api/admin/accounts`);
        setAccounts(accountsRes.data);

        // Fetch appointments
        const apptsRes = await axios.get(`${API_BASE_URL}/api/admin/appointments`);
        setAppointments(apptsRes.data);

        // Compute total users: all accounts with type 'patient'
        // (If you want to count all accounts, remove the filter)
        setOverview({
          users: accountsRes.data.length, // Show all users (not just patients)
          doctors: accountsRes.data.filter(acc => acc.type === 'doctor' && acc.status === 'approved').length,
          appointments: apptsRes.data.length,
          revenue: 0,
          pendingAppointments: apptsRes.data.filter(a => a.status === 'pending').length
        });
      } catch (error) {
        setAccounts([]);
        setAppointments([]);
        setOverview({ users: 0, doctors: 0, appointments: 0, revenue: 0, pendingAppointments: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    fetchRecentActivity();
  }, [fetchRecentActivity]);

  // Compute appointments trend for selected range
  const appointmentsTrend = React.useMemo(() => {
    if (!appointments.length) return [];

    let days, labels, dateList;
    const now = new Date();

    if (graphRange === '30') {
      days = 30;
      labels = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (29 - i));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      dateList = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (29 - i));
        return d.toISOString().slice(0, 10);
      });
    } else if (graphRange === '180') {
      // 6 months, group by week
      days = 26; // 26 weeks ≈ 6 months
      labels = Array.from({ length: 26 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (7 * (25 - i)));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      dateList = Array.from({ length: 26 }, (_, i) => {
        const start = new Date(now);
        start.setDate(now.getDate() - (7 * (25 - i)));
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return [start, end];
      });
    } else {
      // Default: 7 days (this week, Mon-Sun)
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      dateList = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d.toISOString().slice(0, 10);
      });
    }

    if (graphRange === '180') {
      // Group by week
      return dateList.map(([start, end], idx) => {
        const weekAppointments = appointments.filter(a => {
          const date = new Date(a.appointment_date);
          return date >= start && date <= end;
        });
        return {
          name: labels[idx],
          appointments: weekAppointments.length,
          completed: weekAppointments.filter(a => a.status === 'completed').length
        };
      });
    } else {
      // Group by day
      return dateList.map((dateStr, idx) => {
        const dayAppointments = appointments.filter(a =>
          a.appointment_date && a.appointment_date.slice(0, 10) === dateStr
        );
        return {
          name: labels[idx],
          appointments: dayAppointments.length,
          completed: dayAppointments.filter(a => a.status === 'completed').length
        };
      });
    }
  }, [appointments, graphRange]);

  // Compute appointment types distribution from appointments data
  const appointmentTypesData = React.useMemo(() => {
    if (!appointments.length) return [];
    const typeCounts = appointments.reduce((acc, appt) => {
      const type = appt.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(typeCounts).map(([type, value]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value
    }));
  }, [appointments]);

  // Compute user growth per month from accounts data
  const userGrowthData = React.useMemo(() => {
    if (!accounts.length) return [];
    // Group by month (YYYY-MM)
    const growthMap = {};
    accounts.forEach(acc => {
      if (!acc.createdAt) return;
      const date = new Date(acc.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      growthMap[key] = (growthMap[key] || 0) + 1;
    });
    // Sort by month ascending
    const sortedKeys = Object.keys(growthMap).sort();
    let cumulative = 0;
    return sortedKeys.map(monthKey => {
      cumulative += growthMap[monthKey];
      // Format month label as "MMM YYYY"
      const [year, month] = monthKey.split('-');
      const label = new Date(`${year}-${month}-01`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return { month: label, users: cumulative };
    });
  }, [accounts]);

  // Compute recent activity from appointments and accounts
  const recentActivityData = React.useMemo(() => {
    // Combine appointments and accounts, sort by createdAt/appointment_date descending
    const activities = [];

    // Appointments
    appointments.forEach(appt => {
      if (appt.createdAt) {
        activities.push({
          type: 'appointment',
          createdAt: new Date(appt.createdAt),
          doctor: appt.doctorName || appt.doctor?.firstName + ' ' + appt.doctor?.lastName || '',
          patient: appt.patientName || appt.patient?.firstName + ' ' + appt.patient?.lastName || '',
          status: appt.status,
          id: appt.id
        });
      }
    });

    // Accounts (new users)
    accounts.forEach(acc => {
      if (acc.createdAt) {
        activities.push({
          type: 'user',
          createdAt: new Date(acc.createdAt),
          name: `${acc.firstName || ''} ${acc.lastName || ''}`.trim(),
          role: acc.type,
          id: acc.id
        });
      }
    });

    // Sort by createdAt descending, take latest 10
    return activities
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);
  }, [appointments, accounts]);

  const MetricCard = ({ icon, title, value, change, isCurrency = false }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">
              {loading ? <Skeleton width={60} /> : 
                isCurrency ? `$${value.toLocaleString()}` : value.toLocaleString()}
            </h3>
          </div>
        </div>
        {change && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-600">Key metrics and analytics for your clinic</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            icon={<FiUsers size={20} />} 
            title="Total Users" 
            value={accounts.length} // Show all users (not just patients)
            change={12} 
          />
          <MetricCard 
            icon={<FiBriefcase size={20} />} 
            title="Active Doctors" 
            value={accounts.filter(acc => acc.type === 'doctor' && acc.status === 'approved').length} 
            change={5} 
          />
          <MetricCard 
            icon={<FiCalendar size={20} />} 
            title="Appointments" 
            value={appointments.length} 
            change={-2} 
          />
          <MetricCard 
            icon={<FiDollarSign size={20} />} 
            title="Monthly Revenue" 
            value={overview.revenue} 
            isCurrency 
            change={18} 
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Appointments Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                <FiTrendingUp className="inline mr-2" />
                Appointments Trend
              </h2>
              <select
                className="text-sm border border-gray-200 rounded-lg px-3 py-1"
                value={graphRange}
                onChange={e => setGraphRange(e.target.value)}
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="180">Last 6 Months</option>
              </select>
            </div>
            <div className="h-80">
              {loading ? (
                <Skeleton height={320} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={appointmentsTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="appointments" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#10B981" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                <FiDollarSign className="inline mr-2" />
                Revenue Analytics
              </h2>
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-1">
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Yearly</option>
              </select>
            </div>
            <div className="h-80">
              {loading ? (
                <Skeleton height={320} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.revenue}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointment Types */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              <FiActivity className="inline mr-2" />
              Appointment Types
            </h2>
            <div className="h-64">
              {loading ? (
                <Skeleton height={256} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={appointmentTypesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {appointmentTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* User Growth */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              <FiUsers className="inline mr-2" />
              User Growth
            </h2>
            <div className="h-64">
              {loading ? (
                <Skeleton height={256} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#3B82F6" 
                      fill="#EFF6FF" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white mt-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="p-4">
                  <Skeleton count={2} />
                </div>
              ))
            ) : recentActivity.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No recent activity</div>
            ) : (
              recentActivity.map((activity, idx) => (
                <div key={idx} className="p-4 flex items-center">
                  {activity.type === 'appointment' ? (
                    <div className="bg-blue-100 p-2 rounded-full mr-4">
                      <FiCalendar className="text-blue-600" />
                    </div>
                  ) : (
                    <div className="bg-green-100 p-2 rounded-full mr-4">
                      <FiUsers className="text-green-600" />
                    </div>
                  )}
                  <div>
                    {activity.type === 'appointment' ? (
                      <>
                        <p className="font-medium">
                          New appointment {activity.status ? `(${activity.status})` : ''} booked
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.doctor && `Dr. ${activity.doctor} `}
                          {activity.patient && `with ${activity.patient}`}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium">New user registered</p>
                        <p className="text-sm text-gray-500">
                          {activity.name} ({activity.role})
                        </p>
                      </>
                    )}
                  </div>
                  <div className="ml-auto text-sm text-gray-500">
                    {activity.createdAt && (
                      (() => {
                        const now = new Date();
                        const created = new Date(activity.createdAt);
                        const diff = Math.floor((now - created) / 1000);
                        if (diff < 60) return `${diff}s ago`;
                        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                        return created.toLocaleDateString();
                      })()
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
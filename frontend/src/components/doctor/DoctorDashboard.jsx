import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from './DoctorSidebar';
import {
  FiActivity,
  FiCalendar,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiUser,
  FiMail,
  FiBriefcase,
  FiClock,
  FiAlertCircle,
  FiTrendingUp,
  FiRefreshCw,
  FiPlus,
  FiCheckCircle
} from 'react-icons/fi';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import DoctorAppointments from './DoctorAppointments'; // (if not already imported)
import NewAppointment from '../assistant/NewAppointment';
import { API_BASE_URL } from '../../config/api';

// Register ChartJS components
ChartJS.register(...registerables);

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    appointments: { today: 0, week: 0, change: 0 },
    patients: { total: 0, new: 0 },
    tasks: { pending: 0, completed: 0 }
  });
  const [error, setError] = useState(null);
  const [specialization, setSpecialization] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [showNewAppointment, setShowNewAppointment] = useState(false);

  useEffect(() => {
    // Always use the latest doctor info from DoctorSettings (localStorage)
    const localDoctor = localStorage.getItem('doctor');
    if (localDoctor) {
      const doc = JSON.parse(localDoctor);
      setDoctor(doc);
      setSpecialization(doc.specialization || '');
    }

    const fetchData = async () => {
      try {
        const doctorToken = localStorage.getItem('doctorToken');
        if (!doctorToken) {
          navigate('/doctor/login');
          return;
        }

        setLoading(true);
        // Only fetch stats from backend, not profile
        const statsRes = await axios.get(`${API_BASE_URL}/api/doctors/stats`, {
          headers: { 'doctor-token': doctorToken }
        });
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('');
        setStats({
          appointments: { today: 0, week: 0, change: 0 },
          patients: { total: 0, new: 0 },
          tasks: { pending: 0, completed: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    // Fetch appointments for stats
    const fetchAppointments = async () => {
      try {
        const doctorData = JSON.parse(localStorage.getItem('doctor'));
        if (!doctorData || !doctorData.id) return;
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/appointments/doctor/${doctorData.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(res.data);

        // Calculate stats from appointments
        const today = new Date().toISOString().slice(0, 10);
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const todayAppointments = res.data.filter(a =>
          a.appointment_date && a.appointment_date.slice(0, 10) === today
        ).length;

        const weekAppointments = res.data.filter(a => {
          const date = new Date(a.appointment_date);
          return date >= weekStart && date <= weekEnd;
        }).length;

        const totalPatients = new Set(res.data.map(a => a.patient_id)).size;
        const newPatients = res.data.filter(a =>
          a.appointment_date && a.appointment_date.slice(0, 10) === today
        ).map(a => a.patient_id);
        const uniqueNewPatients = new Set(newPatients).size;

        const pending = res.data.filter(a => a.status === 'pending').length;
        const completed = res.data.filter(a => a.status === 'completed').length;

        setStats({
          appointments: {
            today: todayAppointments,
            week: weekAppointments,
            change: 0 // You can implement week-over-week change if needed
          },
          patients: {
            total: totalPatients,
            new: uniqueNewPatients
          },
          tasks: {
            pending,
            completed
          }
        });
      } catch (error) {
        // fallback to previous error logic
        setError('Failed to load dashboard data.');
        setStats({
          appointments: { today: 0, week: 0, change: 0 },
          patients: { total: 0, new: 0 },
          tasks: { pending: 0, completed: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchAppointments();
  }, [navigate]);

  // Chart data and options
  const appointmentsData = React.useMemo(() => {
    // Build data for each day of the week (Mon-Sun)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d.toISOString().slice(0, 10);
    });

    // Count appointments per day
    const counts = weekDates.map(dateStr =>
      appointments.filter(a =>
        a.appointment_date && a.appointment_date.slice(0, 10) === dateStr
      ).length
    );

    return {
      labels: days,
      datasets: [
        {
          label: 'Appointments',
          data: counts,
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointBackgroundColor: 'rgba(99, 102, 241, 1)',
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  }, [appointments]);

  const patientsData = {
    labels: ['New Patients', 'Returning Patients', 'Follow-ups'],
    datasets: [
      {
        data: [stats.patients.new, Math.floor(stats.patients.total * 0.6), Math.floor(stats.patients.total * 0.3)],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(249, 115, 22, 0.8)'
        ],
        borderWidth: 0,
        hoverOffset: 10
      }
    ]
  };

  const tasksData = {
    labels: ['Completed', 'Pending', 'Overdue'],
    datasets: [
      {
        data: [stats.tasks.completed, stats.tasks.pending, 1],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 0,
        borderRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 20,
          font: {
            family: 'Inter, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          stepSize: 2
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        }
      }
    }
  };

  const pieChartOptions = {
    ...chartOptions,
    cutout: '70%',
    plugins: {
      ...chartOptions.plugins,
      legend: {
        position: 'right',
        labels: {
          ...chartOptions.plugins.legend.labels,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DoctorSidebar activeTab="dashboard" />
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} height={120} borderRadius="0.75rem" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton height={320} borderRadius="0.75rem" />
              <Skeleton height={320} borderRadius="0.75rem" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton height={280} borderRadius="0.75rem" />
              <Skeleton height={280} borderRadius="0.75rem" />
              <Skeleton height={280} borderRadius="0.75rem" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorSidebar activeTab="dashboard" />
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {error && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex items-start">
                <FiAlertCircle className="flex-shrink-0 h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {error} 
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome back, <span className="text-indigo-600">Dr. {doctor?.lastName || ''}</span>
              </h1>
              <p className="text-gray-600 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <button
                onClick={() => setShowNewAppointment(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <FiPlus className="mr-2" /> New Appointment
              </button>
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                aria-label="Refresh data"
              >
                <FiRefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Today's Appointments"
              value={stats.appointments.today}
              change={stats.appointments.change}
              icon={<FiCalendar className="text-indigo-600" size={20} />}
              color="bg-indigo-50"
              trend={stats.appointments.change >= 0 ? 'up' : 'down'}
            />
            <StatCard
              title="Weekly Appointments"
              value={stats.appointments.week}
              change={Math.floor(stats.appointments.week / 7)}
              icon={<FiTrendingUp className="text-blue-600" size={20} />}
              color="bg-blue-50"
              trend="up"
            />
            <StatCard
              title="Total Patients"
              value={stats.patients.total}
              change={stats.patients.new}
              icon={<FiUsers className="text-green-600" size={20} />}
              color="bg-green-50"
              trend="up"
            />
            <StatCard
              title="Pending Tasks"
              value={stats.tasks.pending}
              icon={<FiClock className="text-amber-600" size={20} />}
              color="bg-amber-50"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointments Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Appointments This Week</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                    {stats.appointments.change >= 0 ? '+' : ''}{stats.appointments.change} from last week
                  </span>
                </div>
              </div>
              <div className="h-80">
                <Line
                  data={appointmentsData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: { display: false }
                    }
                  }}
                />
              </div>
            </div>

            {/* Patients Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Patient Distribution</h3>
                <span className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                  Total: {stats.patients.total}
                </span>
              </div>
              <div className="h-80 flex items-center justify-center">
                <div className="w-full h-full max-w-md">
                  <Pie
                    data={patientsData}
                    options={pieChartOptions}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <ActionButton
                  onClick={() => navigate('/doctor/appointments')}
                  icon={<FiCalendar className="text-indigo-600" size={18} />}
                  title="View Appointments"
                  description="Check today's schedule"
                />
                <ActionButton
                  onClick={() => navigate('/doctor/patients')}
                  icon={<FiUsers className="text-blue-600" size={18} />}
                  title="Manage Patients"
                  description="View patient records"
                />
                <ActionButton
                  onClick={() => navigate('/doctor/prescriptions')}
                  icon={<FiCheckCircle className="text-green-600" size={18} />}
                  title="Write Prescription"
                  description="Create new medication orders"
                />
                <ActionButton
                  onClick={() => navigate('/doctor/settings')}
                  icon={<FiSettings className="text-amber-600" size={18} />}
                  title="Account Settings"
                  description="Update your profile"
                />
              </div>
            </div>

            {/* Tasks Overview */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Tasks Overview</h3>
                <span className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                  {`${Math.round((stats.tasks.completed / (stats.tasks.completed + stats.tasks.pending)) * 100)}% completed`}
                </span>
              </div>
              <div className="h-64">
                <Bar
                  data={tasksData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: { display: false }
                    }
                  }}
                />
              </div>
            </div>

            {/* Profile Summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Profile</h3>
              <div className="space-y-5">
                <ProfileItem
                  icon={<FiUser className="text-gray-500" size={18} />}
                  label="Name"
                  value={`Dr. ${doctor?.firstName || ''} ${doctor?.lastName || ''}`}
                />
                <ProfileItem
                  icon={<FiMail className="text-gray-500" size={18} />}
                  label="Email"
                  value={doctor?.email || ''}
                />
                <ProfileItem
                  icon={<FiBriefcase className="text-gray-500" size={18} />}
                  label="Specialization"
                  value={specialization || doctor?.specialization || ''}
                />
                <button
                  onClick={() => navigate('/doctor/settings')}
                  className="w-full mt-4 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center"
                >
                  <FiSettings className="mr-2" /> Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* New Appointment Popup */}
        {showNewAppointment && (
          <NewAppointment onClose={() => setShowNewAppointment(false)} />
        )}
      </div>
    </div>
  );
};

// Component for stat cards
const StatCard = ({ title, value, change, icon, color, trend }) => {
  return (
    <div className={`p-5 rounded-xl ${color} border border-gray-200 shadow-xs transition-all hover:shadow-sm`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-3">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {trend === 'up' ? (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                {change}
              </span>
            </div>
          )}
        </div>
        <div className="p-2.5 bg-white rounded-lg shadow-xs border border-gray-100">
          {icon}
        </div>
      </div>
    </div>
  );
};

// Component for action buttons
const ActionButton = ({ onClick, icon, title, description }) => {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 flex items-start space-x-4 text-left rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
    >
      <div className="p-2.5 bg-gray-100 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </button>
  );
};

// Component for profile items
const ProfileItem = ({ icon, label, value }) => {
  return (
    <div className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
      <div className="p-2 bg-white rounded-lg border border-gray-200">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
};

export default DoctorDashboard;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiVideo, 
  FiCheckCircle, 
  FiXCircle,
  FiFilter,
  FiPhoneCall,
  FiRefreshCw,
  FiSearch
} from 'react-icons/fi';
import { startOfToday, startOfTomorrow, startOfWeek, endOfWeek, addWeeks, isSameDay, isWithinInterval } from 'date-fns';
import DoctorSidebar from './DoctorSidebar';
import { API_BASE_URL } from '../../config/api';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [dayFilter, setDayFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const doctorData = JSON.parse(localStorage.getItem('doctor'));
    if (!doctorData || doctorData.role !== 'doctor') {
      navigate('/doctor/login');
      return;
    }
    setDoctor(doctorData);
    fetchAppointments(doctorData.id);
  }, [navigate, refresh]);

  const fetchAppointments = async (doctorId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/appointments/doctor/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);
      setFilteredAppointments(response.data);
    } catch (error) {
      toast.error('Failed to fetch appointments. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filterAppointments = () => {
      let filtered = [...appointments];

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(appointment => {
          const firstName = appointment.firstName?.toLowerCase() || '';
          const lastName = appointment.lastName?.toLowerCase() || '';
          const phone = appointment.phone?.toString() || '';
          const type = appointment.type?.toLowerCase() || '';
          return (
            firstName.includes(query) ||
            lastName.includes(query) ||
            phone.includes(query) ||
            type.includes(query)
          );
        });
      }

      // Filter by time
      if (timeFilter !== 'all') {
        filtered = filtered.filter(appointment => {
          const appointmentTime = new Date(appointment.appointment_date).getHours();
          if (timeFilter === 'morning') return appointmentTime >= 6 && appointmentTime < 12;
          if (timeFilter === 'afternoon') return appointmentTime >= 12 && appointmentTime < 18;
          if (timeFilter === 'evening') return appointmentTime >= 18 && appointmentTime < 24;
          return true;
        });
      }

      // Filter by day
      if (dayFilter !== 'all') {
        const today = startOfToday();
        const tomorrow = startOfTomorrow();
        const startOfThisWeek = startOfWeek(today);
        const endOfThisWeek = endOfWeek(today);
        const startOfNextWeek = startOfWeek(addWeeks(today, 1));
        const endOfNextWeek = endOfWeek(addWeeks(today, 1));

        filtered = filtered.filter(appointment => {
          const appointmentDate = new Date(appointment.appointment_date);
          if (dayFilter === 'today') return isSameDay(appointmentDate, today);
          if (dayFilter === 'tomorrow') return isSameDay(appointmentDate, tomorrow);
          if (dayFilter === 'thisWeek') return isWithinInterval(appointmentDate, { 
            start: startOfThisWeek, end: endOfThisWeek 
          });
          if (dayFilter === 'nextWeek') return isWithinInterval(appointmentDate, { 
            start: startOfNextWeek, end: endOfNextWeek 
          });
          return true;
        });
      }

      setFilteredAppointments(filtered);
    };

    filterAppointments();
  }, [searchQuery, timeFilter, dayFilter, appointments]);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = newStatus === 'confirmed' 
        ? `${API_BASE_URL}/api/appointments/${appointmentId}/confirm`
        : `${API_BASE_URL}/api/appointments/${appointmentId}/cancel`;

      await axios.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAppointments(prev => prev.map(app => 
        app.id === appointmentId ? { ...app, status: newStatus } : app
      ));

      toast.success(`Appointment ${newStatus === 'confirmed' ? 'confirmed' : 'canceled'} successfully`);

      if (newStatus === 'confirmed') {
        navigate('/doctor/office-queue');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    }
  };

  const handlePaymentStatusChange = async (appointmentId, currentStatus) => {
    try {
      setUpdatingPayment(appointmentId);
      const token = localStorage.getItem('token');
      // Toggle payment status: if 'paid' -> 'unpaid', else 'paid'
      const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
      await axios.put(
        `${API_BASE_URL}/api/appointments/${appointmentId}/payment-status`,
        { payment_status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, payment_status: newStatus } : app
        )
      );
      toast.success(`Payment status updated to "${newStatus}"`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    } finally {
      setUpdatingPayment(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <FiClock className="mr-1" /> },
      confirmed: { color: 'bg-green-100 text-green-800', icon: <FiCheckCircle className="mr-1" /> },
      cancelled: { color: 'bg-red-100 text-red-800', icon: <FiXCircle className="mr-1" /> },
      completed: { color: 'bg-blue-100 text-blue-800', icon: <FiCheckCircle className="mr-1" /> }
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full inline-flex items-center ${statusMap[status.toLowerCase()]?.color || 'bg-gray-100 text-gray-800'}`}>
        {statusMap[status.toLowerCase()]?.icon}
        {status}
      </span>
    );
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (!doctor) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorSidebar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
              <p className="text-gray-600">Manage and view your upcoming appointments</p>
            </div>
            <button 
              onClick={() => setRefresh(!refresh)}
              className="mt-4 md:mt-0 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-xs flex items-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FiRefreshCw className="mr-2" />
              Refresh
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 mb-6">
            <div className="flex flex-col space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search patients by name, phone, or appointment type..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <FiXCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                {/* Date Filter */}
                <div className="flex items-center">
                  <FiFilter className="text-gray-400 mr-2" />
                  <label className="text-sm font-medium text-gray-700 mr-2">Date:</label>
                  <select
                    value={dayFilter}
                    onChange={(e) => setDayFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="thisWeek">This Week</option>
                    <option value="nextWeek">Next Week</option>
                  </select>
                </div>
                {/* Time Filter */}
                <div className="flex items-center">
                  <FiClock className="text-gray-400 mr-2" />
                  <label className="text-sm font-medium text-gray-700 mr-2">Time:</label>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Times</option>
                    <option value="morning">Morning (6AM-12PM)</option>
                    <option value="afternoon">Afternoon (12PM-6PM)</option>
                    <option value="evening">Evening (6PM-12AM)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center p-12">
                  <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || dayFilter !== 'all' || timeFilter !== 'all' 
                      ? "Try adjusting your search or filters" 
                      : "You don't have any appointments scheduled yet"}
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.map((appointment) => {
                      const { date, time } = formatDateTime(appointment.appointment_date);
                      return (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FiUser className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {appointment.firstName} {appointment.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  <span className="inline-flex items-center">
                                    <FiPhoneCall className="mr-1" /> {appointment.phone}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">{date}</div>
                            <div className="text-sm text-gray-500">{time}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              appointment.type === 'video' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {appointment.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(appointment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              appointment.payment_status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {appointment.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                            </span>
                            <button
                              onClick={() => handlePaymentStatusChange(appointment.id, appointment.payment_status)}
                              className="ml-3 px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                              disabled={updatingPayment === appointment.id}
                            >
                              {updatingPayment === appointment.id ? 'Updating...' : 'Change'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              {appointment.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                                  >
                                    <FiCheckCircle className="mr-1" /> Confirm
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                                  >
                                    <FiXCircle className="mr-1" /> Cancel
                                  </button>
                                </>
                              )}
                              {appointment.status === 'confirmed' && (
                                <button
                                  onClick={() => navigate(`/doctor/appointment-live/${appointment.id}`)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
                                >
                                  <FiVideo className="mr-1" /> Join
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;
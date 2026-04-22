import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from './DoctorSidebar';
import { 
  FiClock,
  FiUser,
  FiCalendar,
  FiPlay,
  FiEye,
  FiCheckCircle,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiSearch
} from 'react-icons/fi';
import { API_BASE_URL } from '../../config/api';

const DoctorOfficeQueue = () => {
  const [queuedAppointments, setQueuedAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueuedAppointments();
  }, []);

  useEffect(() => {
    const filtered = queuedAppointments.filter(appointment => {
      if (!appointment) return false;
      
      const searchLower = searchTerm.toLowerCase();
      const firstName = appointment.firstName || '';
      const lastName = appointment.lastName || '';
      const patientId = appointment.patientId || '';
      const status = appointment.status || '';
      const appointmentDate = appointment.appointment_date ? new Date(appointment.appointment_date) : null;

      return (
        firstName.toLowerCase().includes(searchLower) ||
        lastName.toLowerCase().includes(searchLower) ||
        patientId.toLowerCase().includes(searchLower) ||
        status.toLowerCase().includes(searchLower) ||
        (appointmentDate && (
          appointmentDate.toLocaleDateString().toLowerCase().includes(searchLower) ||
          appointmentDate.toLocaleTimeString().toLowerCase().includes(searchLower)
        ))
      );
    });
    setFilteredAppointments(filtered);
  }, [searchTerm, queuedAppointments]);

  const fetchQueuedAppointments = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const token = localStorage.getItem('token');
      const doctorData = JSON.parse(localStorage.getItem('doctor'));
      
      if (!doctorData?.id) {
        toast.error('Doctor information not found');
        navigate('/doctor/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/appointments/queue/${doctorData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setQueuedAppointments(response.data || []);
      setFilteredAppointments(response.data || []);
    } catch (error) {
      console.error('Error fetching queue:', error);
      setError('Failed to fetch queued appointments');
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStartAppointment = async (appointmentId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/appointments/${appointmentId}/start`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Appointment started successfully');
      fetchQueuedAppointments();
      navigate(`/doctor/appointment-live/${appointmentId}`);
    } catch (error) {
      toast.error('Failed to start appointment');
    }
  };

  const handleEndAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to end this appointment?')) {
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/api/appointments/${appointmentId}/end`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Appointment completed successfully');
      fetchQueuedAppointments();
    } catch (error) {
      toast.error('Failed to end appointment');
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const statusMap = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: <FiClock className="mr-1" /> },
      'confirmed': { color: 'bg-blue-100 text-blue-800', icon: <FiClock className="mr-1" /> },
      'in_progress': { color: 'bg-green-100 text-green-800', icon: <FiPlay className="mr-1" /> },
      'completed': { color: 'bg-gray-100 text-gray-800', icon: <FiCheckCircle className="mr-1" /> }
    };

    const { color, icon } = statusMap[status] || { color: 'bg-gray-100 text-gray-800', icon: null };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        {icon}
        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <DoctorSidebar />
        <div className="flex-1 p-8">
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center gap-4">
              <FiLoader className="animate-spin h-12 w-12 text-[#ff5a5f]" />
              <p className="text-lg text-gray-600">Loading queue...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DoctorSidebar />
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Office Queue</h2>
              <p className="text-gray-600 mt-1">
                {filteredAppointments?.length || 0} appointment{filteredAppointments?.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <button
              onClick={fetchQueuedAppointments}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search patients, time, or status..."
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div className="flex items-center">
              <FiAlertCircle className="h-6 w-6 text-red-500 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Error loading queue</h3>
                <p className="mt-1 text-gray-600">
                  {error}. Please try refreshing the page.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments?.map((appointment, index) => (
                    <tr key={appointment?.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-[#ff5a5f]/10 rounded-full flex items-center justify-center">
                            <FiUser className="text-[#ff5a5f] w-5 h-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment?.firstName || 'N/A'} {appointment?.lastName || ''}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment?.patientId || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment?.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment?.appointment_date ? new Date(appointment.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(appointment?.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {appointment?.status === 'in_progress' ? (
                          <div className="flex space-x-2 justify-end">
                            <button
                              onClick={() => navigate(`/doctor/appointment-live/${appointment.id}`)}
                              className="flex items-center gap-1 px-4 py-2 bg-[#ff5a5f] text-white rounded-lg hover:bg-[#ff7a7f] transition-colors"
                            >
                              <FiEye />
                              View
                            </button>
                            <button
                              onClick={() => handleEndAppointment(appointment.id)}
                              className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <FiCheckCircle />
                              End
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartAppointment(appointment.id)}
                            className="flex items-center gap-1 px-4 py-2 bg-[#ff5a5f] text-white rounded-lg hover:bg-[#ff7a7f] transition-colors"
                            disabled={appointment?.status === 'completed'}
                          >
                            <FiPlay />
                            Start
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredAppointments?.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                          {queuedAppointments?.length === 0 
                            ? 'No appointments in queue' 
                            : 'No matching appointments found'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {queuedAppointments?.length === 0
                            ? 'Patients will appear here when they check in for their appointments.'
                            : 'Try adjusting your search query.'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorOfficeQueue;
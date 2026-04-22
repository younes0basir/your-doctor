import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AssistantSidebar from './AssistantSidebar';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiClock,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiSearch,
  FiArrowUp,
  FiArrowDown,
  FiX
} from 'react-icons/fi';

const AssistantManageQueue = () => {
  const [queue, setQueue] = useState([]);
  const [filteredQueue, setFilteredQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorId, setDoctorId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  useEffect(() => {
    const filtered = queue.filter(patient => {
      if (!patient) return false;
      
      const searchLower = searchTerm.toLowerCase();
      const firstName = patient.firstName || '';
      const lastName = patient.lastName || '';
      const email = patient.email || '';
      const phone = patient.phoneNumber || '';
      const status = patient.status || '';

      return (
        firstName.toLowerCase().includes(searchLower) ||
        lastName.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower) ||
        phone.toLowerCase().includes(searchLower) ||
        status.toLowerCase().includes(searchLower)
      );
    });
    setFilteredQueue(filtered);
  }, [searchTerm, queue]);

  const fetchQueue = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const token = localStorage.getItem('assistantToken');
      if (!token) {
        toast.error('Please login to view queue');
        return;
      }
      const profileRes = await axios.get(`${API_BASE_URL}/api/assistants/profile`, {
        headers: { 'assistant-token': token }
      });
      const doctorId = profileRes.data?.doctor_id;
      setDoctorId(doctorId);
      if (!doctorId) {
        setQueue([]);
        setFilteredQueue([]);
        return;
      }
      // Use assistant endpoint and send assistant-token
      const appointmentsRes = await axios.get(
        `${API_BASE_URL}/api/appointments/assistant/doctor/${doctorId}`,
        { headers: { 'assistant-token': token } }
      );
      setQueue(appointmentsRes.data || []);
      setFilteredQueue(appointmentsRes.data || []);
    } catch (err) {
      console.error('Error fetching queue:', err);
      setError('Failed to load queue');
      toast.error('Failed to load queue');
      setQueue([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newQueue = [...filteredQueue];
    [newQueue[index], newQueue[index - 1]] = [newQueue[index - 1], newQueue[index]];
    setFilteredQueue(newQueue);
    // Here you would also call an API to update the queue order
  };

  const handleMoveDown = (index) => {
    if (index === filteredQueue.length - 1) return;
    const newQueue = [...filteredQueue];
    [newQueue[index], newQueue[index + 1]] = [newQueue[index + 1], newQueue[index]];
    setFilteredQueue(newQueue);
    // Here you would also call an API to update the queue order
  };

  const handleRemove = (id) => {
    if (window.confirm('Are you sure you want to remove this patient from the queue?')) {
      setFilteredQueue(filteredQueue.filter(patient => patient.id !== id));
      // Here you would also call an API to remove the patient from the queue
    }
  };

  const handleToggleQueueStatus = async (appointmentId, currentStatus) => {
    try {
      const token = localStorage.getItem('assistantToken');
      if (!token) {
        toast.error('Please login');
        return;
      }
      setUpdatingId(appointmentId);
      // Backend expects a boolean for is_in_queue
      let newIsInQueue;
      if (currentStatus === 'in_queue') {
        newIsInQueue = false;
      } else {
        newIsInQueue = true;
      }
      await axios.patch(
        `${API_BASE_URL}/api/appointments/${appointmentId}/queue-status`,
        { is_in_queue: newIsInQueue },
        { headers: { 'assistant-token': token } }
      );
      toast.success(`Patient ${newIsInQueue ? 'added to' : 'removed from'} queue`);
      // Refetch queue from backend to ensure sync
      await fetchQueue();
    } catch (err) {
      toast.error('Failed to update queue status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const statusMap = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: <FiClock className="mr-1" /> },
      'confirmed': { color: 'bg-blue-100 text-blue-800', icon: <FiClock className="mr-1" /> },
      'in_progress': { color: 'bg-green-100 text-green-800', icon: <FiClock className="mr-1" /> },
      'completed': { color: 'bg-gray-100 text-gray-800', icon: <FiClock className="mr-1" /> }
    };

    const { color, icon } = statusMap[status] || { color: 'bg-gray-100 text-gray-800', icon: null };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}>
        {icon}
        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AssistantSidebar activeTab="manage-queue" />
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 h-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Manage Doctor's Queue</h1>
              <p className="text-gray-600">
                {filteredQueue.length} patient{filteredQueue.length !== 1 ? 's' : ''} in queue
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchQueue}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search patients..."
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-4">
                <FiLoader className="animate-spin h-8 w-8 text-blue-500" />
                <p className="text-gray-600">Loading queue...</p>
              </div>
            </div>
          ) : error ? (
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
          ) : filteredQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <FiUser className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800">
                {queue.length === 0 ? 'No patients in queue' : 'No matching patients found'}
              </h3>
              <p className="text-gray-500 mt-2">
                {queue.length === 0 
                  ? 'Patients will appear here when they check in.' 
                  : 'Try adjusting your search term.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQueue.map((appointment, index) => (
                <div 
                  key={appointment.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                      </div>
                      <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiUser className="text-blue-600 w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {appointment.firstName} {appointment.lastName}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1 truncate">
                          <FiMail className="mr-2 flex-shrink-0" />
                          <span className="truncate">{appointment.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1 truncate">
                          <FiPhone className="mr-2 flex-shrink-0" />
                          <span className="truncate">{appointment.phoneNumber || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1 truncate">
                          <FiClock className="mr-2 flex-shrink-0" />
                          <span className="truncate">{appointment.appointment_date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(appointment.status)}
                      <button
                        onClick={() => handleToggleQueueStatus(appointment.id, appointment.is_in_queue)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.is_in_queue === 'in_queue'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        disabled={updatingId === appointment.id}
                      >
                        {appointment.is_in_queue === 'in_queue' ? 'Not in Queue' : 'In Queue'}
                      </button>
                      {/* ...existing remove button if needed... */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistantManageQueue;
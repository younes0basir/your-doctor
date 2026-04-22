import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DoctorSidebar from './DoctorSidebar';
import axios from 'axios';
import { FiCalendar, FiUser, FiFileText, FiAlertCircle, FiLoader, FiSearch, FiMail, FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../config/api';

const PatientHistory = () => {
  const { patientId } = useParams();
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('doctorToken');
        if (!token) throw new Error('No authentication token found');
        
        // Get doctorId from profile endpoint
        let doctorId;
        try {
          const profileRes = await axios.get(`${API_BASE_URL}/api/doctors/profile`, {
            headers: { 'doctor-token': token }
          });
          doctorId = profileRes.data?.id;
        } catch {
          throw new Error('Unable to fetch doctor profile');
        }
        if (!doctorId) throw new Error('No doctor id found');
        
        // Fetch patient history for this doctor and patient
        const res = await axios.get(
          `${API_BASE_URL}/api/history/doctor/${doctorId}/patient/${patientId}/history`,
          { headers: { 'doctor-token': token } }
        );
        
        setHistory(res.data || []);
        setFilteredHistory(res.data || []);
        
        // Set patient info if available
        if (res.data && res.data.length > 0) {
          setPatient({
            firstName: res.data[0].patientFirstName,
            lastName: res.data[0].patientLastName,
            email: res.data[0].patientEmail,
            phone: res.data[0].patientPhone,
          });
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch history';
        setError(errorMessage);
        toast.error(errorMessage);
        setHistory([]);
        setFilteredHistory([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (patientId) fetchHistory();
  }, [patientId]);

  // Apply filters whenever search term or time filter changes
  useEffect(() => {
    let results = history;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(item => 
        (item.diagnosis && item.diagnosis.toLowerCase().includes(term)) ||
        (item.prescription_text && item.prescription_text.toLowerCase().includes(term)) ||
        (item.doctorFirstName && `${item.doctorFirstName} ${item.doctorLastName}`.toLowerCase().includes(term))
      );
    }
    
    // Apply time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      results = results.filter(item => {
        if (!item.history_date) return false;
        const historyDate = new Date(item.history_date);
        
        switch (timeFilter) {
          case 'today':
            return historyDate.toDateString() === now.toDateString();
          case 'week':
            const oneWeekAgo = new Date(now);
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return historyDate >= oneWeekAgo;
          case 'month':
            const oneMonthAgo = new Date(now);
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            return historyDate >= oneMonthAgo;
          case 'year':
            const oneYearAgo = new Date(now);
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            return historyDate >= oneYearAgo;
          default:
            return true;
        }
      });
    }
    
    setFilteredHistory(results);
  }, [searchTerm, timeFilter, history]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorSidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Patient Medical History</h1>
            {patient && (
              <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="bg-[#ff5a5f] bg-opacity-20 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                      <FiUser className="text-[#ff5a5f] text-xl" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {patient.firstName} {patient.lastName}
                      </h2>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1 text-sm text-gray-600">
                        {patient.email && (
                          <span className="flex items-center">
                            <FiMail className="mr-1" /> {patient.email}
                          </span>
                        )}
                        {patient.phone && (
                          <span className="flex items-center">
                            <FiPhone className="mr-1" /> {patient.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filters Section */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#ff5a5f] focus:border-[#ff5a5f] sm:text-sm"
                placeholder="Search by diagnosis, prescription or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="time-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Time Period:
              </label>
              <select
                id="time-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#ff5a5f] focus:border-[#ff5a5f] sm:text-sm rounded-md"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>

          {/* Content Section */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#ff5a5f] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading patient history...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg p-6 text-center">
              <FiAlertCircle className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading history</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-[#ff5a5f] text-white px-4 py-2 rounded-md hover:bg-[#e04a50] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center">
              <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                {history.length === 0 ? 'No medical history found' : 'No matching records found'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {history.length === 0 
                  ? "This patient doesn't have any recorded medical history yet."
                  : "Try adjusting your search or time filter."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Diagnosis
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prescription
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Appointment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredHistory.map((h, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiCalendar className="flex-shrink-0 mr-2 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(h.history_date)}
                              </div>
                              {h.history_date && (
                                <div className="text-xs text-gray-500">
                                  {new Date(h.history_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs">
                            {h.diagnosis || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs">
                            {h.prescription_text || 'N/A'}
                          </div>
                          {h.prescription_date && (
                            <div className="text-xs text-gray-500 mt-1">
                              Prescribed: {formatDate(h.prescription_date)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {h.doctorFirstName} {h.doctorLastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(h.appointment_date)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AssistantSidebar from './AssistantSidebar';
import { 
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiSearch,
  FiFileText
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

const AssistantPatients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(patient => {
      if (!patient) return false;
      
      const searchLower = searchTerm.toLowerCase();
      const firstName = patient.firstName || '';
      const lastName = patient.lastName || '';
      const email = patient.email || '';
      const phone = patient.phoneNumber || '';

      return (
        firstName.toLowerCase().includes(searchLower) ||
        lastName.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower) ||
        phone.includes(searchTerm)
      );
    });
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const token = localStorage.getItem('assistantToken');
      
      if (!token) {
        toast.error('Please login to view patients');
        return;
      }

      const profileRes = await axios.get(`${API_BASE_URL}/api/assistants/profile`, {
        headers: { 'assistant-token': token }
      });
      
      const doctorId = profileRes.data?.doctor_id;
      if (!doctorId) {
        setPatients([]);
        toast.error('No doctor assigned');
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/api/patients/doctor/${doctorId}`, {
        headers: { 'assistant-token': token }
      });
      
      setPatients(res.data || []);
      setFilteredPatients(res.data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients');
      toast.error('Failed to load patients');
      setPatients([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never visited';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AssistantSidebar activeTab="patients" />
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 h-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Doctor's Patients</h1>
              <p className="text-gray-600">
                {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} under care
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={fetchPatients}
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
              placeholder="Search patients by name, email or phone..."
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-4">
                <FiLoader className="animate-spin h-8 w-8 text-blue-500" />
                <p className="text-gray-600">Loading patients...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="flex items-center">
                <FiAlertCircle className="h-6 w-6 text-red-500 mr-4" />
                <div>
                  <h3 className="text-lg font-medium text-red-800">Error loading patients</h3>
                  <p className="mt-1 text-gray-600">
                    {error}. Please try refreshing the page.
                  </p>
                </div>
              </div>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <FiUser className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800">
                {patients.length === 0 ? 'No patients found' : 'No matching patients found'}
              </h3>
              <p className="text-gray-500 mt-2">
                {patients.length === 0 
                  ? 'Your doctor currently has no patients assigned.' 
                  : 'Try adjusting your search term.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Visit
                    </th>
                    {/* <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th> */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FiUser className="text-blue-600 w-5 h-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.gender || 'Not specified'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiMail className="mr-2 text-gray-400" />
                          {patient.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <FiPhone className="mr-2 text-gray-400" />
                          {patient.phoneNumber || 'Not provided'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {patient.age ? `${patient.age} years` : 'Not specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 flex items-center">
                          <FiCalendar className="mr-2 text-gray-400" />
                          {formatDate(patient.lastVisitDate)}
                        </div>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/assistant/patient-history/${patient.id}`)}
                          className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FiFileText className="mr-2" />
                          View
                        </button>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistantPatients;
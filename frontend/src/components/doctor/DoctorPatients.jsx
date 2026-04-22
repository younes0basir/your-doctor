import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiUser, 
  FiFileText, 
  FiPhone,
  FiMail,
  FiCalendar,
  FiAlertCircle,
  FiSearch
} from 'react-icons/fi';
import DoctorSidebar from './DoctorSidebar';
import { API_BASE_URL } from '../../config/api';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('doctorToken');
        if (!token) throw new Error('No authentication token found');
        
        const profileRes = await axios.get(`${API_BASE_URL}/api/doctors/profile`, {
          headers: { 'doctor-token': token }
        });
        
        const doctorId = profileRes.data?.id;
        if (!doctorId) throw new Error('No doctor id found');
        
        const res = await axios.get(`${API_BASE_URL}/api/patients/doctor/${doctorId}`, {
          headers: { 'doctor-token': token }
        });
        
        setPatients(res.data || []);
        setFilteredPatients(res.data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch patients');
        toast.error(err.message || 'Failed to fetch patients');
        setPatients([]);
        setFilteredPatients([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = patients.filter(patient => 
        (patient.firstName && patient.firstName.toLowerCase().includes(lowercasedSearch)) ||
        (patient.lastName && patient.lastName.toLowerCase().includes(lowercasedSearch)) ||
        (patient.email && patient.email.toLowerCase().includes(lowercasedSearch)) ||
        (patient.phoneNumber && patient.phoneNumber.includes(searchTerm))
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#ff5a5f] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorSidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Patients</h1>
              <div className="flex items-center mt-2 text-gray-500">
                <FiUser className="mr-2" />
                <span>{filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'} under your care</span>
              </div>
            </div>
            {/* Search Bar */}
            <div className="mt-4 md:mt-0 w-full md:w-auto">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-[#ff5a5f] focus:border-[#ff5a5f] block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Patients List */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              {error ? (
                <div className="text-center p-12">
                  <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading patients</h3>
                  <p className="mt-1 text-sm text-gray-500">{error}</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center p-12">
                  <FiUser className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {searchTerm ? 'No matching patients found' : 'No patients found'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try a different search term' : 'You don\'t have any patients assigned yet'}
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
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Age
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Visit
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#ff5a5f] bg-opacity-20 flex items-center justify-center">
                              <FiUser className="h-5 w-5 text-[#ff5a5f]" />
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
                            {patient.lastVisitDate ? 
                              new Date(patient.lastVisitDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'Never visited'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => navigate(`/doctor/patient-history/${patient.id}`)}
                            className="bg-[#ff5a5f] bg-opacity-10 hover:bg-opacity-20 text-[#ff5a5f] px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <FiFileText className="mr-2" />
                            View History
                          </button>
                        </td>
                      </tr>
                    ))}
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

export default DoctorPatients;
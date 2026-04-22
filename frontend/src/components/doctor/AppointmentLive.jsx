



import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiVideo, 
  FiUser, 
  FiCalendar, 
  FiFileText, 
  FiPlusCircle,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiChevronRight,
  FiHeart,
  FiActivity,
  FiDroplet,
  FiThermometer,
  FiInfo
} from 'react-icons/fi';
import VideoCall from '../video/VideoCall';
import DoctorSidebar from './DoctorSidebar';

const AppointmentLive = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [vitals, setVitals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    fetchAppointmentDetails();
  }, [appointmentId]);

  useEffect(() => {
    if (appointment?.patientId) {
      fetchPatientHistory();
      fetchPatientVitals();
    }
  }, [appointment]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppointment(response.data);
      if (!response.data?.patientId) {
        setLoading(false);
      }
    } catch (error) {
      toast.error('Failed to fetch appointment details');
      setLoading(false);
    }
  };

  const fetchPatientHistory = async () => {
    try {
      const doctorToken = localStorage.getItem('doctorToken');
      const response = await axios.get(
        `/api/doctor/patients/${appointment?.patientId}/history`,
        { headers: { 'doctor-token': doctorToken } }
      );
      setPatientHistory(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch patient history');
      setLoading(false);
    }
  };

  const fetchPatientVitals = async () => {
    try {
      const response = await axios.get(
        `/api/patients/${appointment?.patientId}/vitals`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      setVitals(response.data);
    } catch (error) {
      console.error('Failed to fetch patient vitals', error);
    }
  };

  const handleCreatePrescription = () => {
    navigate(`/doctor/ordonnance/new/${appointmentId}`);
  };

  const handleEndAppointment = async () => {
    try {
      setIsEnding(true);
      await axios.put(`${API_BASE_URL}/api/appointments/${appointmentId}/end`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Appointment completed successfully');
      navigate('doctor/dashboard');
    } catch (error) {
      toast.error('Failed to end appointment');
      setIsEnding(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#ff5a5f] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading appointment details...</p>
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Appointment Consultation</h1>
                <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${appointment?.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'}`}>
                  {appointment?.status}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center mt-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <FiCalendar className="mr-2 text-[#ff5a5f]" />
                  <span>{formatDate(appointment?.appointmentDate)}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <FiUser className="mr-2 text-[#ff5a5f]" />
                  <span className="font-medium">{appointment?.patientName}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <span className="capitalize px-2 py-1 bg-gray-100 rounded-md text-sm">
                    {appointment?.type} consultation
                  </span>
                </div>
              </div>
            </div>
            
            {appointment?.type === 'video' && !showVideo && (
              <button
                onClick={() => setShowVideo(true)}
                className="bg-gradient-to-r from-[#ff5a5f] to-[#ff5a5f] hover:from-[#4a56e8] hover:to-[#7a4ae8] text-white px-6 py-3 rounded-lg transition-all flex items-center gap-2 shadow-lg mt-4 md:mt-0 hover:shadow-xl"
              >
                <FiVideo className="h-5 w-5" />
                Start Video Call
              </button>
            )}
          </div>

          {/* Video Call Section */}
          {appointment?.type === 'video' && showVideo && (
            <div className="mb-8 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-200">
              <div className="flex justify-between items-center bg-gradient-to-r from-[#ff5a5f] to-[#ff5a5f] px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <FiVideo className="mr-2" /> Live Video Consultation
                </h3>
                <button
                  onClick={() => setShowVideo(false)}
                  className="text-white hover:text-gray-200 flex items-center bg-black bg-opacity-20 rounded-full p-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <VideoCall appointmentId={appointmentId} role="doctor" />
              </div>
            </div>
          )}

          {/* Main Content Tabs */}
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'details' ? 'border-[#ff5a5f] text-[#ff5a5f]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <FiUser className="mr-2" /> Patient Details
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'history' ? 'border-[#ff5a5f] text-[#ff5a5f]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <FiFileText className="mr-2" /> Medical History
                </button>
                <button
                  onClick={() => setActiveTab('vitals')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'vitals' ? 'border-[#ff5a5f] text-[#ff5a5f]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <FiActivity className="mr-2" /> Vital Signs
                </button>
              </nav>
            </div>
          </div>

          {/* Patient Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Patient Information Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 lg:col-span-2">
                <div className="bg-gradient-to-r from-[#ff5a5f] to-[#ff5a5f] px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <FiUser className="mr-2" /> Patient Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                      <p className="text-lg font-medium">{appointment?.patientName}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Appointment Type</h3>
                      <p className="text-lg font-medium capitalize">{appointment?.type}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Reason for Visit</h3>
                      <p className="text-lg font-medium">{appointment?.reason || 'Not specified'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Duration</h3>
                      <p className="text-lg font-medium">30 minutes</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {appointment?.notes ? (
                        <p className="whitespace-pre-wrap">{appointment.notes}</p>
                      ) : (
                        <p className="text-gray-400 italic">No notes available for this appointment</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-[#ff5a5f] to-[#ff5a5f] px-6 py-4">
                  <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <button
                      onClick={handleCreatePrescription}
                      className="w-full bg-white hover:bg-gray-50 border border-[#ff5a5f] text-[#ff5a5f] px-4 py-3 rounded-lg flex items-center justify-between transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center">
                        <FiPlusCircle className="h-5 w-5 mr-3" />
                        <span>Create Prescription</span>
                      </div>
                      <FiChevronRight className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={handleEndAppointment}
                      disabled={isEnding}
                      className={`w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-between transition-all shadow-sm hover:shadow-md ${isEnding ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center">
                        <FiCheckCircle className="h-5 w-5 mr-3" />
                        <span>{isEnding ? 'Ending...' : 'Complete Appointment'}</span>
                      </div>
                      <FiChevronRight className="h-5 w-5" />
                    </button>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Appointment Summary</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Started at:</span>
                          <span>{formatDate(appointment?.startTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>25 minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="capitalize">{appointment?.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medical History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-8">
              <div className="bg-gradient-to-r from-[#ff5a5f] to-[#ff5a5f] px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <FiFileText className="mr-2" /> Medical History
                </h2>
              </div>
              <div className="p-6">
                {Array.isArray(patientHistory) && patientHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Treatment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {patientHistory.map((record) => (
                          <tr key={record.id || record._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {record.date ? new Date(record.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                }) : '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{record.diagnosis || '-'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs">
                                {record.prescription_text ? (
                                  <div className="flex items-center">
                                    <FiInfo className="mr-2 text-blue-500" />
                                    <span className="truncate">{record.prescription_text}</span>
                                  </div>
                                ) : '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {record.doctorName || 'Dr. Unknown'}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No medical history found</h3>
                    <p className="mt-1 text-sm text-gray-500">This patient doesn't have any recorded medical history yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vital Signs Tab */}
          {activeTab === 'vitals' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Blood Pressure Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-[#ff5a5f] to-[#ff5a5f] px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <FiActivity className="mr-2" /> Blood Pressure
                  </h2>
                </div>
                <div className="p-6">
                  {vitals?.bloodPressure ? (
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-800 mb-2">
                        {vitals.bloodPressure}
                      </div>
                      <div className="text-sm text-gray-500">mmHg</div>
                      <div className={`mt-4 text-sm font-medium ${parseInt(vitals.bloodPressure.split('/')[0]) > 140 ? 'text-red-500' : 'text-green-500'}`}>
                        {parseInt(vitals.bloodPressure.split('/')[0]) > 140 ? 'High' : 'Normal'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400">No data available</div>
                  )}
                </div>
              </div>

              {/* Heart Rate Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-[#ff5a5f] to-[#ff5a5f] px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <FiHeart className="mr-2" /> Heart Rate
                  </h2>
                </div>
                <div className="p-6">
                  {vitals?.heartRate ? (
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-800 mb-2">
                        {vitals.heartRate}
                      </div>
                      <div className="text-sm text-gray-500">bpm</div>
                      <div className={`mt-4 text-sm font-medium ${
                        vitals.heartRate > 100 ? 'text-red-500' : 
                        vitals.heartRate < 60 ? 'text-blue-500' : 'text-green-500'
                      }`}>
                        {vitals.heartRate > 100 ? 'High' : vitals.heartRate < 60 ? 'Low' : 'Normal'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400">No data available</div>
                  )}
                </div>
              </div>

              {/* Temperature Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-[#ff5a5f] to-[#ff5a5f] px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <FiThermometer className="mr-2" /> Temperature
                  </h2>
                </div>
                <div className="p-6">
                  {vitals?.temperature ? (
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-800 mb-2">
                        {vitals.temperature}
                      </div>
                      <div className="text-sm text-gray-500">°C</div>
                      <div className={`mt-4 text-sm font-medium ${
                        vitals.temperature > 37.5 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {vitals.temperature > 37.5 ? 'Fever' : 'Normal'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400">No data available</div>
                  )}
                </div>
              </div>

              {/* Oxygen Saturation Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-[#ff5a5f] to-[#ff5a5f] px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <FiDroplet className="mr-2" /> SpO₂
                  </h2>
                </div>
                <div className="p-6">
                  {vitals?.oxygenSaturation ? (
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-800 mb-2">
                        {vitals.oxygenSaturation}
                      </div>
                      <div className="text-sm text-gray-500">%</div>
                      <div className={`mt-4 text-sm font-medium ${
                        vitals.oxygenSaturation < 95 ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        {vitals.oxygenSaturation < 95 ? 'Low' : 'Normal'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400">No data available</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentLive;
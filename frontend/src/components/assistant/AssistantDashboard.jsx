import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiClock,
  FiLogOut,
  FiAlertCircle,
  FiLoader,
  FiActivity,
  FiPlus,
  FiList,
  FiXCircle,
  FiUserPlus,
  FiSearch
} from 'react-icons/fi';
import AssistantSidebar from './AssistantSidebar';
import { AppContext } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const AssistantDashboard = () => {
  const [assistant, setAssistant] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState({
    appointments: 0,
    patients: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // General error for dashboard
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const { setToken } = useContext(AppContext);

  // New Appointment Modal States
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    patientId: '',
    appointment_date: '',
    type: 'physical'
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createFormError, setCreateFormError] = useState(null); // Specific error for create form
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [cinSearch, setCinSearch] = useState('');
  const [cinSearching, setCinSearching] = useState(false);
  const [cinResult, setCinResult] = useState(null);
  const [newPatientForm, setNewPatientForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    age: '',
    cin: ''
  });
  const [newPatientLoading, setNewPatientLoading] = useState(false);
  const [newPatientError, setNewPatientError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('assistantToken');
        if (!token) throw new Error('Authentication required');

        // Get assistant profile
        const res = await axios.get(`${API_BASE_URL}/api/assistants/profile`, {
          headers: { 'assistant-token': token }
        });
        setAssistant(res.data);

        // Get doctor info if assigned
        if (res.data?.doctor_id) {
          const docRes = await axios.get(`${API_BASE_URL}/api/doctors/${res.data.doctor_id}`);
          setDoctor(docRes.data);
          
          // Try to get stats, but don't fail if endpoint doesn't exist
          try {
            const statsRes = await axios.get(`${API_BASE_URL}/api/assistants/stats`, {
              headers: { 'assistant-token': token }
            });
            setStats(statsRes.data);
          } catch (statsError) {
            console.log('Stats endpoint not available, using default values');
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
        setAssistant(null);
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch doctor's patients when create form is opened
  useEffect(() => {
    if (showNewAppointment && assistant?.doctor_id) {
      setPatientsLoading(true);
      const fetchPatients = async () => {
        try {
          const token = localStorage.getItem('assistantToken');
          const doctorId = assistant.doctor_id; // Use doctor_id from assistant state
          if (!token) throw new Error('No authentication token found');
          if (!doctorId) throw new Error('No doctor assigned to assistant');
          
          const res = await axios.get(`${API_BASE_URL}/api/patients/doctor/${doctorId}`, {
            headers: { 'assistant-token': token }
          });
          setPatients(res.data || []);
        } catch(err) {
          setPatients([]);
          setCreateFormError(err.message || 'Failed to load patients for appointment creation');
        } finally {
          setPatientsLoading(false);
        }
      };
      fetchPatients();
    }
  }, [showNewAppointment, assistant]); // Depend on assistant to ensure doctor_id is available

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateFormError(null);
    try {
      const token = localStorage.getItem('assistantToken');
      const doctorId = assistant?.doctor_id;
      if (!token) throw new Error('No authentication token found');
      if (!doctorId) throw new Error('No doctor assigned');
      if (!createForm.patientId) throw new Error('Please select a patient');

      await axios.post(
        `${API_BASE_URL}/api/appointments`,
        {
          doctor_id: doctorId,
          patient_id: createForm.patientId,
          appointment_date: createForm.appointment_date,
          type: createForm.type || 'General'
        },
        { headers: { 'assistant-token': token } }
      );
      setShowNewAppointment(false);
      setCreateForm({ patientId: '', appointment_date: '', type: 'physical' });
      // Optionally, refetch dashboard stats or appointments here if needed
      // For now, just show a success toast
      toast.success('Appointment created successfully!');
    } catch (err) {
      setCreateFormError(err.message || 'Failed to create appointment');
      toast.error(err.message || 'Failed to create appointment');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleShowNewPatient = () => {
    setShowNewPatient(true);
    setCinSearch('');
    setCinResult(null);
    setNewPatientForm({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      age: '',
      cin: ''
    });
    setNewPatientError('');
  };

  const handleCinSearch = async (e) => {
    e.preventDefault();
    setCinSearching(true);
    setCinResult(null);
    setNewPatientError('');
    try {
      const token = localStorage.getItem('assistantToken');
      if (!token) throw new Error('No authentication token found');

      const res = await axios.get(
        `${API_BASE_URL}/api/admin/patients?cin=${cinSearch}`,
        { headers: { Authorization: `Bearer ${token}` } } // Assuming admin endpoint uses Bearer token
      );
      // Find exact CIN match
      const exactMatch = res.data.find(patient => patient.cin === cinSearch);
      if (exactMatch) {
        setCinResult(exactMatch);
        setCreateForm(f => ({ ...f, patientId: exactMatch.id })); // Automatically select the found patient
        // Add the found patient to the patients list if not already there
        setPatients(prevPatients => {
          if (!prevPatients.some(p => p.id === exactMatch.id)) {
            return [...prevPatients, exactMatch];
          }
          return prevPatients;
        });
        setShowNewPatient(false); // Close the new patient section after finding and selecting
        toast.success('Patient found and selected.');
      } else {
        setCinResult(null);
        setNewPatientError('No patient found with this CIN');
        toast.error('No patient found with this CIN');
      }
    } catch(err) {
      setCinResult(null);
      setNewPatientError(err.message || 'Error searching CIN');
      toast.error(err.message || 'Error searching CIN');
    } finally {
      setCinSearching(false);
    }
  };

  const handleNewPatientFormChange = (e) => {
    const { name, value } = e.target;
    setNewPatientForm(f => ({ ...f, [name]: value }));
    setNewPatientError('');
  };

  const handleCreateNewPatient = async (e) => {
    e.preventDefault();
    setNewPatientLoading(true);
    setNewPatientError('');
    try {
      if (!newPatientForm.firstName || !newPatientForm.lastName || !newPatientForm.email) {
        setNewPatientError('First name, last name, and email are required');
        setNewPatientLoading(false);
        return;
      }
      if (parseInt(newPatientForm.age, 10) >= 16 && !newPatientForm.cin) {
        setNewPatientError('CIN is required for patients 16 or older');
        setNewPatientLoading(false);
        return;
      }
      const token = localStorage.getItem('assistantToken');
      if (!token) throw new Error('No authentication token found');

      const res = await axios.post(
        `${API_BASE_URL}/api/admin/patients`,
        {
          ...newPatientForm,
          password: '', // Assuming password is not needed or handled by backend
        },
        { headers: { Authorization: `Bearer ${token}` } } // Assuming admin endpoint uses Bearer token
      );
      setCreateForm(f => ({ ...f, patientId: res.data.id }));
      setShowNewPatient(false);
      setPatients(p => [...p, res.data]); // Add new patient to the list for selection
      toast.success('Patient created successfully!');
    } catch (err) {
      setNewPatientError(err.response?.data?.message || 'Error creating patient');
      toast.error(err.response?.data?.message || 'Error creating patient');
    } finally {
      setNewPatientLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FiLoader className="animate-spin h-12 w-12 text-[#ff5a5f]" />
      </div>
    );
  }

  if (error || !assistant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to load dashboard</h2>
          <p className="text-gray-600 mb-6">{error || 'Authentication required'}</p>
          <a 
            href="/assistant/login" 
            className="inline-block bg-[#ff5a5f] hover:bg-[#e04a50] text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AssistantSidebar activeTab="dashboard" />
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Assistant Dashboard</h1>
            <div className="text-sm text-gray-500 flex items-center">
              <FiClock className="mr-2" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Stats Cards - Only show if doctor is assigned */}
          {doctor && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Today's Appointments</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.appointments}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FiCalendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Patients</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.patients}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <FiUser className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Pending Actions</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pending}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <FiAlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-[#ff5a5f] p-4 text-white">
                <h2 className="text-xl font-semibold flex items-center">
                  <FiUser className="mr-2" /> Your Profile
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-200 rounded-full p-4">
                    <FiUser className="h-8 w-8 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {assistant.firstName} {assistant.lastName}
                    </h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <FiMail className="mr-2" /> {assistant.email}
                    </div>
                    {assistant.phoneNumber && (
                      <div className="flex items-center text-gray-600 mt-1">
                        <FiPhone className="mr-2" /> {assistant.phoneNumber}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Section - Only show if doctor is assigned */}
            {doctor && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-[#1c2541] p-4 text-white">
                  <h2 className="text-xl font-semibold flex items-center">
                    <FiActivity className="mr-2" /> Assigned Doctor
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-200 rounded-full p-4">
                      <FiUser className="h-8 w-8 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                      <div className="flex items-center text-gray-600 mt-1">
                        <FiMail className="mr-2" /> {doctor.email}
                      </div>
                      {doctor.phoneNumber && (
                        <div className="flex items-center text-gray-600 mt-1">
                          <FiPhone className="mr-2" /> {doctor.phoneNumber}
                        </div>
                      )}
                      {doctor.specialization && (
                        <div className="mt-2">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {doctor.specialization}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg transition-colors flex flex-col items-center"
                onClick={() => setShowNewAppointment(true)}
              >
                <FiCalendar className="h-6 w-6 mb-2" />
                <span>New Appointment</span>
              </button>
              <button className="bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg transition-colors flex flex-col items-center">
                <FiUser className="h-6 w-6 mb-2" />
                <span>Add Patient</span>
              </button>
              <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg transition-colors flex flex-col items-center">
                <FiList className="h-6 w-6 mb-2" />
                <span>View Schedule</span>
              </button>
              <button 
                className="bg-red-50 hover:bg-red-100 text-red-700 p-4 rounded-lg transition-colors flex flex-col items-center"
                onClick={() => {
                  localStorage.removeItem('assistantToken');
                  localStorage.removeItem('assistant');
                  if (setToken) setToken(null);
                  window.location.href = '/assistant/login';
                }}
              >
                <FiLogOut className="h-6 w-6 mb-2" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
        {/* New Appointment Modal */}
        <AnimatePresence>
            {showNewAppointment && (              
              <motion.div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4 overflow-y-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full ${
                    showNewPatient ? 'max-w-2xl' : 'max-w-md'
                  } max-h-[90vh] overflow-y-auto`}
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Create New Appointment</h2>
                    <button
                      onClick={() => setShowNewAppointment(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiXCircle size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateAppointment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                      <div className="flex gap-2">
                        <select
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                          value={createForm.patientId || ''}
                          onChange={e => setCreateForm({ ...createForm, patientId: e.target.value })}
                          required
                          disabled={patientsLoading || showNewPatient}
                        >
                          <option value="">Select patient...</option>
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.firstName || ''} {p.lastName || ''} 
                              {p.cin ? ` (CIN: ${p.cin})` : ''}
                              {p.email ? ` (${p.email})` : ''}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="ml-2 px-3 py-2 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 flex items-center"
                          onClick={handleShowNewPatient}
                          title="Add new patient"
                          disabled={showNewPatient}
                        >
                          <FiUserPlus />
                        </button>
                      </div>
                      {patientsLoading && (
                        <div className="text-xs text-gray-400 mt-1">Loading patients...</div>
                      )}
                    </div>

                    {/* Inline New Patient Section */}
                    {showNewPatient && (                      
                      <div className="mt-6 border-t pt-4 mb-6">
                        <h3 className="text-lg font-bold mb-2 flex items-center">
                          <FiUserPlus className="mr-2" /> Add New Patient
                        </h3>
                        {/* Step 1: Search by CIN */}
                        <div className="flex flex-col sm:flex-row gap-2 mb-3 items-center">
                          <input
                            type="text"
                            placeholder="Enter CIN (if 16+)"
                            className="border border-gray-300 rounded-md px-3 py-2 flex-1"
                            value={cinSearch}
                            onChange={e => setCinSearch(e.target.value)}
                          />
                          <button
                            type="button"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center justify-center"
                            disabled={cinSearching || !cinSearch}
                            onClick={handleCinSearch}
                          >
                            {cinSearching ? <FiLoader className="animate-spin" /> : <FiSearch />}
                          </button>
                          <button 
                            type="button"
                            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                            onClick={() => {setShowNewPatient(false); setCinResult(null); setNewPatientForm({firstName: '', lastName: '', email: '', phoneNumber: '', age: '', cin: ''}); setNewPatientError('');}}
                            disabled={newPatientLoading}
                          >
                            Cancel
                          </button>
                        </div>
                        {cinSearching && <div className="text-xs text-gray-400 mb-2">Searching...</div>}
                        {newPatientError && (
                          <div className="text-xs text-red-600 mt-2">{newPatientError}</div>
                        )}
                        {cinResult && (
                          <div className="mb-3 p-2 bg-green-50 rounded text-green-700 flex items-center justify-between">
                            <span>Patient found: {cinResult.firstName} {cinResult.lastName} ({cinResult.email})</span>
                          </div>
                        )}
                        {/* Step 2: If not found, show create form */}
                        {!cinResult && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              name="firstName"
                              placeholder="First Name"
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                              value={newPatientForm.firstName}
                              onChange={handleNewPatientFormChange}
                              required
                            />
                            <input
                              type="text"
                              name="lastName"
                              placeholder="Last Name"
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                              value={newPatientForm.lastName}
                              onChange={handleNewPatientFormChange}
                              required
                            />
                            <input
                              type="email"
                              name="email"
                              placeholder="Email"
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                              value={newPatientForm.email}
                              onChange={handleNewPatientFormChange}
                              required
                            />
                            <input
                              type="text"
                              name="phoneNumber"
                              placeholder="Phone Number"
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                              value={newPatientForm.phoneNumber}
                              onChange={handleNewPatientFormChange}
                            />
                            <input
                              type="number"
                              name="age"
                              placeholder="Age"
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                              value={newPatientForm.age}
                              onChange={handleNewPatientFormChange}
                              required
                              min={0}
                            />
                            {/* CIN required if age >= 16 */}
                            <input
                              type="text"
                              name="cin"
                              placeholder="CIN (required if 16+)"
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                              value={newPatientForm.cin}
                              onChange={handleNewPatientFormChange}
                              required={parseInt(newPatientForm.age, 10) >= 16}
                            />
                          </div>
                        )}
                        <div className="flex justify-end pt-3"> 
                          <button
                            type="button"
                            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                            disabled={newPatientLoading}
                            onClick={handleCreateNewPatient}
                          >
                            {newPatientLoading ? 'Creating...' : 'Create Patient'}
                          </button>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                      <input
                        type="datetime-local"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={createForm.appointment_date}
                        onChange={e => setCreateForm({ ...createForm, appointment_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={createForm.type}
                        onChange={e => setCreateForm({ ...createForm, type: e.target.value })}
                        required
                      >
                        <option value="physical">Physical</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                      <motion.button
                        type="button"
                        className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowNewAppointment(false)}
                        disabled={createLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                        disabled={createLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {createLoading ? (
                          <span className="flex items-center">
                            <FiLoader className="animate-spin mr-2" />
                            Creating...
                          </span>
                        ) : 'Create Appointment'}
                      </motion.button>
                    </div>
                  </form>
                  {createFormError && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                      {createFormError}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>
    </div>
  );
};

export default AssistantDashboard;
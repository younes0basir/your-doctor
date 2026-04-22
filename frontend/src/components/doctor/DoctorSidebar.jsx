import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  FiHome,
  FiCalendar,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiList,
  FiUser,
  FiPlusCircle,
  FiActivity,
  FiXCircle,
  FiLoader,
  FiUserPlus,
  FiSearch
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    patientId: '',
    appointment_date: '',
    type: 'physical'
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState(null);
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
  const [currentDoctorId, setCurrentDoctorId] = useState(localStorage.getItem('doctor'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('doctor');
    toast.success('Logged out successfully');
    navigate('/portal');
  };

  // Fetch patients when create form is opened, and ensure doctorId is set
  useEffect(() => {
    if (showNewAppointment) {
      const fetchPatientsForDoctor = async () => {
        setPatientsLoading(true);
        setError(null);
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No authentication token found');

          let doctorIdToUse = currentDoctorId; // Use state for doctor ID

          // If doctorId is not in state (e.g., first load or refresh), try fetching from profile
          if (!doctorIdToUse) {
            const profileRes = await axios.get(`${API_BASE_URL}/api/doctors/profile`, {
              headers: { 'doctor-token': token }
            });
            doctorIdToUse = profileRes.data?.id; // Assuming doctor ID is 'id'
            if (!doctorIdToUse) throw new Error('No doctor ID found in profile');
            setCurrentDoctorId(doctorIdToUse); // Update state if fetched
          }

          // Fetch patients assigned to this doctor
          const res = await axios.get(`${API_BASE_URL}/api/patients/doctor/${doctorIdToUse}`, {
            headers: { 'doctor-token': token }
          });
          setPatients(res.data || []);
        } catch (err) {
          console.error("Failed to fetch doctor profile or patients:", err);
          setError(err.message || 'Failed to load patients.');
          setPatients([]);
        } finally {
          setPatientsLoading(false);
        }
      };
      fetchPatientsForDoctor();
    }
  }, [showNewAppointment, currentDoctorId]); // Depend on currentDoctorId to re-run if it changes

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      if (!currentDoctorId) throw new Error('Doctor ID not loaded. Please try again.');
      if (!createForm.patientId) throw new Error('Please select a patient');

      await axios.post(
        `${API_BASE_URL}/api/appointments`,
        {
          doctor_id: currentDoctorId,
          patient_id: createForm.patientId,
          appointment_date: createForm.appointment_date,
          type: createForm.type || 'General'
        },
        { headers: { 'doctor-token': token } }
      );
      setShowNewAppointment(false);
      setCreateForm({ patientId: '', appointment_date: '', type: 'physical' });
      toast.success('Appointment created successfully');
    } catch (err) {
      setError(err.message || 'Failed to create appointment');
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
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/patients?cin=${cinSearch}`,
        { headers: { Authorization: `Bearer ${token}` } } // Assuming admin endpoint uses Bearer token
      );
      const exactMatch = res.data.find(patient => patient.cin === cinSearch);
      if (exactMatch) {
        setCinResult(exactMatch);
        setCreateForm(f => ({ ...f, patientId: exactMatch.id }));
        setPatients(prevPatients => {
          if (!prevPatients.some(p => p.id === exactMatch.id)) {
            return [...prevPatients, exactMatch];
          }
          return prevPatients;
        });
        setShowNewPatient(false);
        toast.success('Patient found and selected.');
      } else {
        setCinResult(null);
        setNewPatientError('No patient found with this CIN');
        toast.error('No patient found with this CIN');
      }
    } catch (err) {
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
      const token = localStorage.getItem('token');
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
      setPatients(p => [...p, res.data]);
      toast.success('Patient created successfully');
    } catch (err) {
      setNewPatientError(err.response?.data?.message || 'Error creating patient');
      toast.error(err.response?.data?.message || 'Error creating patient');
    } finally {
      setNewPatientLoading(false);
    }
  };

  const menuItems = [
    {
      path: '/doctor/dashboard',
      name: 'Dashboard',
      icon: <FiActivity className="w-5 h-5" />,
      active: location.pathname === '/doctor/dashboard'
    },
    {
      path: '/doctor/appointments',
      name: 'Appointments',
      icon: <FiCalendar className="w-5 h-5" />,
      active: location.pathname === '/doctor/appointments'
    },
    {
      path: '/doctor/office-queue',
      name: 'Patient Queue',
      icon: <FiList className="w-5 h-5" />,
      active: location.pathname === '/doctor/office-queue'
    },
    {
      path: '/doctor/patients',
      name: 'Patients',
      icon: <FiUsers className="w-5 h-5" />,
      active: location.pathname === '/doctor/patients'
    },
    {
      path: '/doctor/assistants',
      name: 'Manage Assistant',
      icon: <FiUser className="w-5 h-5" />,
      active: location.pathname === '/doctor/assistants'
    },
    {
      path: '/doctor/settings',
      name: 'Settings',
      icon: <FiSettings className="w-5 h-5" />,
      active: location.pathname === '/doctor/settings'
    }
  ];

  return (
    <div 
      className="w-64 h-screen flex flex-col"
      style={{ 
        backgroundColor: '#ff5a5f',
        backgroundImage: 'linear-gradient(to bottom, #ff5a5f, #ff4248)'
      }}
    >
      {/* Header */}
      <div className="p-6 border-b border-red-300/30">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/90 rounded-lg shadow-sm">
            <FiUser className="h-6 w-6 text-[#ff5a5f]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">MediCarePro</h2>
            <p className="text-xs text-white/80">Doctor Portal</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 mx-2 ${
              item.active 
                ? 'bg-white/90 text-[#ff5a5f] font-medium shadow-sm'
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className={`mr-3 ${
              item.active ? 'text-[#ff5a5f]' : 'text-white/80'
            }`}>
              {item.icon}
            </span>
            <span className="text-sm">{item.name}</span>
            {item.active && (
              <span className="ml-auto h-2 w-2 rounded-full bg-[#ff5a5f]"></span>
            )}
          </Link>
        ))}

        {/* Quick Action */}
        <button 
          className="mx-2 mt-6 flex items-center justify-center px-4 py-2 bg-white/90 text-[#ff5a5f] rounded-lg shadow-sm hover:bg-white transition-colors text-sm font-medium"
          onClick={() => setShowNewAppointment(true)}
        >
          <FiPlusCircle className="mr-2" />
          New Appointment
        </button>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-red-300/30">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-white/90 hover:bg-white/10 rounded-lg transition-colors group"
        >
          <FiLogOut className="mr-3 text-white/80 group-hover:text-white" />
          <span className="text-sm">Logout</span>
          <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </span>
        </button>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-[#e04a50] text-white/80 text-xs flex justify-between">
        <span>Connected</span>
        <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  {error}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorSidebar;




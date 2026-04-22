import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiXCircle,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiPlus,
  FiDollarSign,
  FiLoader,
  FiChevronDown,
  FiChevronUp,
  FiUserPlus // <-- add this import
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../config/api';
import AssistantSidebar from './AssistantSidebar';

const AssistantAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusLoading, setPaymentStatusLoading] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    patientId: '',
    appointment_date: '',
    type: 'physical'
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    appointment_date: '',
    type: 'physical'
  });
  const [editLoading, setEditLoading] = useState(false);
  const [expandedAppointment, setExpandedAppointment] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
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
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('assistantToken');
        if (!token) throw new Error('No authentication token found');
        
        const profileRes = await axios.get(`${API_BASE_URL}/api/assistants/profile`, {
          headers: { 'assistant-token': token }
        });
        
        const doctorId = profileRes.data?.doctor_id;
        if (!doctorId) throw new Error('No doctor assigned');
        
        const res = await axios.get(`${API_BASE_URL}/api/doctors/${doctorId}/appointments`, {
          headers: { 'doctor-token': token }
        });

        let appointmentsWithEmail = res.data;
        if (appointmentsWithEmail.length > 0 && !appointmentsWithEmail[0].email) {
          const patientsRes = await axios.get(`${API_BASE_URL}/api/admin/patients`);
          const patientsMap = {};
          (patientsRes.data || []).forEach(p => {
            patientsMap[p.id] = p.email;
          });
          appointmentsWithEmail = appointmentsWithEmail.map(appt => ({
            ...appt,
            email: patientsMap[appt.patient_id] || ''
          }));
        }

        setAppointments(appointmentsWithEmail || []);
        setFilteredAppointments(appointmentsWithEmail || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch appointments');
        setAppointments([]);
        setFilteredAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  useEffect(() => {
    let filtered = [...appointments];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(appt => {
        const patientName = `${appt.firstName || ''} ${appt.lastName || ''}`.toLowerCase();
        const type = appt.type ? appt.type.toLowerCase() : '';
        const status = appt.status ? appt.status.toLowerCase() : '';
        const email = appt.email ? appt.email.toLowerCase() : '';
        
        return (
          patientName.includes(searchTerm.toLowerCase()) ||
          type.includes(searchTerm.toLowerCase()) ||
          status.includes(searchTerm.toLowerCase()) ||
          email.includes(searchTerm.toLowerCase())
        );
      });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appt => 
        appt.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(appt => 
        appt.type?.toLowerCase() === typeFilter.toLowerCase()
      );
    }
    
    setFilteredAppointments(filtered);
  }, [searchTerm, appointments, statusFilter, typeFilter]);

  const getStatusIcon = (status) => {
    if (!status) return <FiAlertCircle className="text-yellow-500 mr-1" />;
    
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <FiCheckCircle className="text-green-500 mr-1" />;
      case 'cancelled':
      case 'canceled':
        return <FiXCircle className="text-red-500 mr-1" />;
      default:
        return <FiAlertCircle className="text-yellow-500 mr-1" />;
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('assistantToken');
      let endpoint;
      if (newStatus === 'confirmed') {
        endpoint = `${API_BASE_URL}/api/appointments/${appointmentId}/confirm`;
      } else if (newStatus === 'canceled' || newStatus === 'cancelled') {
        endpoint = `${API_BASE_URL}/api/appointments/${appointmentId}/cancel`;
      } else {
        return;
      }
      await axios.put(endpoint, {}, {
        headers: { 'assistant-token': token }
      });
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      alert('Failed to update appointment status');
    }
  };

  const handlePaymentStatusChange = async (appointment, newStatus) => {
    setPaymentStatusLoading(prev => ({ ...prev, [appointment.id]: true }));
    try {
      const token = localStorage.getItem('assistantToken');
      await axios.put(
        `${API_BASE_URL}/api/appointments/${appointment.id}/payment-status`,
        { payment_status: newStatus },
        { headers: { 'assistant-token': token } }
      );
      setAppointments(appts =>
        appts.map(a =>
          a.id === appointment.id ? { ...a, payment_status: newStatus } : a
        )
      );
    } catch {
      alert('Failed to update payment status');
    } finally {
      setPaymentStatusLoading(prev => ({ ...prev, [appointment.id]: false }));
    }
  };

  // Fetch only doctor's patients when create form is opened
  useEffect(() => {
    if (showCreateForm) {
      setPatientsLoading(true);
      const fetchPatients = async () => {
        try {
          const token = localStorage.getItem('assistantToken');
          // Get doctorId from assistant profile
          const profileRes = await axios.get(`${API_BASE_URL}/api/assistants/profile`, {
            headers: { 'assistant-token': token }
          });
          const doctorId = profileRes.data?.doctor_id;
          if (!doctorId) throw new Error('No doctor assigned');
          // Fetch only patients assigned to this doctor
          const res = await axios.get(`${API_BASE_URL}/api/patients/doctor/${doctorId}`, {
            headers: { 'assistant-token': token }
          });
          setPatients(res.data || []);
        } catch {
          setPatients([]);
        } finally {
          setPatientsLoading(false);
        }
      };
      fetchPatients();
    }
  }, [showCreateForm]);

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('assistantToken');
      // Get doctorId from assistant profile
      const profileRes = await axios.get(`${API_BASE_URL}/api/assistants/profile`, {
        headers: { 'assistant-token': token }
      });
      const doctorId = profileRes.data?.doctor_id;
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
      setShowCreateForm(false);
      setCreateForm({ patientId: '', appointment_date: '', type: 'physical' });
      // Refresh appointments
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/doctors/${doctorId}/appointments`, {
        headers: { 'doctor-token': token }
      });
      setAppointments(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to create appointment');
    } finally {
      setCreateLoading(false);
      setLoading(false);
    }
  };

  const handleEditClick = (appt) => {
    setEditForm({
      id: appt.id,
      appointment_date: appt.appointment_date ? appt.appointment_date.slice(0, 16) : '',
      type: appt.type || 'physical'
    });
    setShowEditForm(true);
  };

  const handleEditAppointment = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('assistantToken');
      // Get doctorId from assistant profile
      const profileRes = await axios.get(`${API_BASE_URL}/api/assistants/profile`, {
        headers: { 'assistant-token': token }
      });
      const doctorId = profileRes.data?.doctor_id;
      if (!doctorId) throw new Error('No doctor assigned');

      // Find appointment to get patient_id
      const appt = appointments.find(a => a.id === editForm.id);
      if (!appt) throw new Error('Appointment not found');

      // Update appointment
      await axios.put(
        `${API_BASE_URL}/api/appointments/${editForm.id}`,
        {
          doctor_id: doctorId,
          patient_id: appt.patient_id,
          appointment_date: editForm.appointment_date,
          type: editForm.type,
          status: appt.status
        },
        { headers: { 'assistant-token': token } }
      );
      setShowEditForm(false);
      setEditForm({ id: null, appointment_date: '', type: 'physical' });
      // Refresh appointments
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/doctors/${doctorId}/appointments`, {
        headers: { 'doctor-token': token }
      });
      setAppointments(res.data || []);
      setFilteredAppointments(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to update appointment');
    } finally {
      setEditLoading(false);
      setLoading(false);
    }
  };

  const toggleExpandAppointment = (id) => {
    setExpandedAppointment(expandedAppointment === id ? null : id);
  };

  // --- New Patient Logic ---
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
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/patients?cin=${cinSearch}`,
        { headers: { Authorization: `Bearer ${token}` } }
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
      } else {
        setCinResult(null);
        setNewPatientError('No patient found with this CIN');
      }
    } catch {
      setCinResult(null);
      setNewPatientError('Error searching CIN');
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
      const res = await axios.post(
        `${API_BASE_URL}/api/admin/patients`,
        {
          ...newPatientForm,
          password: '',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreateForm(f => ({ ...f, patientId: res.data.id }));
      setShowNewPatient(false);
      setPatients(p => [...p, res.data]);
    } catch (err) {
      setNewPatientError(err.response?.data?.message || 'Error creating patient');
    } finally {
      setNewPatientLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AssistantSidebar activeTab="appointments" />
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Appointment Management</h1>
              <p className="text-gray-600 mt-1">View and manage all appointments</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search appointments..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <motion.button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center justify-center whitespace-nowrap"
                onClick={() => setShowCreateForm(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiPlus className="mr-2" />
                New Appointment
              </motion.button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center">
              <label htmlFor="status-filter" className="mr-2 text-sm text-gray-700">Status:</label>
              <select
                id="status-filter"
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <label htmlFor="type-filter" className="mr-2 text-sm text-gray-700">Type:</label>
              <select
                id="type-filter"
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="physical">Physical</option>
                <option value="video">Video</option>
              </select>
            </div>
          </div>

          {/* Create Appointment Modal */}
          <AnimatePresence>
            {showCreateForm && (
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
                      onClick={() => setShowCreateForm(false)}
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
                        onClick={() => setShowCreateForm(false)}
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

          {/* Edit Appointment Modal */}
          <AnimatePresence>
            {showEditForm && (
              <motion.div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                >
                  <h2 className="text-xl font-bold mb-4">Edit Appointment</h2>
                  <form onSubmit={handleEditAppointment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                      <input
                        type="datetime-local"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={editForm.appointment_date}
                        onChange={e => setEditForm({ ...editForm, appointment_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={editForm.type}
                        onChange={e => setEditForm({ ...editForm, type: e.target.value })}
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
                        onClick={() => setShowEditForm(false)}
                        disabled={editLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                        disabled={editLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {editLoading ? (
                          <span className="flex items-center">
                            <FiLoader className="animate-spin mr-2" />
                            Saving...
                          </span>
                        ) : 'Save Changes'}
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

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FiLoader className="h-12 w-12 text-indigo-600" />
              </motion.div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiAlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <motion.div 
              className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'No matching appointments found' 
                  : 'No appointments scheduled'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating a new appointment'}
              </p>
              <div className="mt-6">
                <motion.button 
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                  onClick={() => setShowCreateForm(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                  New Appointment
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="bg-white shadow overflow-hidden rounded-lg border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="overflow-x-auto">
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
                        Payment
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.map((appt) => (
                      <React.Fragment key={appt.id}>
                        <tr 
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => toggleExpandAppointment(appt.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <FiUser className="h-5 w-5 text-gray-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {appt.firstName || 'Unknown'} {appt.lastName || ''}
                                </div>
                                <div className="text-sm text-gray-500">{appt.email || 'No email'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {appt.appointment_date ? new Date(appt.appointment_date).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <FiClock className="mr-1" />
                              {appt.appointment_date ? new Date(appt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              appt.type === 'video' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {appt.type || 'General'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(appt.status)}
                              <span className="text-sm text-gray-900 capitalize">{appt.status || 'Pending'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              appt.payment_status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              <FiDollarSign className="mr-1" />
                              {appt.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end items-center">
                              {expandedAppointment === appt.id ? (
                                <FiChevronUp className="text-gray-400" />
                              ) : (
                                <FiChevronDown className="text-gray-400" />
                              )}
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded row */}
                        <AnimatePresence>
                          {expandedAppointment === appt.id && (
                            <motion.tr 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="bg-gray-50"
                            >
                              <td colSpan="6" className="px-6 py-4">
                                <div className="flex flex-wrap gap-4 justify-between items-center">
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-900">Appointment Details</h4>
                                    <div className="text-sm text-gray-500">
                                      <p>Created: {appt.created_at ? new Date(appt.created_at).toLocaleString() : 'N/A'}</p>
                                      {appt.notes && <p>Notes: {appt.notes}</p>}
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-2">
                                    <motion.button
                                      className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                      onClick={() => handleEditClick(appt)}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <FiEdit2 className="mr-1" /> Edit
                                    </motion.button>
                                    
                                    <motion.button
                                      className={`px-3 py-1 border rounded-md text-sm flex items-center ${
                                        appt.payment_status === 'paid'
                                          ? 'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                                          : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                                      }`}
                                      disabled={paymentStatusLoading[appt.id]}
                                      onClick={() =>
                                        handlePaymentStatusChange(
                                          appt,
                                          appt.payment_status === 'paid' ? 'unpaid' : 'paid'
                                        )
                                      }
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      {paymentStatusLoading[appt.id] ? (
                                        <FiLoader className="animate-spin mr-1" />
                                      ) : (
                                        <FiDollarSign className="mr-1" />
                                      )}
                                      {appt.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                                    </motion.button>
                                    
                                    {appt.status === 'pending' && (
                                      <>
                                        <motion.button
                                          className="px-3 py-1 border border-green-300 rounded-md text-sm text-green-700 bg-green-50 hover:bg-green-100 flex items-center"
                                          title="Confirm appointment"
                                          onClick={() => handleStatusChange(appt.id, 'confirmed')}
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          <FiCheckCircle className="mr-1" /> Confirm
                                        </motion.button>
                                        <motion.button
                                          className="px-3 py-1 border border-red-300 rounded-md text-sm text-red-700 bg-red-50 hover:bg-red-100 flex items-center"
                                          title="Cancel appointment"
                                          onClick={() => handleStatusChange(appt.id, 'canceled')}
                                          disabled={appt.status === 'canceled' || appt.status === 'completed'}
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          <FiXCircle className="mr-1" /> Cancel
                                        </motion.button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistantAppointments;



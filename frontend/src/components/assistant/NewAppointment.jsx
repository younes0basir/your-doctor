import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiLoader, FiUserPlus, FiSearch } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const NewAppointment = ({ onClose }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patientId: '',
    appointment_date: '',
    type: 'physical'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);

  // New patient modal state
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
    // Fetch only doctor's patients
    const fetchPatients = async () => {
      setPatientsLoading(true);
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
  }, []);

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
      if (res.data && res.data.length > 0) {
        setCinResult(res.data[0]);
      } else {
        setCinResult(null);
      }
    } catch {
      setCinResult(null);
      setNewPatientError('Error searching CIN');
    } finally {
      setCinSearching(false);
    }
  };

  const handleSelectExistingPatient = () => {
    setForm(f => ({ ...f, patientId: cinResult.id }));
    setShowNewPatient(false);
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
      // Age/CIN logic: CIN required if age >= 16
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
      // Create patient (no password, admin will handle)
      const token = localStorage.getItem('assistantToken');
      const res = await axios.post(
        `${API_BASE_URL}/api/admin/patients`,
        {
          ...newPatientForm,
          password: '', // or null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // After creation, select this patient
      setForm(f => ({ ...f, patientId: res.data.id }));
      setShowNewPatient(false);
      // Optionally, refresh patient list
      setPatients(p => [...p, res.data]);
    } catch (err) {
      setNewPatientError(err.response?.data?.message || 'Error creating patient');
    } finally {
      setNewPatientLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('assistantToken');
      // Get doctorId from assistant profile
      const profileRes = await axios.get(`${API_BASE_URL}/api/assistants/profile`, {
        headers: { 'assistant-token': token }
      });
      const doctorId = profileRes.data?.doctor_id;
      if (!doctorId) throw new Error('No doctor assigned');
      if (!form.patientId) throw new Error('Please select a patient');

      await axios.post(
        `${API_BASE_URL}/api/appointments`,
        {
          doctor_id: doctorId,
          patient_id: form.patientId,
          appointment_date: form.appointment_date,
          type: form.type || 'General'
        },
        { headers: { 'assistant-token': token } }
      );
      if (onClose) {
        onClose();
      } else {
        navigate(-1);
      }
    } catch (e) {
      setError(e.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className={`bg-white rounded-xl shadow-lg p-6 w-full ${showNewPatient ? 'max-w-2xl' : 'max-w-md'}`}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          <h2 className="text-xl font-bold mb-4">Create New Appointment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
              <div className="flex gap-2">
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={form.patientId}
                  onChange={e => setForm({ ...form, patientId: e.target.value })}
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
                  className="ml-2 px-2 py-2 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 flex items-center"
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
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-bold mb-2 flex items-center">
                  <FiUserPlus className="mr-2" /> Add New Patient
                </h3>
                {/* Step 1: Search by CIN */}
                <form onSubmit={handleCinSearch} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Enter CIN (if 16+)"
                    className="border border-gray-300 rounded-md px-3 py-2 flex-1"
                    value={cinSearch}
                    onChange={e => setCinSearch(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md flex items-center"
                    disabled={cinSearching || !cinSearch}
                  >
                    <FiSearch />
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md ml-2"
                    onClick={() => setShowNewPatient(false)}
                    disabled={newPatientLoading}
                  >
                    Cancel
                  </button>
                </form>
                {cinSearching && <div className="text-xs text-gray-400 mb-2">Searching...</div>}
                {cinResult && (
                  <div className="mb-3 p-2 bg-green-50 rounded text-green-700">
                    Patient found: {cinResult.firstName} {cinResult.lastName} ({cinResult.email})
                    <button
                      className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded text-xs"
                      onClick={handleSelectExistingPatient}
                    >
                      Select
                    </button>
                  </div>
                )}
                {/* Step 2: If not found, show create form */}
                {!cinResult && (
                  <form onSubmit={handleCreateNewPatient} className="space-y-2">
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
                    {newPatientError && (
                      <div className="text-xs text-red-600">{newPatientError}</div>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                        disabled={newPatientLoading}
                      >
                        {newPatientLoading ? 'Creating...' : 'Create Patient'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={form.appointment_date}
                onChange={e => setForm({ ...form, appointment_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
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
                onClick={handleClose}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
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
    </AnimatePresence>
  );
};

export default NewAppointment;

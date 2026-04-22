// DELETE THIS FILE after migration to admin folder

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTachometerAlt, FaUsers, FaCalendarAlt, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminDashboardSection from './AdminDashboardSection';
import AdminAccountsSection from './AdminAccountsSection';
import AdminAppointmentsSection from './AdminAppointmentsSection';
import { API_BASE_URL } from '../config/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [overview, setOverview] = useState({ users: 0, doctors: 0, appointments: 0 });
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [showApptConfirm, setShowApptConfirm] = useState(false);
  const [deleteApptId, setDeleteApptId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAppt, setEditAppt] = useState(null);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [financial, setFinancial] = useState(null);

  useEffect(() => {
    if (activeMenu === 'dashboard') {
      setOverviewLoading(true);
      axios.get(`${API_BASE_URL}/api/admin/overview`)
        .then(res => {
          setOverview(res.data);
        })
        .catch(() => setOverview({ users: 0, doctors: 0, appointments: 0 }))
        .finally(() => setOverviewLoading(false));
      axios.get(`${API_BASE_URL}/api/admin/financial-analytics`)
        .then(res => setFinancial(res.data))
        .catch(() => setFinancial(null));
      // Always fetch accounts for dashboard stats
      axios.get(`${API_BASE_URL}/api/admin/accounts`)
        .then(res => setAccounts(res.data))
        .catch(() => setAccounts([]));
    } else if (activeMenu === 'accounts') {
      setAccountsLoading(true);
      axios.get(`${API_BASE_URL}/api/admin/accounts`)
        .then(res => setAccounts(res.data))
        .catch(() => setAccounts([]))
        .finally(() => setAccountsLoading(false));
    } else if (activeMenu === 'appointments') {
      setAppointmentsLoading(true);
      axios.get(`${API_BASE_URL}/api/admin/appointments`)
        .then(res => setAppointments(res.data))
        .catch(() => setAppointments([]))
        .finally(() => setAppointmentsLoading(false));
    }
  }, [activeMenu]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-login');
  };

  const handleDelete = (type, id) => {
    setDeleteTarget({ type, id });
    setShowConfirm(true);
  };

  const handleApproveDoctor = async (doctorId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/admin/doctors/${doctorId}/approve`);
      setAccounts(accounts => accounts.map(acc => 
        acc.type === 'doctor' && acc.id === doctorId ? { ...acc, status: 'approved' } : acc
      ));
      toast.success('Doctor approved successfully');
    } catch (err) {
      toast.error('Error approving doctor');
    }
  };

  const handleHideDoctor = async (doctorId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/admin/doctors/${doctorId}/hide`);
      setAccounts(accounts => accounts.map(acc => 
        acc.type === 'doctor' && acc.id === doctorId ? { ...acc, status: 'hidden' } : acc
      ));
      toast.success('Doctor hidden successfully');
    } catch (err) {
      toast.error('Error hiding doctor');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/accounts/${deleteTarget.type}/${deleteTarget.id}`);
      setAccounts(accounts => accounts.filter(acc => !(acc.type === deleteTarget.type && acc.id === deleteTarget.id)));
      toast.success('Account deleted successfully');
    } catch (err) {
      toast.error('Error deleting account');
    } finally {
      setShowConfirm(false);
      setDeleteTarget(null);
    }
  };

  const handleDeleteAppointment = (id) => {
    setDeleteApptId(id);
    setShowApptConfirm(true);
  };

  const confirmDeleteAppointment = async () => {
    if (!deleteApptId) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/appointments/${deleteApptId}`);
      setAppointments(appts => appts.filter(appt => appt.id !== deleteApptId));
      toast.success('Appointment deleted successfully');
    } catch (err) {
      toast.error('Error deleting appointment');
    } finally {
      setShowApptConfirm(false);
      setDeleteApptId(null);
    }
  };

  const fetchDoctorPatientOptions = async () => {
    const [doctorsRes, patientsRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/admin/doctors`),
      axios.get(`${API_BASE_URL}/api/admin/patients`)
    ]);
    setDoctorOptions(doctorsRes.data);
    setPatientOptions(patientsRes.data);
  };

  const handleEditAppointment = async (appt) => {
    let apptToEdit = { ...appt };
    if (!appt.doctor_id || !appt.patient_id) {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/appointments/${appt.id}`);
        apptToEdit = { ...appt, ...res.data };
      } catch (err) {
        toast.error('Error fetching appointment details');
        return;
      }
    }
    setEditAppt({ ...apptToEdit });
    setShowEditModal(true);
    await fetchDoctorPatientOptions();
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditAppt(appt => ({ ...appt, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const payload = {
        doctor_id: editAppt.doctor_id || editAppt.doctorId || '',
        patient_id: editAppt.patient_id || editAppt.patientId || '',
        appointment_date: editAppt.appointment_date,
        type: editAppt.type,
        status: editAppt.status
      };
      const res = await axios.put(`${API_BASE_URL}/api/admin/appointments/${editAppt.id}`, payload);
      setAppointments(appts => appts.map(a => a.id === editAppt.id ? res.data : a));
      toast.success('Appointment updated successfully');
      setShowEditModal(false);
      setEditAppt(null);
    } catch (err) {
      toast.error('Error updating appointment');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 h-screen sticky top-0 bg-[#3ba7a7] shadow-lg flex flex-col py-8 px-4 z-10">
        <h2 className="text-2xl font-bold mb-8 text-center text-white tracking-wide">Admin Panel</h2>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded transition-all duration-200 ${activeMenu === 'dashboard' ? 'bg-[#56c3c3] text-white font-semibold shadow' : 'text-white hover:bg-[#56c3c3]/80'}`}
                onClick={() => setActiveMenu('dashboard')}
              >
                <FaTachometerAlt className="text-lg" /> Dashboard
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded transition-all duration-200 ${activeMenu === 'accounts' ? 'bg-[#56c3c3] text-white font-semibold shadow' : 'text-white hover:bg-[#56c3c3]/80'}`}
                onClick={() => setActiveMenu('accounts')}
              >
                <FaUsers className="text-lg" /> Manage Accounts
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded transition-all duration-200 ${activeMenu === 'appointments' ? 'bg-[#56c3c3] text-white font-semibold shadow' : 'text-white hover:bg-[#56c3c3]/80'}`}
                onClick={() => setActiveMenu('appointments')}
              >
                <FaCalendarAlt className="text-lg" /> Manage Appointments
              </button>
            </li>
          </ul>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-8 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          <FaSignOutAlt /> Logout
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        {activeMenu === 'dashboard' && (
          <AdminDashboardSection
            overview={overview}
            overviewLoading={overviewLoading}
            financial={financial}
            appointments={appointments}
            accounts={accounts} // Pass accounts to dashboard section
          />
        )}
        {activeMenu === 'accounts' && (
          <AdminAccountsSection
            accounts={accounts}
            accountsLoading={accountsLoading}
            search={search}
            setSearch={setSearch}
            handleApproveDoctor={handleApproveDoctor}
            handleHideDoctor={handleHideDoctor}
            handleDelete={handleDelete}
          />
        )}
        {activeMenu === 'appointments' && (
          <AdminAppointmentsSection
            appointments={appointments}
            appointmentsLoading={appointmentsLoading}
            handleEditAppointment={handleEditAppointment}
            handleDeleteAppointment={handleDeleteAppointment}
          />
        )}
      </main>
      {/* Confirm Delete Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-[#3ba7a7]">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this account?</p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-[#56c3c3] hover:bg-[#3ba7a7] text-white px-4 py-2 rounded"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showApptConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-[#3ba7a7]">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this appointment?</p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-[#56c3c3] hover:bg-[#3ba7a7] text-white px-4 py-2 rounded"
                onClick={confirmDeleteAppointment}
              >
                Yes, Delete
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setShowApptConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && editAppt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <form onSubmit={handleEditSubmit} className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4 text-[#3ba7a7]">Edit Appointment</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Doctor</label>
              <select
                name="doctor_id"
                value={editAppt.doctor_id || ''}
                onChange={handleEditChange}
                className="border rounded px-3 py-2 w-full"
                required
              >
                <option value="">Select Doctor</option>
                {doctorOptions.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.firstName} {doc.lastName}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Patient</label>
              <select
                name="patient_id"
                value={editAppt.patient_id || ''}
                onChange={handleEditChange}
                className="border rounded px-3 py-2 w-full"
                required
              >
                <option value="">Select Patient</option>
                {patientOptions.map(pat => (
                  <option key={pat.id} value={pat.id}>{pat.firstName} {pat.lastName}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Date & Time</label>
              <input
                type="datetime-local"
                name="appointment_date"
                value={editAppt.appointment_date ? editAppt.appointment_date.slice(0, 16) : ''}
                onChange={handleEditChange}
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Type</label>
              <select
                name="type"
                value={editAppt.type || ''}
                onChange={handleEditChange}
                className="border rounded px-3 py-2 w-full"
                required
              >
                <option value="">Select Type</option>
                <option value="physical">Physical</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Status</label>
              <select
                name="status"
                value={editAppt.status || ''}
                onChange={handleEditChange}
                className="border rounded px-3 py-2 w-full"
                required
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#56c3c3] hover:bg-[#3ba7a7] text-white px-4 py-2 rounded"
                disabled={editLoading}
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
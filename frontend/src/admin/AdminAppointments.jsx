import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiCalendar,
  FiUser,
  FiPhone,
  FiVideo,
  FiCheckCircle,
  FiXCircle,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiClock,
  FiAlertCircle,
  FiDollarSign
} from 'react-icons/fi';
import { API_BASE_URL } from '../config/api';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAppointment, setEditAppointment] = useState(null);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [paymentStatusLoading, setPaymentStatusLoading] = useState({}); // { [id]: boolean }

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/appointments`);
      // Map doctor/patient fields for table display
      const mapped = (response.data || []).map(appt => ({
        ...appt,
        appointment_date: appt.appointment_date || appt.appointmentDate || null,
        doctor: appt.doctor || {
          firstName: appt.doctorFirstName || appt.doctor_firstName || appt.doctorfirstname || appt.doctorName?.split(' ')[0] || '',
          lastName: appt.doctorLastName || appt.doctor_lastName || appt.doctorlastname || appt.doctorName?.split(' ').slice(1).join(' ') || ''
        },
        patient: appt.patient || {
          firstName: appt.patientFirstName || appt.patient_firstName || appt.patientfirstname || appt.patientName?.split(' ')[0] || '',
          lastName: appt.patientLastName || appt.patient_lastName || appt.patientlastname || appt.patientName?.split(' ').slice(1).join(' ') || '',
          phone: appt.patientPhone || ''
        }
      }));
      setAppointments(mapped);
      setFilteredAppointments(mapped);
    } catch (error) {
      toast.error('Failed to fetch appointments');
      setAppointments([]);
      setFilteredAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filterAppointments = () => {
      let filtered = [...appointments];

      // Apply search filter
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(appt => {
          const doctorName = `${appt.doctor?.firstName || ''} ${appt.doctor?.lastName || ''}`.trim().toLowerCase();
          const patientName = `${appt.patient?.firstName || ''} ${appt.patient?.lastName || ''}`.trim().toLowerCase();
          const phone = appt.patient?.phone?.toString() || '';
          const type = appt.type?.toLowerCase() || '';
          return (
            doctorName.includes(query) ||
            patientName.includes(query) ||
            phone.includes(query) ||
            type.includes(query)
          );
        });
      }

      // Filter by time
      if (timeFilter !== 'all') {
        filtered = filtered.filter(appt => {
          const appointmentTime = new Date(appt.appointment_date).getHours();
          if (timeFilter === 'morning') return appointmentTime >= 6 && appointmentTime < 12;
          if (timeFilter === 'afternoon') return appointmentTime >= 12 && appointmentTime < 18;
          if (timeFilter === 'evening') return appointmentTime >= 18 && appointmentTime < 24;
          return true;
        });
      }

      // Filter by status
      if (statusFilter !== 'all') {
        filtered = filtered.filter(appt => appt.status === statusFilter);
      }

      setFilteredAppointments(filtered);
    };

    filterAppointments();
  }, [search, timeFilter, statusFilter, appointments]);

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/appointments/${deleteId}`);
      setAppointments(appts => appts.filter(appt => appt.id !== deleteId));
      toast.success('Appointment deleted successfully');
    } catch {
      toast.error('Error deleting appointment');
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const fetchOptions = async () => {
    try {
      const [doctorsRes, patientsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/doctors`),
        axios.get(`${API_BASE_URL}/api/admin/patients`)
      ]);
      setDoctorOptions(doctorsRes.data);
      setPatientOptions(patientsRes.data);
    } catch (error) {
      toast.error('Failed to load options');
    }
  };

  const handleEdit = async (appointment) => {
    setEditLoading(true);
    try {
      await fetchOptions();
      setEditAppointment(appointment);
      setShowEditModal(true);
    } catch {
      toast.error('Failed to prepare edit form');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const payload = {
        doctor_id: editAppointment.doctor_id,
        patient_id: editAppointment.patient_id,
        appointment_date: editAppointment.appointment_date,
        type: editAppointment.type,
        status: editAppointment.status
      };
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/appointments/${editAppointment.id}`,
        payload
      );
      setAppointments(appts => 
        appts.map(a => a.id === editAppointment.id ? response.data : a)
      );
      toast.success('Appointment updated successfully');
      setShowEditModal(false);
    } catch {
      toast.error('Error updating appointment');
    } finally {
      setEditLoading(false);
    }
  };

  // Update payment status handler
  const handlePaymentStatusChange = async (appointment, newStatus) => {
    setPaymentStatusLoading(prev => ({ ...prev, [appointment.id]: true }));
    try {
      // Try with admin endpoint and admin token, fallback to assistant if available
      const adminToken = localStorage.getItem('adminToken');
      const assistantToken = localStorage.getItem('assistantToken');
      const headers = {};

      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      } else if (assistantToken) {
        headers['assistant-token'] = assistantToken;
      }

      // Try admin endpoint first
      try {
        await axios.put(
          `${API_BASE_URL}/api/admin/appointments/${appointment.id}/payment-status`,
          { payment_status: newStatus },
          { headers }
        );
      } catch (err) {
        // If admin endpoint fails (404 or 403), fallback to general endpoint
        await axios.put(
          `${API_BASE_URL}/api/appointments/${appointment.id}/payment-status`,
          { payment_status: newStatus },
          { headers }
        );
      }

      setAppointments(appts =>
        appts.map(a =>
          a.id === appointment.id ? { ...a, payment_status: newStatus } : a
        )
      );
      toast.success('Payment status updated');
    } catch {
      toast.error('Failed to update payment status');
    } finally {
      setPaymentStatusLoading(prev => ({ ...prev, [appointment.id]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <FiClock className="mr-1" /> },
      confirmed: { color: 'bg-green-100 text-green-800', icon: <FiCheckCircle className="mr-1" /> },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: <FiClock className="mr-1" /> },
      completed: { color: 'bg-indigo-100 text-indigo-800', icon: <FiCheckCircle className="mr-1" /> },
      canceled: { color: 'bg-red-100 text-red-800', icon: <FiXCircle className="mr-1" /> }
    };
    const statusText = status.replace('_', ' ');
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full inline-flex items-center ${statusMap[status]?.color || 'bg-gray-100 text-gray-800'}`}>
        {statusMap[status]?.icon}
        {statusText}
      </span>
    );
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return { date: 'N/A', time: 'N/A' };
    const date = new Date(dateTime);
    if (Number.isNaN(date.getTime())) return { date: 'N/A', time: 'N/A' };
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manage Appointments</h1>
            <p className="text-gray-600">View and manage all system appointments</p>
          </div>
          <button 
            onClick={fetchAppointments}
            className="mt-4 md:mt-0 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-xs flex items-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FiRefreshCw className="mr-2" />
            Refresh
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 mb-6">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search appointments by doctor, patient, or type..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FiXCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Time Filter */}
              <div className="flex items-center">
                <FiClock className="text-gray-400 mr-2" />
                <label className="text-sm font-medium text-gray-700 mr-2">Time:</label>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Times</option>
                  <option value="morning">Morning (6AM-12PM)</option>
                  <option value="afternoon">Afternoon (12PM-6PM)</option>
                  <option value="evening">Evening (6PM-12AM)</option>
                </select>
              </div>
              {/* Status Filter */}
              <div className="flex items-center">
                <FiFilter className="text-gray-400 mr-2" />
                <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center p-12">
                <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || timeFilter !== 'all' || statusFilter !== 'all' 
                    ? "Try adjusting your search or filters" 
                    : "No appointments scheduled yet"}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor & Patient
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
                  {filteredAppointments.map((appointment) => {
                    const { date, time } = formatDateTime(appointment.appointment_date);
                    return (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FiUser className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                <span className="inline-flex items-center">
                                  <FiPhone className="mr-1" /> {appointment.patient?.phone || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{date}</div>
                          <div className="text-sm text-gray-500">{time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            appointment.type === 'video' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {appointment.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(appointment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            appointment.payment_status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            <FiDollarSign className="mr-1" />
                            {appointment.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                          <button
                            className={`ml-2 px-2 py-1 text-xs rounded ${
                              appointment.payment_status === 'paid'
                                ? 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300'
                                : 'bg-green-200 text-green-900 hover:bg-green-300'
                            }`}
                            disabled={paymentStatusLoading[appointment.id]}
                            onClick={() =>
                              handlePaymentStatusChange(
                                appointment,
                                appointment.payment_status === 'paid' ? 'unpaid' : 'paid'
                              )
                            }
                          >
                            {paymentStatusLoading[appointment.id]
                              ? '...'
                              : appointment.payment_status === 'paid'
                                ? 'Mark Unpaid'
                                : 'Mark Paid'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(appointment)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                            >
                              <FiEdit2 className="mr-1" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(appointment.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                            >
                              <FiTrash2 className="mr-1" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-red-600">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this appointment?</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={confirmDelete}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && editAppointment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <form 
            onSubmit={handleEditSubmit}
            className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full"
          >
            <h2 className="text-xl font-bold mb-6 text-gray-800">Edit Appointment</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select
                  name="doctor_id"
                  value={editAppointment.doctor_id || ''}
                  onChange={(e) => setEditAppointment({...editAppointment, doctor_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctorOptions.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <select
                  name="patient_id"
                  value={editAppointment.patient_id || ''}
                  onChange={(e) => setEditAppointment({...editAppointment, patient_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Patient</option>
                  {patientOptions.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  name="appointment_date"
                  value={editAppointment.appointment_date ? editAppointment.appointment_date.slice(0, 16) : ''}
                  onChange={(e) => setEditAppointment({...editAppointment, appointment_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={editAppointment.type || ''}
                  onChange={(e) => setEditAppointment({...editAppointment, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="physical">Physical</option>
                  <option value="video">Video</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={editAppointment.status || ''}
                  onChange={(e) => setEditAppointment({...editAppointment, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

export default AdminAppointments;
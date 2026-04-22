import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiClock, FiLoader, FiArrowLeft } from 'react-icons/fi';
import AssistantSidebar from './AssistantSidebar';
import { API_BASE_URL } from '../../config/api';

const PatientHistory = () => {
  const { patientId } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('assistantToken');
        if (!token) throw new Error('Authentication required');

        // Get assistant profile to get doctor_id
        const profileRes = await axios.get(`${API_BASE_URL}/api/assistants/profile`, {
          headers: { 'assistant-token': token }
        });
        const doctorId = profileRes.data?.doctor_id;
        if (!doctorId) throw new Error('No doctor assigned');

        // Use assistant-token header for this request as well
        const response = await axios.get(
          `${API_BASE_URL}/api/doctors/${doctorId}/patients/${patientId}/appointments`,
          { headers: { 'assistant-token': token } }
        );
        setAppointments(response.data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch appointment history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [patientId]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AssistantSidebar activeTab="patients" />
      
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => window.history.back()}
            className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="mr-2" /> Back to Patients
          </button>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            Appointment History
          </h1>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FiLoader className="animate-spin h-8 w-8 text-[#ff5a5f]" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <FiClock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No appointment history
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                This patient has no past appointments.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(appointment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(appointment.date).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {appointment.notes || 'No notes'}
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

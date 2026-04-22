import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from '../doctor/DoctorSidebar';
import { FiUserPlus, FiLogIn, FiUser, FiMail, FiTrash2, FiEdit } from 'react-icons/fi';
import { API_BASE_URL } from '../../config/api';

const ManageAssistant = () => {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const doctorToken = localStorage.getItem('doctorToken');
        const res = await axios.get(`${API_BASE_URL}/api/assistants/my`, {
          headers: { 'doctor-token': doctorToken }
        });
        setAssistants(res.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch assistants. Please try again.');
        setAssistants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssistants();
  }, []);

  const handleDeleteAssistant = async (assistantId) => {
    if (window.confirm('Are you sure you want to remove this assistant?')) {
      try {
        const doctorToken = localStorage.getItem('doctorToken');
        await axios.delete(`${API_BASE_URL}/api/assistants/${assistantId}`, {
          headers: { 'doctor-token': doctorToken }
        });
        setAssistants(assistants.filter(a => a.id !== assistantId));
      } catch (err) {
        setError('Failed to delete assistant.');
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorSidebar activeTab="assistants" />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Manage Assistants</h1>
              <p className="text-gray-600">View and manage your medical assistants</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                className="flex items-center gap-2 bg-[#ff5a5f] text-white px-4 py-2 rounded-lg hover:bg-[#e04a50] transition-all shadow-md hover:shadow-lg"
                onClick={() => navigate('/assistant/register')}
              >
                <FiUserPlus size={18} />
                <span>Add Assistant</span>
              </button>
              <button
                className="flex items-center gap-2 border border-[#ff5a5f] text-[#ff5a5f] px-4 py-2 rounded-lg hover:bg-[#ff5a5f] hover:text-white transition-all"
                onClick={() => navigate('/assistant/login')}
              >
                <FiLogIn size={18} />
                <span>Assistant Login</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff5a5f]"></div>
            </div>
          ) : assistants.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-gray-400 mb-4">
                <FiUser size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Assistants Found</h3>
              <p className="text-gray-500 mb-4">You haven't added any assistants yet.</p>
              <button
                onClick={() => navigate('/assistant/register')}
                className="bg-[#ff5a5f] text-white px-6 py-2 rounded-lg hover:bg-[#e04a50] transition"
              >
                Register Your First Assistant
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-100 p-4 font-medium text-gray-700">
                <div className="col-span-4 md:col-span-3">Name</div>
                <div className="col-span-5 md:col-span-6">Email</div>
                <div className="col-span-3 md:col-span-3 text-right">Actions</div>
              </div>
              {assistants.map(a => (
                <div key={a.id} className="grid grid-cols-12 p-4 border-b border-gray-100 hover:bg-gray-50 transition">
                  <div className="col-span-4 md:col-span-3 font-medium flex items-center">
                    <FiUser className="mr-2 text-[#ff5a5f]" />
                    {a.firstName} {a.lastName}
                  </div>
                  <div className="col-span-5 md:col-span-6 flex items-center text-gray-600">
                    <FiMail className="mr-2 text-[#ff5a5f]" />
                    {a.email}
                  </div>
                  <div className="col-span-3 md:col-span-3 flex justify-end gap-2">
                    <button 
                      onClick={() => navigate(`/assistant/edit/${a.id}`)}
                      className="p-2 text-gray-500 hover:text-[#ff5a5f] transition"
                      title="Edit"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteAssistant(a.id)}
                      className="p-2 text-gray-500 hover:text-red-500 transition"
                      title="Delete"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAssistant;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiCheckCircle,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiXCircle,
  FiPlus
} from 'react-icons/fi';
import { API_BASE_URL } from '../config/api';

const AdminAssistants = () => {
  const [assistants, setAssistants] = useState([]);
  const [filteredAssistants, setFilteredAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ 
    email: '', 
    firstName: '', 
    lastName: '', 
    doctor_id: '' 
  });
  const [showEdit, setShowEdit] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchAssistants();
  }, []);

  useEffect(() => {
    filterAssistants();
  }, [search, assistants]);

  const fetchAssistants = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/assistants/admin/assistants`, {
        headers: {
          'admin-token': localStorage.getItem('adminToken')
        }
      });
      setAssistants(res.data);
    } catch (err) {
      toast.error('Error fetching assistants');
      setAssistants([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAssistants = () => {
    if (!search) {
      setFilteredAssistants(assistants);
      return;
    }

    const query = search.toLowerCase();
    const filtered = assistants.filter(assistant => {
      const firstName = assistant.firstName?.toLowerCase() || '';
      const lastName = assistant.lastName?.toLowerCase() || '';
      const email = assistant.email?.toLowerCase() || '';
      const doctorId = assistant.doctor_id?.toString() || '';
      
      return (
        firstName.includes(query) ||
        lastName.includes(query) ||
        email.includes(query) ||
        doctorId.includes(query)
      );
    });

    setFilteredAssistants(filtered);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/assistants/admin/assistants/${deleteId}`, {
        headers: {
          'admin-token': localStorage.getItem('adminToken')
        }
      });
      setAssistants(assistants => assistants.filter(a => a.id !== deleteId));
      toast.success('Assistant deleted successfully');
    } catch {
      toast.error('Error deleting assistant');
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const handleEdit = (assistant) => {
    setEditId(assistant.id);
    setEditData({
      email: assistant.email || '',
      firstName: assistant.firstName || '',
      lastName: assistant.lastName || '',
      doctor_id: assistant.doctor_id || ''
    });
    setShowEdit(true);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const confirmEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_BASE_URL}/api/assistants/admin/assistants/${editId}`,
        editData,
        {
          headers: {
            'admin-token': localStorage.getItem('adminToken')
          }
        }
      );
      setAssistants(assistants =>
        assistants.map(a =>
          a.id === editId ? { ...a, ...editData } : a
        )
      );
      toast.success('Assistant updated successfully');
      setShowEdit(false);
      setEditId(null);
    } catch {
      toast.error('Error updating assistant');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/assistants/admin/assistants`,
        editData,
        {
          headers: {
            'admin-token': localStorage.getItem('adminToken')
          }
        }
      );
      setAssistants([...assistants, res.data]);
      toast.success('Assistant created successfully');
      setShowCreate(false);
      setEditData({ email: '', firstName: '', lastName: '', doctor_id: '' });
    } catch {
      toast.error('Error creating assistant');
    }
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manage Assistants</h1>
            <p className="text-gray-600">View and manage all medical assistants</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button 
              onClick={fetchAssistants}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-xs flex items-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FiRefreshCw className="mr-2" />
              Refresh
            </button>
            <button 
              onClick={() => {
                setEditData({ email: '', firstName: '', lastName: '', doctor_id: '' });
                setShowCreate(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-xs flex items-center text-sm font-medium hover:bg-blue-700"
            >
              <FiPlus className="mr-2" />
              Add Assistant
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search assistants by name, email or doctor ID..."
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
        </div>

        {/* Assistants Table */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredAssistants.length === 0 ? (
              <div className="text-center p-12">
                <FiUser className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No assistants found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search ? "Try adjusting your search" : "No assistants available"}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assistant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssistants.map((assistant) => (
                    <tr key={assistant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {assistant.firstName} {assistant.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {assistant.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{assistant.email}</div>
                        <div className="text-sm text-gray-500">
                          <span className="inline-flex items-center">
                            <FiMail className="mr-1" /> {assistant.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {assistant.doctor_id || 'Not assigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(assistant)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                          >
                            <FiEdit2 className="mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(assistant.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                          >
                            <FiTrash2 className="mr-1" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <form
            onSubmit={confirmEdit}
            className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Assistant</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={editData.email}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    name="firstName"
                    value={editData.firstName}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    name="lastName"
                    value={editData.lastName}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor ID</label>
                <input
                  name="doctor_id"
                  value={editData.doctor_id}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Assistant</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={editData.email}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    name="firstName"
                    value={editData.firstName}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    name="lastName"
                    value={editData.lastName}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor ID</label>
                <input
                  name="doctor_id"
                  value={editData.doctor_id}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Assistant
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-red-600">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this assistant? This action cannot be undone.</p>
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
    </div>
  );
};

export default AdminAssistants;
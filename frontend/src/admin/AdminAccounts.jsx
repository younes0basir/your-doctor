import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiCheckCircle,
  FiEyeOff,
  FiTrash2,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiXCircle,
  FiClock,
  FiKey,
  FiEdit,
  FiEye
} from 'react-icons/fi';
import { API_BASE_URL } from '../config/api';

const AdminAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/accounts`);
      setAccounts(response.data);
      setFilteredAccounts(response.data);
    } catch (error) {
      toast.error('Failed to fetch accounts');
      setAccounts([]);
      setFilteredAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filterAccounts = () => {
      let filtered = [...accounts];

      // Apply search filter
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(account => {
          const firstName = account.firstName?.toLowerCase() || '';
          const lastName = account.lastName?.toLowerCase() || '';
          const email = account.email?.toLowerCase() || '';
          return (
            firstName.includes(query) ||
            lastName.includes(query) ||
            email.includes(query)
          );
        });
      }

      // Filter by account type
      if (accountTypeFilter !== 'all') {
        filtered = filtered.filter(account => account.type === accountTypeFilter);
      }

      // Filter by status
      if (statusFilter !== 'all') {
        filtered = filtered.filter(account => account.status === statusFilter);
      }

      setFilteredAccounts(filtered);
    };

    filterAccounts();
  }, [search, accountTypeFilter, statusFilter, accounts]);

  const handleApproveDoctor = async (doctorId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/doctors/${doctorId}/approve`);
      setAccounts(accounts => accounts.map(acc =>
        acc.type === 'doctor' && acc.id === doctorId ? { ...acc, status: 'approved' } : acc
      ));
      toast.success('Doctor approved successfully');
    } catch {
      toast.error('Error approving doctor');
    }
  };

  const handleHideDoctor = async (doctorId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/doctors/${doctorId}/hide`);
      setAccounts(accounts => accounts.map(acc =>
        acc.type === 'doctor' && acc.id === doctorId ? { ...acc, status: 'hidden' } : acc
      ));
      toast.success('Doctor hidden successfully');
    } catch {
      toast.error('Error hiding doctor');
    }
  };

  const handleUnhideDoctor = async (doctorId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/doctors/${doctorId}/unhide`);
      setAccounts(accounts => accounts.map(acc =>
        acc.type === 'doctor' && acc.id === doctorId ? { ...acc, status: 'approved' } : acc
      ));
      toast.success('Doctor unhidden successfully');
    } catch {
      toast.error('Error unhiding doctor');
    }
  };

  const handleDelete = (type, id) => {
    setDeleteTarget({ type, id });
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/accounts/${deleteTarget.type}/${deleteTarget.id}`);
      setAccounts(accounts => accounts.filter(acc => !(acc.type === deleteTarget.type && acc.id === deleteTarget.id)));
      toast.success('Account deleted successfully');
    } catch {
      toast.error('Error deleting account');
    } finally {
      setShowConfirm(false);
      setDeleteTarget(null);
    }
  };

  const handleGenerateTempToken = async (type, id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/temp-token/${type}/${id}`);
      setGeneratedToken(response.data.token);
      setShowTokenModal(true);
      toast.success('Temp token generated successfully');
    } catch {
      toast.error('Error generating temp token');
    }
  };

  const handleViewAccount = async (type, id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/accounts/${type}/${id}`);
      setSelectedAccount(response.data);
      setShowViewModal(true);
    } catch {
      toast.error('Error fetching account details');
    }
  };

  const handleEditAccount = (account) => {
    setSelectedAccount(account);
    setEditForm({
      firstName: account.firstName || '',
      lastName: account.lastName || '',
      email: account.email || '',
      phoneNumber: account.phoneNumber || '',
      age: account.age || '',
      cin: account.cin || '',
      speciality_id: account.speciality_id || '',
      experience_years: account.experience_years || '',
      consultation_fee: account.consultation_fee || '',
      degree: account.degree || '',
      city: account.city || '',
      address: account.address || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/accounts/${selectedAccount.type}/${selectedAccount.id}`,
        editForm
      );
      setAccounts(accounts => accounts.map(acc =>
        acc.type === selectedAccount.type && acc.id === selectedAccount.id ? response.data : acc
      ));
      toast.success('Account updated successfully');
      setShowEditModal(false);
      setSelectedAccount(null);
      setEditForm({});
    } catch {
      toast.error('Error updating account');
    } finally {
      setEditLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    // Handle undefined/null status
    if (!status) {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-full inline-flex items-center bg-gray-100 text-gray-800">
          <FiClock className="mr-1" /> Unknown
        </span>
      );
    }

    const statusString = status.toString().toLowerCase();
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <FiClock className="mr-1" /> },
      approved: { color: 'bg-green-100 text-green-800', icon: <FiCheckCircle className="mr-1" /> },
      hidden: { color: 'bg-red-100 text-red-800', icon: <FiEyeOff className="mr-1" /> },
      active: { color: 'bg-blue-100 text-blue-800', icon: <FiCheckCircle className="mr-1" /> }
    };

    const statusConfig = statusMap[statusString] || { 
      color: 'bg-gray-100 text-gray-800', 
      icon: <FiClock className="mr-1" /> 
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full inline-flex items-center ${statusConfig.color}`}>
        {statusConfig.icon}
        {status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    // Handle undefined/null type
    if (!type) {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-full inline-flex items-center bg-gray-100 text-gray-800">
          <FiUser className="mr-1" /> Unknown
        </span>
      );
    }

    const typeString = type.toString().toLowerCase();
    const typeMap = {
      doctor: { color: 'bg-purple-100 text-purple-800', icon: <FiBriefcase className="mr-1" /> },
      assistant: { color: 'bg-indigo-100 text-indigo-800', icon: <FiUser className="mr-1" /> },
      admin: { color: 'bg-amber-100 text-amber-800', icon: <FiUser className="mr-1" /> }
    };

    const typeConfig = typeMap[typeString] || { 
      color: 'bg-gray-100 text-gray-800', 
      icon: <FiUser className="mr-1" /> 
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full inline-flex items-center ${typeConfig.color}`}>
        {typeConfig.icon}
        {type}
      </span>
    );
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manage Accounts</h1>
            <p className="text-gray-600">View and manage all system accounts</p>
          </div>
          <button 
            onClick={fetchAccounts}
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
                placeholder="Search accounts by name or email..."
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
              {/* Account Type Filter */}
              <div className="flex items-center">
                <FiFilter className="text-gray-400 mr-2" />
                <label className="text-sm font-medium text-gray-700 mr-2">Type:</label>
                <select
                  value={accountTypeFilter}
                  onChange={(e) => setAccountTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="doctor">Doctors</option>
                  <option value="assistant">Assistants</option>
                  <option value="admin">Admins</option>
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
                  <option value="approved">Approved</option>
                  <option value="hidden">Hidden</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="text-center p-12">
                <FiUser className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || accountTypeFilter !== 'all' || statusFilter !== 'all' 
                    ? "Try adjusting your search or filters" 
                    : "No accounts available"}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAccounts.map((account) => (
                    <tr key={`${account.type}-${account.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {account.firstName} {account.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {account.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{account.email}</div>
                        <div className="text-sm text-gray-500">
                          <span className="inline-flex items-center">
                            <FiPhone className="mr-1" /> {account.phone || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(account.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(account.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {account.type === 'doctor' && account.status === 'pending' && (
                            <button
                              onClick={() => handleApproveDoctor(account.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                            >
                              <FiCheckCircle className="mr-1" /> Approve
                            </button>
                          )}
                          {account.type === 'doctor' && account.status === 'approved' && (
                            <button
                              onClick={() => handleHideDoctor(account.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none"
                            >
                              <FiEyeOff className="mr-1" /> Hide
                            </button>
                          )}
                          {account.type === 'doctor' && account.status === 'hidden' && (
                            <button
                              onClick={() => handleUnhideDoctor(account.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                            >
                              <FiCheckCircle className="mr-1" /> Unhide
                            </button>
                          )}
                          <button
                            onClick={() => handleViewAccount(account.type, account.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none"
                          >
                            <FiEye className="mr-1" /> View
                          </button>
                          <button
                            onClick={() => handleEditAccount(account)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                          >
                            <FiEdit className="mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleGenerateTempToken(account.type, account.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
                          >
                            <FiKey className="mr-1" /> Temp Token
                          </button>
                          <button
                            onClick={() => handleDelete(account.type, account.id)}
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

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-red-600">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this account? This action cannot be undone.</p>
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

      {/* Temp Token Modal */}
      {showTokenModal && generatedToken && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-purple-600">Temp Token Generated</h2>
            <p className="mb-4 text-gray-600">Share this token with the user. It is valid for 24 hours and can only be used once.</p>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <code className="text-sm break-all text-purple-700 font-mono">{generatedToken}</code>
            </div>
            <p className="text-xs text-gray-500 mb-6">The user can use this token to log in at the temp login page and reset their password.</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(generatedToken);
                  toast.success('Token copied to clipboard');
                }}
              >
                Copy Token
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowTokenModal(false);
                  setGeneratedToken(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Account Modal */}
      {showViewModal && selectedAccount && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Account Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{selectedAccount.type}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{selectedAccount.firstName} {selectedAccount.lastName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{selectedAccount.email}</span>
              </div>
              {selectedAccount.phoneNumber && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{selectedAccount.phoneNumber}</span>
                </div>
              )}
              {selectedAccount.age && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium">{selectedAccount.age}</span>
                </div>
              )}
              {selectedAccount.cin && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">CIN:</span>
                  <span className="font-medium">{selectedAccount.cin}</span>
                </div>
              )}
              {selectedAccount.speciality_id && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Speciality ID:</span>
                  <span className="font-medium">{selectedAccount.speciality_id}</span>
                </div>
              )}
              {selectedAccount.experience_years && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium">{selectedAccount.experience_years} years</span>
                </div>
              )}
              {selectedAccount.consultation_fee && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Consultation Fee:</span>
                  <span className="font-medium">${selectedAccount.consultation_fee}</span>
                </div>
              )}
              {selectedAccount.degree && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Degree:</span>
                  <span className="font-medium">{selectedAccount.degree}</span>
                </div>
              )}
              {selectedAccount.city && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">City:</span>
                  <span className="font-medium">{selectedAccount.city}</span>
                </div>
              )}
              {selectedAccount.address && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium">{selectedAccount.address}</span>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAccount(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {showEditModal && selectedAccount && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Account</h2>
            <form onSubmit={handleUpdateAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              {selectedAccount.type === 'patient' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input
                      type="number"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CIN</label>
                    <input
                      type="text"
                      value={editForm.cin}
                      onChange={(e) => setEditForm({ ...editForm, cin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}
              {selectedAccount.type === 'doctor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Speciality ID</label>
                    <input
                      type="number"
                      value={editForm.speciality_id}
                      onChange={(e) => setEditForm({ ...editForm, speciality_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Years</label>
                    <input
                      type="number"
                      value={editForm.experience_years}
                      onChange={(e) => setEditForm({ ...editForm, experience_years: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee</label>
                    <input
                      type="number"
                      value={editForm.consultation_fee}
                      onChange={(e) => setEditForm({ ...editForm, consultation_fee: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                    <input
                      type="text"
                      value={editForm.degree}
                      onChange={(e) => setEditForm({ ...editForm, degree: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAccount(null);
                    setEditForm({});
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccounts;
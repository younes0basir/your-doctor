import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const Profile = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    age: '',
    gender: '',
    bloodType: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const firstNameInputRef = useRef(null);
  const navigate = useNavigate();

  // Primary color variables
  const primaryColor = '#ff5a5f';
  const primaryHover = '#e04a50';
  const primaryLight = '#ffebec';
  const primaryDark = '#cc494e';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('patientToken');
        if (!token) {
          setPatient(null);
          setLoading(false);
          return;
        }
        const res = await axios.get(`${API_BASE_URL}/api/patients/profile`, {
          headers: { 'patient-token': token }
        });
        setPatient(res.data);
        setForm({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          phoneNumber: res.data.phoneNumber || '',
          age: res.data.age || '',
          gender: res.data.gender || '',
          bloodType: res.data.bloodType || ''
        });
      } catch {
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
    setError('');
    setSuccess('');
    setTimeout(() => {
      if (firstNameInputRef.current) firstNameInputRef.current.focus();
    }, 100);
  };

  const handleCancel = () => {
    setEditMode(false);
    setError('');
    setForm({
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      phoneNumber: patient.phoneNumber || '',
      age: patient.age || '',
      gender: patient.gender || '',
      bloodType: patient.bloodType || ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('patientToken');
      const res = await axios.put(
        `${API_BASE_URL}/api/patients/profile`,
        {
          firstName: form.firstName,
          lastName: form.lastName,
          phoneNumber: form.phoneNumber,
          age: form.age,
          gender: form.gender,
          bloodType: form.bloodType
        },
        { headers: { 'patient-token': token } }
      );
      setPatient(res.data);
      setEditMode(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to update profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div 
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4" 
            style={{ borderColor: primaryColor }}
          ></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md w-full">
          <div className="mb-4 flex justify-center" style={{ color: primaryColor }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to load profile</h2>
          <p className="text-gray-600 mb-6">Please log in to access your profile information.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            style={{ backgroundColor: primaryColor, hover: { backgroundColor: primaryHover } }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Profile Header with Primary Color */}
          <div 
            className="px-6 py-8 sm:px-8 sm:py-10"
            style={{ background: `linear-gradient(to right, ${primaryColor}, ${primaryDark})` }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                {patient.image_url ? (
                  <img
                    src={patient.image_url}
                    alt="Profile"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div 
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-5xl text-white border-4 border-white border-opacity-30 shadow-md"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {patient.firstName?.charAt(0).toUpperCase()}
                  </div>
                )}
                {!editMode && (
                  <button
                    onClick={handleEdit}
                    className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ focusRingColor: primaryColor }}
                    aria-label="Edit profile"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style={{ color: primaryColor }}>
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {patient.firstName} {patient.lastName}
                </h1>
                <p className="text-white text-opacity-90 mb-2">{patient.email}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 text-sm text-white text-opacity-90">
                  <span className="flex items-center px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {patient.phoneNumber || 'Not provided'}
                  </span>
                  {patient.age && (
                    <span className="flex items-center px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {patient.age} years
                    </span>
                  )}
                  {patient.gender && (
                    <span className="flex items-center px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {patient.gender}
                    </span>
                  )}
                  {patient.bloodType && (
                    <span className="flex items-center px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {patient.bloodType}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            {success && (
              <div className="mb-6 border px-4 py-3 rounded-lg flex items-center" style={{ backgroundColor: primaryLight, borderColor: primaryColor, color: primaryDark }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" style={{ color: primaryColor }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            )}

            {!editMode ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" style={{ color: primaryColor }}>
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Personal Information
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                        <p className="mt-1 text-gray-900">{patient.firstName} {patient.lastName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="mt-1 text-gray-900">{patient.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                        <p className="mt-1 text-gray-900">{patient.phoneNumber || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" style={{ color: primaryColor }}>
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm4 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      Medical Information
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Age</h3>
                        <p className="mt-1 text-gray-900">{patient.age || 'Not provided'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                        <p className="mt-1 text-gray-900">{patient.gender || 'Not provided'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Blood Type</h3>
                        <p className="mt-1 text-gray-900">{patient.bloodType || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition duration-200"
                    style={{ backgroundColor: primaryColor, hover: { backgroundColor: primaryHover } }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" style={{ color: primaryColor }}>
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Profile
                </h2>
                
                {error && (
                  <div className="border px-4 py-3 rounded-lg flex items-center" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#dc2626' }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Information Form */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          ref={firstNameInputRef}
                          value={form.firstName}
                          onChange={handleChange}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:border-transparent transition duration-200"
                          style={{ focusRingColor: primaryColor }}
                          required
                          autoComplete="given-name"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:border-transparent transition duration-200"
                          style={{ focusRingColor: primaryColor }}
                          required
                          autoComplete="family-name"
                        />
                      </div>
                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={form.phoneNumber}
                          onChange={handleChange}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:border-transparent transition duration-200"
                          style={{ focusRingColor: primaryColor }}
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Medical Information Form */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Medical Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                          Age
                        </label>
                        <input
                          type="number"
                          id="age"
                          name="age"
                          value={form.age}
                          onChange={handleChange}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:border-transparent transition duration-200"
                          style={{ focusRingColor: primaryColor }}
                          min="0"
                          max="120"
                        />
                      </div>
                      <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                          Gender
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:border-transparent transition duration-200"
                          style={{ focusRingColor: primaryColor }}
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">
                          Blood Type
                        </label>
                        <select
                          id="bloodType"
                          name="bloodType"
                          value={form.bloodType}
                          onChange={handleChange}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:border-transparent transition duration-200"
                          style={{ focusRingColor: primaryColor }}
                        >
                          <option value="">Select blood type</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
                    style={{ backgroundColor: primaryColor, hover: { backgroundColor: primaryHover } }}
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
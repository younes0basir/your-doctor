import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUserPlus, FiBriefcase, FiMail, FiLock, FiPhone, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const AdminAccountCreate = () => {
  const [type, setType] = useState('patient');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    age: '',
    cin: '',
    // doctor fields
    speciality_id: '',
    experience_years: '',
    consultation_fee: '',
    specialty_description: '',
    degree: '',
    city: '',
    address: '',
    // assistant fields
    doctor_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [specialities, setSpecialities] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectKey, setSelectKey] = useState(0);
  const [fade, setFade] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (type === 'doctor') {
      axios.get(`${API_BASE_URL}/api/doctors/specialities`)
        .then(res => setSpecialities(res.data || []))
        .catch(() => setSpecialities([]));
    }
    if (type === 'assistant') {
      axios.get(`${API_BASE_URL}/api/admin/doctors`, {
        headers: { 'admin-token': localStorage.getItem('adminToken') }
      })
        .then(res => setDoctors(res.data || []))
        .catch(() => setDoctors([]));
    }
    // Clear specialities and doctors when not needed
    if (type !== 'doctor') setSpecialities([]);
    if (type !== 'assistant') setDoctors([]);
  }, [type]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleTypeChange = e => {
    if (loading) return; // Prevent changing type while loading
    // Instantly allow select change, then animate out/in
    setType(e.target.value);
    setFade(false);
    setTimeout(() => {
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        age: '',
        cin: '',
        speciality_id: '',
        experience_years: '',
        consultation_fee: '',
        specialty_description: '',
        degree: '',
        city: '',
        address: '',
        doctor_id: ''
      });
      setError('');
      setSuccess('');
      setSelectKey(prev => prev + 1); // force remount for animation
      setFade(true);
    }, 200); // fade out before fade in
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      let payload = { ...form, type };
      let url = `${API_BASE_URL}/api/admin/accounts`;
      let headers = { 'admin-token': localStorage.getItem('adminToken') };

      if (type === 'assistant') {
        // Use the correct endpoint for assistant creation
        url = `${API_BASE_URL}/api/assistants/admin/assistants`;
        payload = {
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          doctor_id: form.doctor_id
        };
      }

      await axios.post(url, payload, { headers });
      setSuccess('Account created successfully!');
      setTimeout(() => navigate('/admin/accounts'), 1200);
    } catch (err) {
      // Show backend error message if available
      setError(err.response?.data?.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-12 mt-12 border border-red-100">
      <div className="flex items-center mb-10">
        <div className="p-3 bg-[#ff5a5f]/10 rounded-xl mr-4">
          <FiUserPlus className="text-[#ff5a5f] text-3xl" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-[#ff5a5f] leading-tight">Create New {type === 'doctor' ? 'Doctor' : type === 'assistant' ? 'Assistant' : 'Patient'} Account</h2>
          <p className="text-gray-500 mt-1 text-base">Fill in the details below to add a new {type} to the system.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Account Type</label>
          <select
            value={type}
            onChange={handleTypeChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] bg-gray-50 transition"
            disabled={loading}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="assistant">Assistant</option>
          </select>
        </div>
        {/* Animated transition for form fields */}
        <div
          key={selectKey}
          className={`transition-all duration-500 ease-in-out ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} animate-fadeIn`}
          style={{ animation: fade ? 'fadeIn 0.5s' : 'fadeOut 0.2s' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">First Name</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] bg-gray-50 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Last Name</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] bg-gray-50 transition"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
            <div className="flex items-center">
              <FiMail className="mr-2 text-[#ff5a5f]" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] bg-gray-50 transition"
                required
              />
            </div>
          </div>
          {(type === 'doctor' || type === 'assistant') && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Password</label>
              <div className="flex items-center">
                <FiLock className="mr-2 text-[#ff5a5f]" />
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] bg-gray-50 transition"
                  required
                />
              </div>
            </div>
          )}
          {type === 'patient' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Phone Number</label>
                  <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] bg-gray-50 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Age</label>
                  <input
                    name="age"
                    type="number"
                    value={form.age}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] bg-gray-50 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">CIN</label>
                <input
                  name="cin"
                  value={form.cin}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] bg-gray-50 transition"
                />
              </div>
            </>
          )}
          {type === 'doctor' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Speciality</label>
                  <select
                    name="speciality_id"
                    value={form.speciality_id}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] bg-gray-50 transition"
                    required
                  >
                    <option value="">Select Speciality</option>
                    {specialities.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Experience Years</label>
                  <input
                    name="experience_years"
                    type="number"
                    value={form.experience_years}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] bg-gray-50 transition"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Consultation Fee</label>
                  <input
                    name="consultation_fee"
                    type="number"
                    value={form.consultation_fee}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] bg-gray-50 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Degree</label>
                  <input
                    name="degree"
                    value={form.degree}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] bg-gray-50 transition"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Specialty Description</label>
                <input
                  name="specialty_description"
                  value={form.specialty_description}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] bg-gray-50 transition"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">City</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] bg-gray-50 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Address</label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] bg-gray-50 transition"
                    required
                  />
                </div>
              </div>
            </>
          )}
          {type === 'assistant' && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Assign to Doctor</label>
                <select
                  name="doctor_id"
                  value={form.doctor_id}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] bg-gray-50 transition"
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.firstName} {d.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Password</label>
                <div className="flex items-center">
                  <FiLock className="mr-2 text-[#ff5a5f]" />
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] bg-gray-50 transition"
                    required
                  />
                </div>
              </div>
            </>
          )}
          {error && <div className="text-red-600 text-sm font-semibold">{error}</div>}
          {success && (
            <div className="text-green-600 text-sm flex items-center font-semibold">
              <FiCheckCircle className="mr-1" /> {success}
            </div>
          )}
          <div className="flex justify-end mt-8">
            <button
              type="submit"
              className="px-10 py-3 bg-gradient-to-r from-[#ff5a5f] to-[#ff4248] text-white rounded-xl font-bold text-lg shadow-md hover:from-[#ff4248] hover:to-[#ff5a5f] transition"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </div>
      </form>
      {/* Add fadeIn/fadeOut animation style */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(32px);}
          to { opacity: 1; transform: translateY(0);}
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0);}
          to { opacity: 0; transform: translateY(32px);}
        }
        .animate-fadeIn {
          animation-fill-mode: both;
        }
        `}
      </style>
    </div>
  );
};

export default AdminAccountCreate;

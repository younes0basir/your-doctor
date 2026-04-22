import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserMd, FaLock, FaBriefcaseMedical, FaMoneyBillWave, FaGraduationCap, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import { API_BASE_URL } from '../../config/api';

const DoctorRegister = () => {
  const navigate = useNavigate();
  const [specialities, setSpecialities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    speciality_id: '',
    experience_years: '',
    consultation_fee: '',
    specialty_description: '',
    degree: '',
    city: '',
    address: ''
  });

  useEffect(() => {
    fetchSpecialities();
  }, []);

  const fetchSpecialities = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/specialities`);
      setSpecialities(response.data);
    } catch (error) {
      console.error('Error fetching specialities:', error);
      toast.error('Error loading specialties');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        firstname: formData.firstName,
        lastname: formData.lastName
      };
      const response = await axios.post(`${API_BASE_URL}/api/doctors/register`, payload);
      toast.success('Registration successful!');
      localStorage.setItem('doctorToken', response.data.token);
      localStorage.setItem('doctor', JSON.stringify(response.data.doctor));
      navigate('/doctor/dashboard');
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff5f5] to-[#ffebeb] py-12 px-4">
      <div className="max-w-4xl w-full bg-white p-8 rounded-xl shadow-lg border border-[#ff5a5f]/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#ff5a5f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUserMd className="text-3xl text-[#ff5a5f]" />
          </div>
          <h2 className="text-3xl font-bold text-[#ff5a5f]">Doctor Registration</h2>
          <p className="mt-2 text-gray-600">Complete your professional profile</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                  placeholder="John"
                />
                <FaUserMd className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                placeholder="email@example.com"
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <input
                type="password"
                name="password"
                id="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                placeholder="At least 6 characters"
              />
              <FaLock className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          {/* Professional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="speciality_id" className="block text-sm font-medium text-gray-700 mb-1">Specialty *</label>
              <div className="relative">
                <select
                  name="speciality_id"
                  id="speciality_id"
                  required
                  value={formData.speciality_id}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none appearance-none bg-white"
                >
                  <option value="">Select a specialty</option>
                  {specialities.map((speciality) => (
                    <option key={speciality.id} value={speciality.id}>
                      {speciality.name}
                    </option>
                  ))}
                </select>
                <FaBriefcaseMedical className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-1">Experience (Years) *</label>
              <input
                type="number"
                name="experience_years"
                id="experience_years"
                required
                min="0"
                value={formData.experience_years}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                placeholder="5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="consultation_fee" className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (DH) *</label>
              <div className="relative">
                <input
                  type="number"
                  name="consultation_fee"
                  id="consultation_fee"
                  required
                  min="0"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                  placeholder="300"
                />
                <FaMoneyBillWave className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
              <div className="relative">
                <input
                  type="text"
                  name="degree"
                  id="degree"
                  required
                  value={formData.degree}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                  placeholder="MD, PhD, etc."
                />
                <FaGraduationCap className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="specialty_description" className="block text-sm font-medium text-gray-700 mb-1">Specialty Description</label>
            <textarea
              name="specialty_description"
              id="specialty_description"
              rows="3"
              value={formData.specialty_description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
              placeholder="Describe your specialty and expertise..."
            />
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <div className="relative">
                <select
                  name="city"
                  id="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none appearance-none bg-white"
                >
                  <option value="">Select a city</option>
                  {[
                    'Casablanca', 'Rabat', 'Fes', 'Marrakech', 'Agadir',
                    'Tangier', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan',
                    'Safi', 'Mohammedia', 'El Jadida', 'Beni Mellal', 'Nador',
                    'Taza', 'Settat', 'Larache', 'Khouribga', 'Ouarzazate'
                  ].map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <FaMapMarkerAlt className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <textarea
              name="address"
              id="address"
              rows="2"
              required
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
              placeholder="Clinic/Hospital address"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 bg-[#ff5a5f] hover:bg-[#e04a50] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-colors"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorRegister;
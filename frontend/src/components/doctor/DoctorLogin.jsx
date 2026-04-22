import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserMd, FaLock, FaArrowRight, FaSpinner } from 'react-icons/fa';
import { AppContext } from '../../context/AppContext';
import { API_BASE_URL } from '../../config/api';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const { setToken } = useContext(AppContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Clear any existing tokens first
      localStorage.removeItem('patientToken');
      localStorage.removeItem('doctorToken');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      localStorage.removeItem('assistantToken');
      localStorage.removeItem('assistant');

      const response = await axios.post(`${API_BASE_URL}/api/doctors/login`, formData);
      const { token, doctor, admin, assistant, userData } = response.data;
      const normalizedAdmin =
        (admin || (userData?.role === 'admin' ? userData : null))
          ? {
              ...(admin || userData),
              role: 'admin'
            }
          : null;
      const normalizedDoctor = doctor
        ? {
            ...doctor,
            firstName: doctor.firstName || doctor.firstname || '',
            lastName: doctor.lastName || doctor.lastname || ''
          }
        : null;
      const normalizedAssistant = assistant
        ? {
            ...assistant,
            firstName: assistant.firstName || assistant.firstname || '',
            lastName: assistant.lastName || assistant.lastname || ''
          }
        : null;

      if (normalizedAdmin && (normalizedAdmin.role === 'admin' || normalizedAdmin.isAdmin)) {
        // Save admin tokens
        localStorage.setItem('adminToken', token);
        localStorage.setItem('admin', JSON.stringify(normalizedAdmin));
        setToken(token);
        toast.success('Admin logged in successfully!');
        navigate('/admin');
      } else if (normalizedDoctor) {
        // Save doctor tokens
        localStorage.setItem('doctorToken', token);
        localStorage.setItem('doctor', JSON.stringify(normalizedDoctor));
        setToken(token);
        toast.success('Logged in successfully!');
        navigate('/doctor/dashboard');
      } else if (normalizedAssistant) {
        // Save assistant tokens
        localStorage.setItem('assistantToken', token);
        localStorage.setItem('assistant', JSON.stringify(normalizedAssistant));
        setToken(token);
        toast.success('Assistant logged in successfully!');
        navigate('/assistant/dashboard');
      } else {
        toast.error('Invalid login response');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error(`Cannot reach backend at ${API_BASE_URL}. Check backend URL/server and try again.`);
      } else if (error.response && error.response.status === 401) {
        toast.error('Invalid email or password');
      } else if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error logging in');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff5f5] to-[#ffebeb] py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-[#ff5a5f]/20">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 bg-[#ff5a5f]/10 rounded-full flex items-center justify-center mb-4">
            <FaUserMd className="text-3xl text-[#ff5a5f]" />
          </div>
          <h2 className="text-3xl font-bold text-[#ff5a5f]">Doctor Login</h2>
          <p className="mt-2 text-gray-600">Access your professional dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                placeholder="Enter your password"
              />
              <FaLock className="absolute right-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#ff5a5f] focus:ring-[#ff5a5f] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <NavLink to="/temp-login" className="font-medium text-[#ff5a5f] hover:underline">
                Forgot password?
              </NavLink>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-[#ff5a5f] hover:bg-[#e04a50] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff5a5f] transition-colors"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Logging in...
              </>
            ) : (
              <>
                Login <FaArrowRight className="ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <NavLink to="/doctor/register" className="font-medium text-[#ff5a5f] hover:underline">
              Register here
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
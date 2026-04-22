import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import { FaUser, FaLock, FaSpinner } from 'react-icons/fa';
import { FiLogIn } from 'react-icons/fi';
import DoctorSidebar from '../doctor/DoctorSidebar'; // Updated import path
import { API_BASE_URL } from '../../config/api';

const AssistantLogin = () => {
  const navigate = useNavigate();
  const { setToken } = useContext(AppContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/assistants/login`, form);
      const normalizedAssistant = {
        ...res.data.assistant,
        firstName: res.data.assistant?.firstName || res.data.assistant?.firstname || '',
        lastName: res.data.assistant?.lastName || res.data.assistant?.lastname || ''
      };
      localStorage.setItem('assistantToken', res.data.token);
      localStorage.setItem('assistant', JSON.stringify(normalizedAssistant));
      setToken(res.data.token);
      toast.success('Logged in successfully!');
      navigate('/assistant/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#fff5f5] to-[#ffebeb]">
      {/* Doctor Sidebar (kept as per requirement) */}
      <DoctorSidebar />

      {/* Login Form (centered) */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-[#ff5a5f]/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#ff5a5f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiLogIn className="text-2xl text-[#ff5a5f]" />
            </div>
            <h2 className="text-2xl font-bold text-[#ff5a5f]">Assistant Login</h2>
            <p className="mt-2 text-gray-600">Access your assistant account</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                  placeholder="email@example.com"
                />
                <FaUser className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                  placeholder="Enter your password"
                />
                <FaLock className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex justify-center items-center py-3 px-4 bg-[#ff5a5f] hover:bg-[#e04a50] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-colors"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </div>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => navigate('/temp-login')}
                className="text-[#ff5a5f] hover:text-[#e04a50] font-medium"
              >
                Forgot password?
              </button>
            </div>

            <div className="text-center text-sm text-gray-500 mt-4">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/assistant/register')}
                className="text-[#ff5a5f] hover:text-[#e04a50] font-medium"
              >
                Register here
              </button>
            </div>

            
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssistantLogin;
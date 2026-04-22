import React, { useState, useContext } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaSpinner } from 'react-icons/fa';
import { API_BASE_URL } from '../config/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { setToken, setUserData } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, formData);
      const { token, userData } = response.data;
      const normalizedUserData = userData
        ? {
            ...userData,
            firstName: userData.firstName || userData.firstname || '',
            lastName: userData.lastName || userData.lastname || ''
          }
        : null;

      // Clear any existing tokens first
      localStorage.removeItem('doctorToken');
      
      // If admin login
      if (normalizedUserData && normalizedUserData.role === 'admin') {
        localStorage.setItem('adminToken', token);
        localStorage.setItem('admin', JSON.stringify(normalizedUserData));
        toast.success('Admin connecté avec succès!');
        navigate('/admin');
        setLoading(false);
        return;
      }

      // Save patient token
      localStorage.setItem('patientToken', token);
      setToken(token);

      // Save user data
      setUserData(normalizedUserData);
      localStorage.setItem('userData', JSON.stringify(normalizedUserData));

      toast.success('Connecté avec succès!');
      navigate('/my-appointments');
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error(`Impossible de joindre le backend (${API_BASE_URL}).`);
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors de la connexion');
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
            <FaUser className="text-3xl text-[#ff5a5f]" />
          </div>
          <h2 className="text-3xl font-bold text-[#ff5a5f]">Connexion</h2>
          <p className="mt-2 text-gray-600">Veuillez vous connecter à votre compte</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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
              Mot de passe
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
                minLength="6"
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
                Se souvenir de moi
              </label>
            </div>

            <div className="text-sm">
              <NavLink to="/temp-login" className="font-medium text-[#ff5a5f] hover:underline">
                Mot de passe oublié?
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
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Pas encore de compte?{' '}
            <NavLink to="/register" className="font-medium text-[#ff5a5f] hover:underline">
              Créer un compte
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
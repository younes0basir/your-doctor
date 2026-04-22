import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiDollarSign, FiMapPin, FiHome, FiLock, FiCamera, FiCheck, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import DoctorSidebar from './DoctorSidebar';
import { API_BASE_URL } from '../../config/api';

const DoctorSettings = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    specialty_description: '',
    consultation_fee: '',
    city: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    image_url: '',
    speciality_id: '',
    experience_years: '',
    degree: '',
  });

  const [specialties, setSpecialties] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [originalFormData, setOriginalFormData] = useState({});

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/doctors/specialities`);
        setSpecialties(response.data);
      } catch (error) {
        console.error('Error fetching specialties:', error);
      }
    };

    fetchSpecialties();
  }, []);

  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        const token = localStorage.getItem('doctorToken') || localStorage.getItem('token');
        if (!token) return;

        // Try to fetch fresh data from API
        const response = await axios.get(`${API_BASE_URL}/api/doctors/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const doctor = response.data;
        const updatedFormData = {
          firstName: doctor.firstName || doctor.firstname || '',
          lastName: doctor.lastName || doctor.lastname || '',
          email: doctor.email || '',
          specialty_description: doctor.specialty_description || '',
          consultation_fee: doctor.consultation_fee?.toString() || '',
          city: doctor.city || '',
          address: doctor.address || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          image_url: doctor.image_url || '',
          speciality_id: doctor.speciality_id?.toString() || '',
          experience_years: doctor.experience_years?.toString() || '',
          degree: doctor.degree || '',
        };
        setFormData(updatedFormData);
        setOriginalFormData(updatedFormData);
        if (doctor.image_url) {
          setImagePreview(doctor.image_url);
        }
        localStorage.setItem('doctor', JSON.stringify(updatedFormData));
      } catch (error) {
        console.error('Error loading doctor data:', error);
        // Fallback to localStorage if API fails
        const doctor = JSON.parse(localStorage.getItem('doctor'));
        if (doctor) {
          const updatedFormData = {
            firstName: doctor.firstName || doctor.firstname || '',
            lastName: doctor.lastName || doctor.lastname || '',
            email: doctor.email || '',
            specialty_description: doctor.specialty_description || '',
            consultation_fee: doctor.consultation_fee?.toString() || '',
            city: doctor.city || '',
            address: doctor.address || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            image_url: doctor.image_url || '',
            speciality_id: doctor.speciality_id?.toString() || '',
            experience_years: doctor.experience_years?.toString() || '',
            degree: doctor.degree || '',
          };
          setFormData(updatedFormData);
          setOriginalFormData(updatedFormData);
          if (doctor.image_url) {
            setImagePreview(doctor.image_url);
          }
        }
      }
    };

    loadDoctorData();
  }, []);

  const moroccanCities = [
    'Casablanca', 'Rabat', 'Fes', 'Marrakech', 'Agadir',
    'Tangier', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan',
    'Safi', 'Mohammedia', 'El Jadida', 'Beni Mellal', 'Nador',
    'Taza', 'Settat', 'Larache', 'Khouribga', 'Ouarzazate'
  ];

  // Smart: Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    return Math.min(strength, 5);
  };

  // Smart: Auto-format input values
  const formatValue = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      case 'consultation_fee':
        // Format as number with no decimals
        const num = parseFloat(value);
        return isNaN(num) ? '' : num.toString();
      case 'experience_years':
        const exp = parseInt(value);
        return isNaN(exp) ? '' : Math.max(0, exp).toString();
      case 'degree':
        // Auto-capitalize degree abbreviations
        return value.toUpperCase();
      default:
        return value;
    }
  };

  // Smart: Auto-save with debouncing
  const debouncedAutoSave = useCallback(
    debounce((data) => {
      if (!hasUnsavedChanges) return;
      autoSaveProfile(data);
    }, 2000),
    [hasUnsavedChanges]
  );

  // Helper debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Smart: Auto-save profile (only changed fields)
  const autoSaveProfile = async (currentFormData) => {
    try {
      setIsAutoSaving(true);
      const token = localStorage.getItem('token');

      // Only send changed fields
      const changedFields = {};
      Object.keys(currentFormData).forEach(key => {
        if (key !== 'currentPassword' && key !== 'newPassword' && key !== 'confirmPassword' && 
            key !== 'image_url' && key !== 'speciality_id' &&
            currentFormData[key] !== originalFormData[key]) {
          changedFields[key] = currentFormData[key];
        }
      });

      if (Object.keys(changedFields).length === 0) return;

      const updateData = {
        firstName: currentFormData.firstName?.trim(),
        lastName: currentFormData.lastName?.trim(),
        specialty_description: currentFormData.specialty_description?.trim(),
        consultation_fee: currentFormData.consultation_fee ? parseFloat(currentFormData.consultation_fee) : null,
        city: currentFormData.city,
        address: currentFormData.address?.trim(),
        experience_years: parseInt(currentFormData.experience_years),
        degree: currentFormData.degree?.trim(),
      };

      const response = await axios.put(
        `${API_BASE_URL}/api/doctors/profile`,
        updateData,
        {
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          }
        }
      );

      const updatedDoctor = response.data;
      setOriginalFormData(currentFormData);
      setHasUnsavedChanges(false);
      localStorage.setItem('doctor', JSON.stringify(updatedDoctor));
      toast.success('Profile auto-saved');
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const validateProfile = () => {
    const newErrors = {};
    if (!formData.firstName || !formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName || !formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.address || !formData.address.trim()) newErrors.address = 'Address is required';

    if (!formData.experience_years || isNaN(formData.experience_years) || formData.experience_years < 0) {
      newErrors.experience_years = 'Experience years must be a valid non-negative number';
    }

    if (!formData.degree || !formData.degree.trim()) newErrors.degree = 'Degree is required';

    if (formData.consultation_fee && isNaN(formData.consultation_fee)) {
      newErrors.consultation_fee = 'Must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    else if (formData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Smart: Format the value based on field type
    const formattedValue = formatValue(name, value);
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Smart: Track unsaved changes (auto-save disabled temporarily)
    if (name !== 'currentPassword' && name !== 'newPassword' && name !== 'confirmPassword') {
      setHasUnsavedChanges(true);
      // Auto-save temporarily disabled to prevent conflicts
      // debouncedAutoSave({ ...formData, [name]: formattedValue });
    }
    
    // Smart: Calculate password strength in real-time
    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(formattedValue));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        toast.error('Only JPG, PNG or GIF images are allowed');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      setIsUploading(true);
      const token = localStorage.getItem('doctorToken') || localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/doctors/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    try {
      setIsUpdating(true);
      const token = localStorage.getItem('doctorToken') || localStorage.getItem('token');

      let imageUrl = formData.image_url;
      if (imageFile) {
        try {
          const imageData = await uploadImage();
          if (imageData) {
            imageUrl = imageData.image_url;
          }
        } catch (error) {
          toast.error('Failed to upload image. Profile update cancelled.');
          return;
        }
      }

      const updateData = {
        firstName: formData.firstName?.trim() || '',
        lastName: formData.lastName?.trim() || '',
        specialty_description: formData.specialty_description?.trim() || '',
        consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : null,
        city: formData.city || '',
        address: formData.address?.trim() || '',
        image_url: imageUrl,
        experience_years: parseInt(formData.experience_years) || 0,
        degree: formData.degree?.trim() || '',
      };

      const response = await axios.put(
        `${API_BASE_URL}/api/doctors/profile`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      const updatedDoctor = response.data;
      setFormData(prev => ({
        ...prev,
        ...updatedDoctor,
        consultation_fee: updatedDoctor.consultation_fee?.toString() || '',
        experience_years: updatedDoctor.experience_years?.toString() || ''
      }));

      localStorage.setItem('doctor', JSON.stringify(updatedDoctor));
      setOriginalFormData({ ...formData, ...updatedDoctor });
      setHasUnsavedChanges(false);
      toast.success('Profile updated successfully');

      setImageFile(null);
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.details || 'Error updating profile';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      setIsChangingPassword(true);
      const token = localStorage.getItem('doctorToken') || localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/doctors/change-password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Password changed successfully');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setPasswordStrength(0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error changing password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <DoctorSidebar />
      
      <div className="flex-1 flex flex-col h-screen">
        <div className="bg-white shadow-sm p-6 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Account Settings</h1>
            <div className="flex items-center space-x-2">
              {isAutoSaving && (
                <div className="flex items-center text-sm text-blue-600">
                  <FiRefreshCw className="animate-spin mr-2" />
                  Auto-saving...
                </div>
              )}
              {hasUnsavedChanges && !isAutoSaving && (
                <div className="flex items-center text-sm text-orange-500">
                  <FiAlertCircle className="mr-2" />
                  Unsaved changes
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
                {isUploading && (
                  <span className="text-sm text-blue-600">Uploading image...</span>
                )}
              </div>
              
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-md">
                      {imagePreview || formData.image_url ? (
                        <img
                          src={imagePreview || formData.image_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <FiUser className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="profile-image"
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors group-hover:opacity-100"
                      title="Change photo"
                    >
                      <FiCamera className="w-4 h-4" />
                    </label>
                    <input
                      type="file"
                      id="profile-image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FiUser className="mr-2 text-gray-400" /> First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FiUser className="mr-2 text-gray-400" /> Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiMail className="mr-2 text-gray-400" /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialty Description</label>
                  <textarea
                    name="specialty_description"
                    value={formData.specialty_description}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full px-4 py-2 rounded-lg border ${errors.specialty_description ? 'border-red-500' : 'border-gray-300'} focus:outline-none`}
                    placeholder="Your medical specialty and expertise"
                  />
                  {errors.specialty_description && <p className="mt-1 text-sm text-red-600">{errors.specialty_description}</p>}
                </div>

                <div>
                  <label htmlFor="speciality_id" className="block text-sm font-medium text-gray-700">Specialty</label>
                  <select
                    id="speciality_id"
                    name="speciality_id"
                    value={formData.speciality_id}
                    onChange={handleChange}
                    disabled
                    className={`mt-1 block w-full border ${errors.speciality_id ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 cursor-not-allowed`}
                  >
                    <option value="">Select a specialty</option>
                    {specialties.map((specialty) => (
                      <option key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </option>
                    ))}
                  </select>
                  {errors.speciality_id && <p className="mt-2 text-sm text-red-600">{errors.speciality_id}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FiDollarSign className="mr-2 text-gray-400" /> Consultation Fee (MAD)
                    </label>
                    <input
                      type="text"
                      name="consultation_fee"
                      value={formData.consultation_fee}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.consultation_fee ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="300"
                    />
                    {errors.consultation_fee && <p className="mt-1 text-sm text-red-600">{errors.consultation_fee}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FiMapPin className="mr-2 text-gray-400" /> City
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.city ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      <option value="">Select your city</option>
                      {moroccanCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiHome className="mr-2 text-gray-400" /> Clinic Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className={`w-full px-4 py-2 rounded-lg border ${errors.address ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter your clinic address"
                  />
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700">Experience Years</label>
                    <input
                      type="number"
                      name="experience_years"
                      id="experience_years"
                      value={formData.experience_years}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g., 10"
                    />
                    {errors.experience_years && <p className="mt-2 text-sm text-red-600">{errors.experience_years}</p>}
                  </div>
                  <div>
                    <label htmlFor="degree" className="block text-sm font-medium text-gray-700">Degree</label>
                    <input
                      type="text"
                      name="degree"
                      id="degree"
                      value={formData.degree}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g., MD, PhD"
                    />
                    {errors.degree && <p className="mt-2 text-sm text-red-600">{errors.degree}</p>}
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isUploading || isUpdating}
                    className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center ${
                      (isUploading || isUpdating) ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUpdating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiCheck className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiLock className="mr-2 text-gray-400" /> Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiLock className="mr-2 text-gray-400" /> New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                  {formData.newPassword && !errors.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              passwordStrength <= 1 ? 'bg-red-500' :
                              passwordStrength <= 2 ? 'bg-orange-500' :
                              passwordStrength <= 3 ? 'bg-yellow-500' :
                              passwordStrength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {passwordStrength <= 1 ? 'Weak' :
                           passwordStrength <= 2 ? 'Fair' :
                           passwordStrength <= 3 ? 'Good' :
                           passwordStrength <= 4 ? 'Strong' : 'Very Strong'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiLock className="mr-2 text-gray-400" /> Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
                
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center ${
                      isChangingPassword ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isChangingPassword ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;
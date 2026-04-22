import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import userIcon from "../assets/user_icon.svg";
import AppointmentBooking from "../components/appointments/AppointmentBooking";
import { 
  FaStethoscope, 
  FaMapMarkerAlt, 
  FaMoneyBillAlt, 
  FaClock,
  FaUserMd,
  FaHospital,
  FaGraduationCap,
  FaStar,
  FaCalendarAlt,
  FaCheckCircle,
  FaMoneyBillWave,
  FaInfoCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import { FiLoader } from "react-icons/fi";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { API_BASE_URL } from '../config/api';

const Appointment = () => {
  const { docId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (docId) {
      fetchDoctorInfo();
    } else {
      setLoading(false);
      setError("Doctor ID is required");
    }
  }, [docId]);

  const fetchDoctorInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`${API_BASE_URL}/api/doctors/${docId}`);
      if (!data) throw new Error("Doctor not found");
      setDoctor(data);
    } catch (err) {
      console.error("Error fetching doctor info:", err);
      setError("Failed to load doctor information");
      toast.error("Error loading doctor information");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="animate-spin h-12 w-12 text-[#3a86ff]" />
          <p className="text-lg text-gray-600">Loading doctor information...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-red-800">{error}</h3>
          <p className="mt-2 text-gray-600">
            Please check the doctor ID and try again.
          </p>
        </div>
      </div>
    );

  if (!doctor)
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white p-8 rounded-xl shadow-md text-center border border-gray-100">
          <FaUserMd className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-800">
            Doctor not found
          </h3>
          <p className="mt-2 text-gray-600">
            The requested doctor profile could not be found.
          </p>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
          <li className="inline-flex items-center">
            <a href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#3a86ff]">
              Home
            </a>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <a href="/doctors" className="ml-1 text-sm font-medium text-gray-500 hover:text-[#3a86ff] md:ml-2">
                Doctors
              </a>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-400 md:ml-2">
                {doctor.firstName} {doctor.lastName}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Doctor Profile Section */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Doctor Image and Basic Info */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all hover:shadow-md">
            <div className="relative pt-[100%] bg-gradient-to-br from-gray-50 to-gray-100">
              <img
                src={doctor.image_url || userIcon}
                alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                className="absolute top-0 left-0 w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = userIcon;
                }}
              />
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Dr. {doctor.firstName} {doctor.lastName}
              </h1>
              
              <div className="flex items-center mt-2">
                <div className="flex items-center text-yellow-500 mr-3">
                  <FaStar className="mr-1" />
                  <span className="font-medium">4.8</span>
                  <span className="text-gray-500 text-sm ml-1">(124)</span>
                </div>
                <span className="text-[#3a86ff] bg-[#3a86ff]/10 px-3 py-1 rounded-full text-sm font-medium">
                  {doctor.specialityName}
                </span>
              </div>
              
              {/* Quick Info */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-[#3a86ff] w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{doctor.city || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaMoneyBillAlt className="text-[#3a86ff] w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Consultation Fee</p>
                    <p className="font-medium">{doctor.consultation_fee || '--'} DH</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaClock className="text-[#3a86ff] w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Average Wait Time</p>
                    <p className="font-medium">15-30 mins</p>
                  </div>
                </div>
              </div>
              
              {/* Verified Badge */}
              <div className="mt-6 flex items-center bg-green-50 p-3 rounded-lg">
                <IoMdCheckmarkCircleOutline className="text-green-500 w-6 h-6 mr-2" />
                <span className="text-sm text-green-700">Verified professional</span>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Details and Appointment */}
        <div className="w-full lg:w-2/3">
          {/* About Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100 transition-all hover:shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">About Dr. {doctor.lastName}</h2>
            <p className="text-gray-600 leading-relaxed">
              {doctor.specialty_description || 'No description available.'}
            </p>
            
            {/* Detailed Info */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="bg-[#3a86ff]/10 p-2 rounded-lg mr-4">
                  <FaStethoscope className="text-[#3a86ff] w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Specialization</h3>
                  <p className="text-gray-600 mt-1">{doctor.specialityName || 'General Practitioner'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-[#3a86ff]/10 p-2 rounded-lg mr-4">
                  <FaClock className="text-[#3a86ff] w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Experience</h3>
                  <p className="text-gray-600 mt-1">{doctor.experience_years || '--'} years</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-[#3a86ff]/10 p-2 rounded-lg mr-4">
                  <FaHospital className="text-[#3a86ff] w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Practice Location</h3>
                  <p className="text-gray-600 mt-1">{doctor.city || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-[#3a86ff]/10 p-2 rounded-lg mr-4">
                  <FaGraduationCap className="text-[#3a86ff] w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Education</h3>
                  <p className="text-gray-600 mt-1">MD, University of Medical Sciences</p>
                </div>
              </div>
            </div>
            
            {/* Languages Spoken */}
            <div className="mt-8">
              <h3 className="font-medium text-gray-700 mb-3">Languages Spoken</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">English</span>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">French</span>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Arabic</span>
              </div>
            </div>
          </div>

          {/* Appointment Booking Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            {/* Header with icon and availability indicator */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center">
                <div className="bg-[#3a86ff]/10 p-2 rounded-lg mr-3">
                  <FaCalendarAlt className="text-[#3a86ff] w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Book an Appointment</h2>
              </div>
              <div className="flex items-center text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full">
                <FaCheckCircle className="mr-2" />
                <span>Available today</span>
              </div>
            </div>

            {/* Consultation Fee Card */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-blue-600 font-medium">Consultation Fee</p>
                <p className="text-2xl font-bold text-gray-800">
                  {doctor.consultation_fee || '--'} DH
                </p>
                <p className="text-xs text-blue-600 mt-1">Payment at clinic</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-xs">
                <FaMoneyBillWave className="text-blue-500 w-6 h-6" />
              </div>
            </div>

            {/* Appointment Booking Component */}
            <div className="space-y-1 mb-4">
              <h3 className="text-sm font-medium text-gray-700">Select Date & Time</h3>
              <p className="text-xs text-gray-500">Available slots are shown in your local time</p>
            </div>
            
            <AppointmentBooking
              doctorId={docId}
              doctorName={`Dr. ${doctor.firstName} ${doctor.lastName}`}
              consultationFee={doctor.consultation_fee}
              onSuccess={() => {
                toast.success(
                  <div>
                    <p className="font-medium">Appointment booked successfully!</p>
                    <p className="text-sm mt-1">You'll receive a confirmation shortly.</p>
                  </div>,
                  { autoClose: 3000 }
                );
              }}
            />

            {/* Additional Information */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-start">
                <FaInfoCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Important Information</h4>
                  <ul className="mt-2 space-y-2 text-xs text-gray-600 list-disc list-inside">
                    <li>Please arrive 10 minutes before your appointment</li>
                    <li>Bring your ID and insurance card if applicable</li>
                    <li>Cancellation policy: 24 hours notice required</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Emergency Notice */}
            <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-3 flex items-start">
              <FaExclamationTriangle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-xs text-red-700">
                For medical emergencies, please call emergency services immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  FiCalendar, 
  FiUser, 
  FiVideo, 
  FiMonitor, 
  FiClock,
  FiPhone,
  FiX,
  FiLoader,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { API_BASE_URL } from '../config/api';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const patientToken = localStorage.getItem('patientToken');
      
      if (!patientToken) {
        toast.error('Veuillez vous connecter pour voir vos rendez-vous');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/appointments/patient`, {
        headers: { 
          'patient-token': patientToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      // Normalize backend field differences (snake_case/camelCase/lowercase)
      const formattedAppointments = Array.isArray(response.data) 
        ? response.data.map(appt => ({
            ...appt,
            id: appt.id?.toString() || Math.random().toString(36).substring(2, 9),
            doctor_firstName: appt.doctor_firstName || appt.doctorFirstName || appt.doctor_firstname || appt.doctorfirstname || '',
            doctor_lastName: appt.doctor_lastName || appt.doctorLastName || appt.doctor_lastname || appt.doctorlastname || '',
            doctor_speciality: appt.doctor_speciality || appt.doctorSpeciality || appt.speciality || appt.specialty || '',
            appointment_date: appt.appointment_date || appt.appointmentDate || appt.date || null
          }))
        : [];
      
      setAppointments(formattedAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('patientToken');
        toast.error('Session expirée. Veuillez vous reconnecter');
        navigate('/login');
      } else {
        setError('Échec du chargement des rendez-vous');
        toast.error('Erreur lors du chargement des rendez-vous');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous?')) {
      return;
    }

    try {
      const patientToken = localStorage.getItem('patientToken');
      if (!patientToken) {
        toast.error('Veuillez vous connecter pour annuler des rendez-vous');
        navigate('/login');
        return;
      }

      await axios.put(
        `${API_BASE_URL}/api/appointments/${appointmentId}/cancel`, 
        {},
        {
          headers: { 
            'patient-token': patientToken,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment.id === appointmentId
            ? { ...appointment, status: 'cancelled' }
            : appointment
        )
      );

      toast.success('Rendez-vous annulé avec succès');
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('patientToken');
        toast.error('Session expirée. Veuillez vous reconnecter');
        navigate('/login');
      } else {
        toast.error("Erreur lors de l'annulation du rendez-vous");
      }
    }
  };

  const canJoinVideoCall = (appointment) => {
    return appointment.type === 'video' && 
           appointment.status !== 'cancelled' && 
           appointment.status !== 'completed';
  };

  const formatAppointmentDate = (value, dateFormat) => {
    if (!value) return 'Date non disponible';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Date invalide';
    return format(parsed, dateFormat);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FiCheckCircle className="text-green-500" />;
      case 'cancelled':
        return <FiX className="text-red-500" />;
      case 'completed':
        return <FiCheckCircle className="text-gray-500" />;
      default:
        return <FiClock className="text-yellow-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Mes Rendez-vous
        </h1>
        <button 
          onClick={() => navigate('/list-of-doctors')}
          className="px-4 py-2 bg-[#ff5a5f] text-white rounded-lg hover:bg-[#ff7a7f] transition-colors"
        >
          Prendre un nouveau rendez-vous
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="flex flex-col items-center gap-4">
            <FiLoader className="animate-spin h-12 w-12 text-[#ff5a5f]" />
            <p className="text-lg text-gray-600">Chargement de vos rendez-vous...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <div className="flex items-center">
            <FiAlertCircle className="h-6 w-6 text-red-500 mr-4" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Erreur de chargement</h3>
              <p className="mt-1 text-gray-600">
                Nous n'avons pas pu charger vos rendez-vous. Veuillez réessayer.
              </p>
              <button
                onClick={fetchAppointments}
                className="mt-4 px-4 py-2 bg-[#ff5a5f] text-white rounded-lg hover:bg-[#ff7a7f] transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <FiCalendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">Aucun rendez-vous trouvé</h3>
          <p className="mt-2 text-gray-600 mb-6">
            Vous n'avez pas encore pris de rendez-vous.
          </p>
          <button
            onClick={() => navigate('/list-of-doctors')}
            className="px-6 py-2 bg-[#ff5a5f] text-white rounded-lg hover:bg-[#ff7a7f] transition-colors"
          >
            Trouver un médecin
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {appointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Appointment Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(appointment.status)}
                    <span className={`ml-2 font-medium ${
                      appointment.status === 'cancelled' ? 'text-red-600' :
                      appointment.status === 'completed' ? 'text-gray-600' :
                      appointment.status === 'confirmed' ? 'text-green-600' :
                      'text-yellow-600'
                    }`}>
                      {appointment.status === 'cancelled' ? 'Annulé' :
                       appointment.status === 'completed' ? 'Terminé' :
                       appointment.status === 'confirmed' ? 'Confirmé' :
                       'En attente'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    Réf: {appointment.id.toString().slice(0, 8)}
                  </span>
                </div>
              </div>

              {/* Appointment Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Doctor Info */}
                  <div className="flex items-start">
                    <div className="bg-[#ff5a5f]/10 p-3 rounded-lg mr-4">
                      <FiUser className="text-[#ff5a5f] w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Médecin</h3>
                      <p className="text-lg font-semibold text-gray-800 mt-1">
                        Dr. {appointment.doctor_firstName} {appointment.doctor_lastName}
                      </p>
                      <p className="text-gray-600 mt-1">
                        {appointment.doctor_speciality || 'Généraliste'}
                      </p>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-[#ff5a5f]/10 p-3 rounded-lg mr-4">
                        <FiCalendar className="text-[#ff5a5f] w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Date & Heure</h3>
                        <p className="text-lg font-semibold text-gray-800 mt-1">
                          {formatAppointmentDate(appointment.appointment_date, "EEEE d MMMM yyyy")}
                        </p>
                        <p className="text-gray-600">
                          à {formatAppointmentDate(appointment.appointment_date, "HH:mm")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-[#ff5a5f]/10 p-3 rounded-lg mr-4">
                        {appointment.type === 'video' ? (
                          <FiVideo className="text-[#ff5a5f] w-5 h-5" />
                        ) : (
                          <FiMonitor className="text-[#ff5a5f] w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Type de consultation</h3>
                        <p className="text-lg font-semibold text-gray-800 mt-1">
                          {appointment.type === 'video' ? 'Téléconsultation' : 'Consultation en cabinet'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Status Badge Only */}
                <div className="mt-4 flex items-center gap-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    appointment.payment_status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    Statut de paiement : {appointment.payment_status === 'paid' ? 'Payé' : 'Non payé'}
                  </span>
                  {appointment.payment_status !== 'paid' && (
                    <button
                      className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => navigate(`/payement/${appointment.id}`)}
                    >
                      Payer
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  {canJoinVideoCall(appointment) && (
                    <button
                      onClick={() => navigate(`/video-appointment/${appointment.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#ff5a5f] text-white rounded-lg hover:bg-[#ff7a7f] transition-colors"
                    >
                      <FiVideo className="w-5 h-5" />
                      Rejoindre la téléconsultation
                    </button>
                  )}

                  {appointment.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                      Annuler le rendez-vous
                    </button>
                  )}

                  {appointment.status === 'confirmed' && appointment.type !== 'video' && (
                    <button
                      onClick={() => navigate(`/doctor/${appointment.doctor_id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#ff5a5f] text-[#ff5a5f] rounded-lg hover:bg-[#ff5a5f]/10 transition-colors"
                    >
                      <FiPhone className="w-5 h-5" />
                      Contacter le cabinet
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const AppointmentList = ({ userId, userRole }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [userId, userRole]);

  const fetchAppointments = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const endpoint = userRole === 'doctor' 
        ? `/api/appointments/doctor/${userId}`
        : `/api/appointments/patient/${userId}`;
      
      const response = await axios.get(
        `${API_BASE_URL}${endpoint}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Ensure we have an array of appointments
      const appointmentsData = Array.isArray(response.data) ? response.data : [];
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError(error.message || 'Erreur lors du chargement des rendez-vous');
      toast.error('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.put(
        `${API_BASE_URL}/api/appointments/${appointmentId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Statut du rendez-vous mis à jour');
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const deleteAppointment = async (appointmentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(
        `${API_BASE_URL}/api/appointments/${appointmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Rendez-vous supprimé avec succès');
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Erreur lors de la suppression du rendez-vous');
    }
  };

  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>Une erreur est survenue:</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!Array.isArray(appointments)) {
    console.error('Appointments is not an array:', appointments);
    return (
      <div className="text-center text-red-600">
        <p>Erreur: Format de données incorrect</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Mes Rendez-vous</h2>
        <p>Aucun rendez-vous trouvé</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Mes Rendez-vous</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <div className="mb-2">
              <span className="font-semibold">Date: </span>
              {new Date(appointment.appointment_date).toLocaleString()}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Type: </span>
              {appointment.type === 'physical' ? 'Physique' : 'Vidéo'}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Statut: </span>
              <span className={`
                px-2 py-1 rounded-full text-sm
                ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  appointment.status === 'canceled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'}
              `}>
                {appointment.status === 'confirmed' ? 'Confirmé' :
                  appointment.status === 'pending' ? 'En attente' :
                  appointment.status === 'canceled' ? 'Annulé' : 
                  appointment.status}
              </span>
            </div>
            {userRole === 'doctor' && (
              <div className="mb-2">
                <span className="font-semibold">Patient: </span>
                {`${appointment.firstName} ${appointment.lastName}`}
              </div>
            )}
            {userRole === 'patient' && (
              <div className="mb-2">
                <span className="font-semibold">Médecin: </span>
                {`Dr. ${appointment.doctorFirstName} ${appointment.doctorLastName}`}
                <div className="text-sm text-gray-600">{appointment.specialityName}</div>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              {appointment.status === 'pending' && (
                <>
                  <button
                    onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => updateAppointmentStatus(appointment.id, 'canceled')}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Annuler
                  </button>
                </>
              )}
              <button
                onClick={() => deleteAppointment(appointment.id)}
                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentList;

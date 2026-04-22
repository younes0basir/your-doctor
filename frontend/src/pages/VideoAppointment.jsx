import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import VideoCall from '../components/video/VideoCall';

const VideoAppointment = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointmentDetails();
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.type !== 'video') {
        toast.error('This is not a video appointment');
        navigate('/my-appointments');
        return;
      }
      
      setAppointment(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch appointment details');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Video Consultation</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Appointment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Doctor</p>
                <p className="font-medium">Dr. {appointment?.doctorName}</p>
              </div>
              <div>
                <p className="text-gray-600">Date & Time</p>
                <p className="font-medium">
                  {new Date(appointment?.appointmentDate).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <VideoCall appointmentId={appointmentId} role="patient" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAppointment;

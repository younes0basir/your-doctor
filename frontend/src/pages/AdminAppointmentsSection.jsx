import React from 'react';

const AdminAppointmentsSection = ({
  appointments,
  appointmentsLoading,
  handleEditAppointment,
  handleDeleteAppointment
}) => (
  <div className="w-full max-w-5xl mx-auto">
    <h1 className="text-2xl font-bold mb-4 text-center text-[#3ba7a7]">Manage Appointments</h1>
    {appointmentsLoading ? (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#56c3c3]"></div>
      </div>
    ) : (
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-[#56c3c3] text-white">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Doctor</th>
              <th className="px-4 py-2">Patient</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt, idx) => {
              const dateObj = new Date(appt.appointment_date);
              return (
                <tr key={appt.id} className={idx % 2 === 0 ? 'bg-[#e6f6f6]' : ''}>
                  <td className="border px-4 py-2">{appt.id}</td>
                  <td className="border px-4 py-2">{appt.doctorName}</td>
                  <td className="border px-4 py-2">{appt.patientName}</td>
                  <td className="border px-4 py-2">{dateObj.toLocaleDateString()}</td>
                  <td className="border px-4 py-2">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="border px-4 py-2 capitalize">{appt.type}</td>
                  <td className="border px-4 py-2 capitalize">{appt.status}</td>
                  <td className="border px-4 py-2">
                    <button
                      className="bg-[#56c3c3] hover:bg-[#3ba7a7] text-white px-3 py-1 rounded mr-2"
                      onClick={() => handleEditAppointment({
                        ...appt,
                        doctor_id: appt.doctor_id || '',
                        patient_id: appt.patient_id || '',
                        appointment_date: appt.appointment_date ? appt.appointment_date.slice(0, 16) : '',
                      })}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-[#56c3c3] hover:bg-[#3ba7a7] text-white px-3 py-1 rounded"
                      onClick={() => handleDeleteAppointment(appt.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default AdminAppointmentsSection;

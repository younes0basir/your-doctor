import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiPrinter,
  FiSave,
  FiUser,
  FiPhone,
  FiCalendar,
  FiFileText,
  FiLoader
} from 'react-icons/fi';
import DoctorSidebar from './DoctorSidebar';
import { API_BASE_URL } from '../../config/api';

// const Ordonnance = () => {
//   const { appointmentId } = useParams();
//   const [doctorInfo, setDoctorInfo] = useState(null);
//   const [prescription, setPrescription] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [patientInfo, setPatientInfo] = useState(null);

//   useEffect(() => {
//     fetchDoctorInfo();
//     fetchPatientInfo();
//   }, []);

//   const fetchDoctorInfo = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/api/doctors/profile`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setDoctorInfo(response.data);
//       setLoading(false);
//     } catch (error) {
//       toast.error('Failed to fetch doctor information');
//       setLoading(false);
//     }
//   };

//   const fetchPatientInfo = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/appointments/${appointmentId}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setPatientInfo(response.data);
//     } catch (error) {
//       toast.error('Failed to fetch patient info');
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post(`${API_BASE_URL}/prescriptions`, {
//         appointmentId,
//         prescription_text: prescription,
//       }, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       toast.success('Prescription created successfully');
//     } catch (error) {
//       toast.error('Failed to create prescription');
//     }
//   };

//   const handlePrint = () => {
//     const printContent = document.getElementById('printable-ordonnance');
//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Ordonnance Médicale</title>
//           <style>
//             @page { 
//               size: A4; 
//               margin: 0;
//             }
//             body { 
//               font-family: 'Times New Roman', Times, serif;
//               margin: 0;
//               padding: 0;
//               color: #000;
//               font-size: 14pt;
//               line-height: 1.5;
//             }
//             .page {
//               width: 210mm;
//               min-height: 297mm;
//               padding: 20mm;
//               margin: 0 auto;
//               position: relative;
//             }
//             .header {
//               display: flex;
//               justify-content: space-between;
//               margin-bottom: 15mm;
//               border-bottom: 1px solid #ccc;
//               padding-bottom: 5mm;
//             }
//             .doctor-info {
//               flex: 1;
//             }
//             .doctor-name {
//               font-size: 18pt;
//               font-weight: bold;
//               margin-bottom: 2mm;
//             }
//             .specialty {
//               font-style: italic;
//               margin-bottom: 2mm;
//             }
//             .contact-info {
//               margin-bottom: 2mm;
//             }
//             .ordonnance-label {
//               text-align: center;
//               font-weight: bold;
//               font-size: 16pt;
//               margin: 5mm 0;
//               text-decoration: underline;
//             }
//             .patient-info {
//               margin-bottom: 10mm;
//             }
//             .patient-info-grid {
//               display: grid;
//               grid-template-columns: 1fr 1fr;
//               gap: 5mm;
//             }
//             .info-label {
//               font-weight: bold;
//             }
//             .prescription-content {
//               border: 1px solid #000;
//               min-height: 120mm;
//               padding: 5mm;
//               margin-bottom: 10mm;
//               white-space: pre-wrap;
//             }
//             .signature-area {
//               text-align: right;
//               margin-top: 20mm;
//             }
//             .signature-line {
//               display: inline-block;
//               width: 80mm;
//               border-top: 1px solid #000;
//               margin-bottom: 2mm;
//             }
//             .signature-text {
//               font-size: 12pt;
//             }
//             .footer {
//               position: absolute;
//               bottom: 10mm;
//               width: calc(100% - 40mm);
//               font-size: 10pt;
//               text-align: center;
//               color: #666;
//             }
//             @media print {
//               body { 
//                 -webkit-print-color-adjust: exact;
//                 print-color-adjust: exact;
//               }
//               .no-print {
//                 display: none !important;
//               }
//             }
//           </style>
//         </head>
//         <body>
//           <div class="page">
//             ${printContent.innerHTML}
//           </div>
//           <script>
//             window.onload = function() {
//               setTimeout(function() {
//                 window.print();
//                 window.close();
//               }, 200);
//             }
//           </script>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <FiLoader className="animate-spin h-12 w-12 text-[#ff5a5f] mx-auto mb-4" />
//           <p className="text-gray-600">Loading prescription form...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <DoctorSidebar />
//       <div className="flex-1 p-6 overflow-auto">
//         <div className="max-w-4xl mx-auto">
//           {/* Printable content */}
//           <div id="printable-ordonnance" className="hidden">
//             <div className="header">
//               <div className="doctor-info">
//                 <div className="doctor-name">Dr. {doctorInfo?.firstName} {doctorInfo?.lastName}</div>
//                 <div className="specialty">{doctorInfo?.specialty_description}</div>
//                 <div className="contact-info">
//                   <div>Tél: {doctorInfo?.phone}</div>
//                   <div>{doctorInfo?.address}</div>
//                 </div>
//               </div>
//               <div className="date-info">
//                 <div>Le: {new Date().toLocaleDateString('fr-FR')}</div>
//               </div>
//             </div>

//             <div className="ordonnance-label">ORDONNANCE MÉDICALE</div>

//             <div className="patient-info">
//               <div className="patient-info-grid">
//                 <div>
//                   <div className="info-label">Nom du patient:</div>
//                   <div>{patientInfo?.patient_firstName} {patientInfo?.patient_lastName}</div>
//                 </div>
//                 <div>
//                   <div className="info-label">Date de naissance:</div>
//                   <div>{patientInfo?.birthDate || 'Non spécifié'}</div>
//                 </div>
//                 <div>
//                   <div className="info-label">Téléphone:</div>
//                   <div>{patientInfo?.phoneNumber}</div>
//                 </div>
//               </div>
//             </div>

//             <div className="prescription-content">
//               {prescription || (
//                 <div style={{ color: '#999', fontStyle: 'italic' }}>
//                   [Contenu de la prescription à rédiger ici...]
//                 </div>
//               )}
//             </div>

//             <div className="signature-area">
//               <div className="signature-line"></div>
//               <div className="signature-text">Signature et cachet du médecin</div>
//             </div>

//             <div className="footer">
//               Ordonnance valable pour 30 jours à compter de la date d'émission • Numéro RPPS: {doctorInfo?.rppsNumber || 'XXXXXXX'}
//             </div>
//           </div>

//           {/* Editable content */}
//           <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//             <div className="bg-gradient-to-r from-[#ff5a5f] to-[#e04a50] px-8 py-6 text-white">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h1 className="text-2xl font-bold">Dr. {doctorInfo?.firstName} {doctorInfo?.lastName}</h1>
//                   <p className="mt-1">{doctorInfo?.specialty_description}</p>
//                   <div className="mt-4 flex items-center">
//                     <FiPhone className="mr-2" />
//                     <span>{doctorInfo?.phone}</span>
//                   </div>
//                   <p className="mt-1">{doctorInfo?.address}</p>
//                 </div>
//                 <div className="text-right">
//                   <div className="flex items-center justify-end">
//                     <FiCalendar className="mr-2" />
//                     <span>{new Date().toLocaleDateString('fr-FR')}</span>
//                   </div>
//                   <div className="mt-4 bg-white bg-opacity-20 px-3 py-1 rounded-full inline-block">
//                     <span className="text-sm font-medium">ORDONNANCE</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="border-b border-gray-200 px-8 py-6">
//               <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                 <FiUser className="mr-2 text-[#ff5a5f]" />
//                 Patient Information
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-gray-500 text-sm">Nom complet</p>
//                   <p className="font-medium">
//                     {patientInfo?.patient_firstName} {patientInfo?.patient_lastName}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 text-sm">Téléphone</p>
//                   <p className="font-medium">{patientInfo?.phoneNumber}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 text-sm">Date de naissance</p>
//                   <p className="font-medium">{patientInfo?.birthDate || 'Non spécifié'}</p>
//                 </div>
//               </div>
//             </div>

//             <form onSubmit={handleSubmit} className="px-8 py-6">
//               <div className="mb-6">
//                 <label htmlFor="prescription" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
//                   <FiFileText className="mr-2 text-[#ff5a5f]" />
//                   Prescription Médicale
//                 </label>
//                 <textarea
//                   id="prescription"
//                   rows={12}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] font-mono"
//                   value={prescription}
//                   onChange={(e) => setPrescription(e.target.value)}
//                   placeholder={`Exemple:\n\nDoliprane 1000mg\n1 comprimé, 3 fois par jour pendant 5 jours\n\nSpasfon 80mg\n1 comprimé à prendre en cas de douleurs\n\nRenouvelable 1 fois`}
//                 />
//               </div>

//               <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
//                 <div>
//                   <p className="text-sm text-gray-500">
//                     Cette ordonnance est valable pour 30 jours à partir de la date d'émission.
//                   </p>
//                 </div>
//                 <div className="flex space-x-3">
//                   <button
//                     type="button"
//                     onClick={handlePrint}
//                     className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//                   >
//                     <FiPrinter className="mr-2" />
//                     Imprimer
//                   </button>
//                   <button
//                     type="submit"
//                     className="flex items-center px-4 py-2 bg-[#ff5a5f] text-white rounded-lg hover:bg-[#e04a50] transition-colors"
//                   >
//                     <FiSave className="mr-2" />
//                     Enregistrer
//                   </button>
//                 </div>
//               </div>
//             </form>

//             <div className="px-8 py-6 border-t border-gray-200">
//               <div className="flex justify-end">
//                 <div className="text-center">
//                   <div className="border-t-2 border-[#ff5a5f] w-32 mb-2"></div>
//                   <p className="text-sm text-gray-600">Signature et cachet du médecin</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Ordonnance;




const Ordonnance = () => {
  const { appointmentId } = useParams();
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [prescription, setPrescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState(null);
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '', notes: '' }
  ]);

  const patientFirstName =
    patientInfo?.patient_firstName ||
    patientInfo?.patientFirstName ||
    patientInfo?.firstName ||
    patientInfo?.firstname ||
    '';
  const patientLastName =
    patientInfo?.patient_lastName ||
    patientInfo?.patientLastName ||
    patientInfo?.lastName ||
    patientInfo?.lastname ||
    '';

  useEffect(() => {
    fetchDoctorInfo();
    fetchPatientInfo();
  }, []);

  const fetchDoctorInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/doctors/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDoctorInfo(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch doctor information');
      setLoading(false);
    }
  };

  const fetchPatientInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPatientInfo(response.data);
    } catch (error) {
      toast.error('Failed to fetch patient info');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const prescriptionText = generatePrescriptionText();
      await axios.post(`${API_BASE_URL}/api/prescriptions`, {
        appointmentId,
        prescription_text: prescriptionText,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Prescription created successfully');
    } catch (error) {
      toast.error('Failed to create prescription');
    }
  };

  const generatePrescriptionText = () => {
    let text = "MÉDICAMENTS PRESCRITS:\n\n";
    medications.forEach((med, index) => {
      if (med.name) {
        text += `${med.name} ${med.dosage}:\n`;
        text += `- Posologie: ${med.frequency}\n`;
        text += `- Durée: ${med.duration}\n`;
        if (med.notes) text += `- Remarques: ${med.notes}\n`;
        text += "\n";
      }
    });
    text += prescription ? `\nINSTRUCTIONS COMPLÉMENTAIRES:\n${prescription}` : '';
    return text;
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMeds = [...medications];
    updatedMeds[index][field] = value;
    setMedications(updatedMeds);
  };

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', notes: '' }]);
  };

  const removeMedication = (index) => {
    if (medications.length > 1) {
      const updatedMeds = [...medications];
      updatedMeds.splice(index, 1);
      setMedications(updatedMeds);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-ordonnance');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Ordonnance Médicale</title>
          <style>
            @page { 
              size: A4; 
              margin: 15mm 15mm 15mm 25mm;
            }
            body { 
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              color: #000;
              font-size: 12pt;
              line-height: 1.4;
            }
            .header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10mm;
              padding-bottom: 3mm;
              border-bottom: 1px solid #000;
            }
            .doctor-info {
              flex: 1;
            }
            .doctor-name {
              font-size: 14pt;
              font-weight: bold;
              margin-bottom: 1mm;
            }
            .specialty {
              font-size: 12pt;
              margin-bottom: 2mm;
            }
            .contact-info {
              font-size: 11pt;
            }
            .ordonnance-title {
              text-align: center;
              font-weight: bold;
              font-size: 16pt;
              margin: 5mm 0 8mm 0;
              text-decoration: underline;
            }
            .patient-info {
              margin-bottom: 8mm;
            }
            .patient-info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 3mm;
              font-size: 11pt;
            }
            .info-label {
              font-weight: bold;
            }
            .medication-table {
              width: 100%;
              border-collapse: collapse;
              margin: 5mm 0 10mm 0;
              font-size: 11pt;
            }
            .medication-table th {
              border: 1px solid #000;
              padding: 2mm;
              text-align: left;
              background-color: #f0f0f0;
            }
            .medication-table td {
              border: 1px solid #000;
              padding: 2mm;
              vertical-align: top;
            }
            .additional-notes {
              margin-top: 5mm;
              font-size: 11pt;
            }
            .notes-title {
              font-weight: bold;
              margin-bottom: 2mm;
            }
            .signature-area {
              margin-top: 20mm;
              text-align: right;
            }
            .signature-line {
              display: inline-block;
              width: 70mm;
              border-top: 1px solid #000;
              margin-bottom: 1mm;
            }
            .signature-text {
              font-size: 11pt;
            }
            .footer {
              position: fixed;
              bottom: 0;
              width: 100%;
              font-size: 9pt;
              text-align: center;
              padding: 2mm 0;
              border-top: 1px solid #000;
            }
            .watermark {
              position: fixed;
              opacity: 0.1;
              font-size: 60pt;
              transform: rotate(-45deg);
              top: 50%;
              left: 25%;
              z-index: -1;
            }
            @media print {
              body { 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="watermark">ORDONNANCE</div>
          <div class="header">
            <div class="doctor-info">
              <div class="doctor-name">Dr. ${doctorInfo?.firstName} ${doctorInfo?.lastName}</div>
              <div class="specialty">${doctorInfo?.specialty_description}</div>
              <div class="contact-info">
                <div>Tél: ${doctorInfo?.phone}</div>
                <div>${doctorInfo?.address}</div>
                <div>RPPS: ${doctorInfo?.rppsNumber || 'XXXXXXX'}</div>
              </div>
            </div>
            <div class="date-info">
              <div>Le: ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>

          <div class="ordonnance-title">ORDONNANCE MÉDICALE</div>

          <div class="patient-info">
            <div class="patient-info-grid">
              <div>
                <div class="info-label">Nom du patient:</div>
                <div>${patientFirstName} ${patientLastName}</div>
              </div>
              <div>
                <div class="info-label">Date de naissance:</div>
                <div>${patientInfo?.birthDate || 'Non spécifié'}</div>
              </div>
              <div>
                <div class="info-label">Téléphone:</div>
                <div>${patientInfo?.phoneNumber}</div>
              </div>
              <div>
                <div class="info-label">Âge:</div>
                <div>${patientInfo?.birthDate ? calculateAge(patientInfo.birthDate) + ' ans' : 'Non spécifié'}</div>
              </div>
            </div>
          </div>

          <table class="medication-table">
            <thead>
              <tr>
                <th width="25%">Médicament</th>
                <th width="15%">Dosage</th>
                <th width="25%">Posologie</th>
                <th width="15%">Durée</th>
                <th width="20%">Remarques</th>
              </tr>
            </thead>
            <tbody>
              ${medications.filter(m => m.name).map(med => `
                <tr>
                  <td>${med.name}</td>
                  <td>${med.dosage}</td>
                  <td>${med.frequency}</td>
                  <td>${med.duration}</td>
                  <td>${med.notes}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${prescription ? `
            <div class="additional-notes">
              <div class="notes-title">INSTRUCTIONS COMPLÉMENTAIRES:</div>
              <div>${prescription.replace(/\n/g, '<br>')}</div>
            </div>
          ` : ''}

          <div class="signature-area">
            <div class="signature-line"></div>
            <div class="signature-text">Signature et cachet du médecin</div>
          </div>

          <div class="footer">
            Ordonnance valable pour 30 jours à compter de la date d'émission • Numéro RPPS: ${doctorInfo?.rppsNumber || 'XXXXXXX'}
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FiLoader className="animate-spin h-12 w-12 text-[#ff5a5f] mx-auto mb-4" />
          <p className="text-gray-600">Loading prescription form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorSidebar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Printable content (hidden) */}
          <div id="printable-ordonnance" className="hidden"></div>

          {/* Editable content */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#ff5a5f] to-[#e04a50] px-8 py-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">Dr. {doctorInfo?.firstName} {doctorInfo?.lastName}</h1>
                  <p className="mt-1">{doctorInfo?.specialty_description}</p>
                  <div className="mt-4 flex items-center">
                    <FiPhone className="mr-2" />
                    <span>{doctorInfo?.phone}</span>
                  </div>
                  <p className="mt-1">{doctorInfo?.address}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end">
                    <FiCalendar className="mr-2" />
                    <span>{new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="mt-4 bg-white bg-opacity-20 px-3 py-1 rounded-full inline-block">
                    <span className="text-sm font-medium">ORDONNANCE</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 px-8 py-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiUser className="mr-2 text-[#ff5a5f]" />
                Patient Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Nom complet</p>
                  <p className="font-medium">
                    {patientFirstName} {patientLastName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Téléphone</p>
                  <p className="font-medium">{patientInfo?.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Date de naissance</p>
                  <p className="font-medium">
                    {patientInfo?.birthDate || 'Non spécifié'}
                    {patientInfo?.birthDate && ` (${calculateAge(patientInfo.birthDate)} ans)`}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FiFileText className="mr-2 text-[#ff5a5f]" />
                  Médicaments Prescrits
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médicament</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posologie</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarques</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {medications.map((med, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-[#ff5a5f] focus:border-[#ff5a5f]"
                              value={med.name}
                              onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                              placeholder="Paracétamol"
                            />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-[#ff5a5f] focus:border-[#ff5a5f]"
                              value={med.dosage}
                              onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                              placeholder="500mg"
                            />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-[#ff5a5f] focus:border-[#ff5a5f]"
                              value={med.frequency}
                              onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                              placeholder="1 comprimé, 3 fois/jour"
                            />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-[#ff5a5f] focus:border-[#ff5a5f]"
                              value={med.duration}
                              onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                              placeholder="5 jours"
                            />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-[#ff5a5f] focus:border-[#ff5a5f]"
                              value={med.notes}
                              onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)}
                              placeholder="Après repas"
                            />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={() => removeMedication(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <button
                  type="button"
                  onClick={addMedication}
                  className="mt-2 flex items-center text-sm text-[#ff5a5f] hover:text-[#e04a50]"
                >
                  <FiPlus className="mr-1" />
                  Ajouter un médicament
                </button>
              </div>

              <div className="mb-6">
                <label htmlFor="prescription" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiFileText className="mr-2 text-[#ff5a5f]" />
                  Instructions Complémentaires
                </label>
                <textarea
                  id="prescription"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f]"
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="Ex: Repos recommandé pendant 3 jours\nContrôle dans 1 semaine\nÉviter les efforts physiques"
                />
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    Cette ordonnance est valable pour 30 jours à partir de la date d'émission.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FiPrinter className="mr-2" />
                    Aperçu & Impression
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-[#ff5a5f] text-white rounded-lg hover:bg-[#e04a50] transition-colors"
                  >
                    <FiSave className="mr-2" />
                    Enregistrer
                  </button>
                </div>
              </div>
            </form>

            <div className="px-8 py-6 border-t border-gray-200">
              <div className="flex justify-end">
                <div className="text-center">
                  <div className="border-t-2 border-[#ff5a5f] w-32 mb-2"></div>
                  <p className="text-sm text-gray-600">Signature et cachet du médecin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ordonnance;
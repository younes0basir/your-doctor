import React from 'react'
import Navbar from './components/Navbar'
import { Routes, Route, useLocation, useParams, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import About from './pages/About'
import Contact from './pages/Contact'
import Appointment from './pages/Appointment'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Portal from './pages/Portal'
import Profile from './pages/Profile'
import MyAppointments from './pages/MyAppointments'
import DoctorLogin from './components/doctor/DoctorLogin'
import DoctorRegister from './components/doctor/DoctorRegister'
import DoctorDashboard from './components/doctor/DoctorDashboard'
import DoctorSettings from './components/doctor/DoctorSettings'
import DoctorAppointments from './components/doctor/DoctorAppointments'
import DoctorOfficeQueue from './components/doctor/DoctorOfficeQueue'
import AppointmentLive from './components/doctor/AppointmentLive'
import Ordonnance from './components/doctor/Ordonnance'
import ProtectedRoute from './components/doctor/ProtectedRoute'
import AppointmentBooking from './components/appointments/AppointmentBooking'
import AppointmentList from './components/appointments/AppointmentList'
import ListOfDoctors from './pages/ListOfDoctors'
import VideoAppointment from './pages/VideoAppointment'
import AdminRegister from './pages/AdminRegister'
import AdminSidebar from './admin/AdminSidebar';
import AdminDashboard from './admin/AdminDashboard';
import AdminAccounts from './admin/AdminAccounts';
import AdminAppointments from './admin/AdminAppointments';
import AdminAssistants from './admin/AdminAssistants'; // add this import
import AdminProtectedRoute from './admin/AdminProtectedRoute';
import DoctorPatients from './components/doctor/DoctorPatients'
import AssistantRegister from './components/assistant/AssistantRegister';
import AssistantLogin from './components/assistant/AssistantLogin';
import ManageAssistant from './components/assistant/ManageAssistant';
import AssistantDashboard from './components/assistant/AssistantDashboard';
import AssistantQueue from './components/assistant/AssistantQueue';
import AssistantPatients from './components/assistant/AssistantPatients';
import AssistantManageQueue from './components/assistant/AssistantManageQueue';
import AssistantAppointments from './components/assistant/AssistantAppointments';
import PatientHistory from './components/doctor/PatientHistory'
import AssistantPatientHistory from './components/assistant/PatientHistory';
import PaymentFictif from './components/PaymentFictif'; // If you use the component directly
// import PayementPage from './pages/PayementPage'; // If you have a dedicated page
import NewAppointment from './components/assistant/NewAppointment';
import AdminAccountCreate from './admin/AdminAccountCreate';
import ApiTest from './pages/ApiTest';
import TempTokenLogin from './pages/TempTokenLogin';

const App = () => {
  const location = useLocation();
  const isDoctorPage = location.pathname.startsWith('/doctor');
  const isAppointmentsPage = location.pathname.startsWith('/appointments');
  const isAssistantRoute = location.pathname.startsWith('/assistant');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const navigate = useNavigate();
  const [showNewAppointment, setShowNewAppointment] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleCreateAppointment = async (form) => {
    setLoading(true);
    setError('');
    try {
      // Replace with your API call logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowNewAppointment(false);
      navigate(-1); // Close popup after creation
    } catch (e) {
      setError('Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const BookingWrapper = () => {
    const { doctorId } = useParams();
    return <AppointmentBooking doctorId={doctorId} />;
  };

  // Example wrapper to use PaymentFictif with appointmentId param
  function PaymentFictifWrapper() {
    const { appointmentId } = useParams();
    // You can fetch appointment/payment info here and pass to PaymentFictif
    return <PaymentFictif appointmentId={appointmentId} />;
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <ToastContainer />
      {/* Hide NavBar and Footer on assistant and admin pages */}
      {!isAssistantRoute && !isAdminRoute && <Navbar />}
      <div className='flex-grow'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/list-of-doctors' element={<ListOfDoctors />} />
          <Route path='/appointment/:docId' element={<Appointment />} />
          <Route path='/portal' element={<Portal />} />
          <Route path='/my-profile' element={<Profile />} />
          <Route path='/my-appointments' element={<MyAppointments />} />
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/doctor/register" element={<DoctorRegister />} />
          <Route path="/appointments" element={<AppointmentList />} />
          <Route path="/book-appointment/:doctorId" element={<BookingWrapper />} />
          <Route path="/video-appointment/:appointmentId" element={<VideoAppointment />} />
          <Route 
            path="/doctor/dashboard" 
            element={
              <ProtectedRoute>
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/appointments" 
            element={
              <ProtectedRoute>
                <DoctorAppointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/office-queue" 
            element={
              <ProtectedRoute>
                <DoctorOfficeQueue />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/appointment-live/:appointmentId" 
            element={
              <ProtectedRoute>
                <AppointmentLive />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/ordonnance/new/:appointmentId" 
            element={
              <ProtectedRoute>
                <Ordonnance />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/settings" 
            element={
              <ProtectedRoute>
                <DoctorSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/patients" 
            element={
              <ProtectedRoute>
                <DoctorPatients />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/patient-history/:patientId" 
            element={
              <ProtectedRoute>
                <PatientHistory />
              </ProtectedRoute>
            }
          />
          <Route path='/admin/*' element={
            <AdminProtectedRoute>
              <AdminSidebar />
            </AdminProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="accounts" element={<AdminAccounts />} />
            <Route path="accounts/new" element={<AdminAccountCreate />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="assistants" element={<AdminAssistants />} />
            {/* fallback for unknown admin routes */}
            <Route path="*" element={<div className="p-8 text-center text-red-600 text-xl font-bold">Admin page not found</div>} />
            <Route index element={<AdminDashboard />} />
          </Route>
          <Route path="/assistant/register" element={<AssistantRegister />} />
          <Route path="/assistant/login" element={<AssistantLogin />} />
          <Route 
            path="/doctor/assistants" 
            element={
              <ProtectedRoute>
                <ManageAssistant />
              </ProtectedRoute>
            } 
          />
          <Route path="/assistant/dashboard" element={<AssistantDashboard />} />
          <Route path="/assistant/queue" element={<AssistantQueue />} />
          <Route path="/assistant/patients" element={<AssistantPatients />} />
          <Route path="/assistant/manage-queue" element={<AssistantManageQueue />} />
          <Route path="/assistant/appointments" element={<AssistantAppointments />} />
          <Route path="/doctor/patients/:patientId/history" element={<PatientHistory />} />
          <Route path="/assistant/patients/:patientId/history" element={<AssistantPatientHistory />} />
          <Route path="/assistant/patients/:patientId/history" element={<PatientHistory />} />
          <Route path="/payement/:appointmentId" element={<PaymentFictifWrapper />} />
          <Route path="/assistant/appointments/new" element={
            <NewAppointment
              show={true}
              onClose={() => navigate(-1)}
              onSubmit={handleCreateAppointment}
              loading={loading}
              error={error}
            />
          } />
          <Route path='/api-test' element={<ApiTest />} />
          <Route path='/temp-login' element={<TempTokenLogin />} />
        </Routes>
      </div>
      {!isDoctorPage && !isAppointmentsPage && !isAssistantRoute && !isAdminRoute && <Footer />}
    </div>
  )
}

export default App
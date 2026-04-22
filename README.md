# Doctor Appointment System

A comprehensive healthcare platform for booking appointments with qualified doctors, featuring real-time video consultations, secure payments, and role-based access control.

## 🌟 Features

### For Patients
- **Doctor Search**: Find doctors by specialty, location, and availability
- **Appointment Booking**: Schedule appointments with preferred doctors
- **Video Consultations**: Integrated Agora for secure video calls
- **Payment Integration**: Razorpay for seamless payments
- **Medical History**: View appointment history and prescriptions
- **Queue Management**: Real-time queue status updates

### For Doctors
- **Profile Management**: Update professional information and credentials
- **Appointment Dashboard**: View and manage scheduled appointments
- **Patient Records**: Access patient medical history
- **Live Queue**: Manage patient queue in real-time
- **Prescription Management**: Create and send prescriptions
- **Analytics**: View appointment statistics and insights

### For Assistants
- **Appointment Scheduling**: Book appointments on behalf of patients
- **Patient Management**: Register and manage patient records
- **Queue Control**: Manage doctor's appointment queue
- **Doctor Support**: Assist doctors with administrative tasks

### For Admins
- **User Management**: Manage doctors, patients, and assistants
- **Specialty Management**: Add and manage medical specialties
- **System Analytics**: View platform-wide statistics
- **Content Moderation: Approve/reject doctor registrations

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Chart.js & Recharts** - Data visualization
- **Agora RTC SDK** - Video calls
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **PostgreSQL (Neon)** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Image storage
- **Socket.io** - Real-time communication

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Cloudinary account (for image uploads)
- Agora account (for video calls - optional)
- Razorpay account (for payments - optional)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd your-doctor-source-code
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```bash
PORT=5002
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Start the backend server:

```bash
npm start
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```bash
VITE_API_URL=http://localhost:5002/
VITE_RAZORPAY_KEY=your_razorpay_key
VITE_AGORA_APP_ID=your_agora_app_id
```

Start the frontend development server:

```bash
npm run dev
```

## 📁 Project Structure

```
your-doctor-source-code/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── middleware/
│   │   ├── auth.js            # Authentication middleware
│   │   └── authMiddleware.js  # Role-based access control
│   ├── migrations/
│   │   └── update_appointments_table.sql
│   ├── routes/
│   │   ├── doctorRoutes.js    # Doctor endpoints
│   │   ├── patientRoutes.js   # Patient endpoints
│   │   ├── assistantRoutes.js # Assistant endpoints
│   │   ├── adminRoutes.js     # Admin endpoints
│   │   ├── appointmentRoutes.js
│   │   └── ...
│   ├── server.js              # Main server file
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── doctor/        # Doctor components
│   │   │   ├── patient/       # Patient components
│   │   │   ├── assistant/     # Assistant components
│   │   │   └── admin/         # Admin components
│   │   ├── pages/             # Page components
│   │   ├── config/
│   │   │   └── api.js         # API configuration
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── vercel.json
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🔐 Authentication & Roles

The system uses JWT-based authentication with four user roles:

- **Patient**: Can book appointments, view history, join video calls
- **Doctor**: Can manage appointments, view patients, prescribe medications
- **Assistant**: Can book appointments, manage queue, support doctors
- **Admin**: Full system access, user management

## 🗄️ Database Schema

Key tables:
- `users` - User accounts
- `doctor` - Doctor profiles
- `patient` - Patient profiles
- `assistant` - Assistant profiles
- `appointments` - Appointment records
- `specialities` - Medical specialties
- `prescriptions` - Medical prescriptions

## 🌐 API Endpoints

### Authentication
- `POST /api/patients/register` - Patient registration
- `POST /api/doctors/register` - Doctor registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Doctors
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/profile` - Get doctor profile
- `PUT /api/doctors/profile` - Update doctor profile
- `GET /api/doctors/specialities` - Get specialties

### Appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments/doctor/:id` - Get doctor appointments
- `GET /api/appointments/patient/:id` - Get patient appointments
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel
```

### Backend (Railway/Render)
See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@yourdomain.com or open an issue in the repository.

## 🙏 Acknowledgments

- Neon Database for PostgreSQL hosting
- Cloudinary for image storage
- Agora for video call infrastructure
- Razorpay for payment processing

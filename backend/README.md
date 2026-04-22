# Doctor Appointment System - Backend API

A production-ready RESTful API for a doctor appointment management system built with Node.js, Express, and PostgreSQL.

## Features

- User authentication (Patients, Doctors, Admins, Assistants)
- Appointment scheduling and management
- Prescription management
- Video call integration (Agora)
- Payment integration (Razorpay)
- File uploads to Cloudinary
- Activity tracking and history
- Role-based access control

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Cloudinary
- **Video Calls:** Agora
- **Payments:** Razorpay

## Prerequisites

- Node.js >= 16.0.0
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration values.

5. Set up the database:
   - Run the SQL migrations in the `migrations/` folder
   - Or use the `database_postgresql.sql` file to create the initial schema

6. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Environment Variables

See `.env.example` for all required environment variables:

- **Server Configuration:** PORT, NODE_ENV
- **Database:** DATABASE_URL
- **Authentication:** JWT_SECRET, JWT_EXPIRE
- **Cloudinary:** CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- **Frontend URL:** FRONTEND_URL (for CORS)
- **Agora:** AGORA_APP_ID, AGORA_APP_CERTIFICATE
- **Razorpay:** RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
- **Email (Optional):** EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD
- **Admin:** ADMIN_EMAIL, ADMIN_PASSWORD

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- POST `/api/auth/logout` - Logout

### Patients
- GET `/api/patients/profile` - Get patient profile
- PUT `/api/patients/profile` - Update patient profile
- GET `/api/patients/appointments` - Get patient appointments

### Doctors
- GET `/api/doctors/profile` - Get doctor profile
- PUT `/api/doctors/profile` - Update doctor profile
- GET `/api/doctors/appointments` - Get doctor appointments
- GET `/api/doctors/patients` - Get doctor's patients

### Appointments
- POST `/api/appointments` - Create appointment
- GET `/api/appointments/:id` - Get appointment details
- PUT `/api/appointments/:id` - Update appointment
- DELETE `/api/appointments/:id` - Cancel appointment

### Prescriptions
- POST `/api/prescriptions` - Create prescription
- GET `/api/prescriptions/:id` - Get prescription

### Admin
- GET `/api/admin/users` - Get all users
- PUT `/api/admin/users/:id` - Update user
- DELETE `/api/admin/users/:id` - Delete user

## Deployment

### Deploy to Railway

1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Node.js app
3. Add environment variables in Railway dashboard
4. Deploy!

### Deploy to Heroku

1. Install Heroku CLI
2. Login to Heroku: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add PostgreSQL addon: `heroku addons:create heroku-postgresql:essential-0`
5. Set environment variables:
```bash
heroku config:set JWT_SECRET=your_secret
heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud_name
# ... add other env vars
```
6. Deploy: `git push heroku main`

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel`
4. Follow the prompts

The `api/index.js` file is configured for Vercel serverless functions.

### Deploy to Render

1. Connect your GitHub repository
2. Create a new Web Service
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Node Version:** 20 (set in render.yaml or environment variable NODE_VERSION=20)
4. Add environment variables
5. Deploy!

**Note:** If you encounter Node.js version errors, make sure to set `NODE_VERSION=20` in Render's environment variables.

## Project Structure

```
backend/
├── api/              # Serverless function entry point
├── config/           # Database configuration
├── middleware/       # Authentication middleware
├── migrations/       # Database migration files
├── routes/           # API route handlers
├── uploads/          # Temporary upload directory
├── .env.example      # Environment variables template
├── .gitignore        # Git ignore rules
├── Procfile          # Process file for deployment
├── nixpacks.toml     # Nixpacks build configuration
├── package.json      # Dependencies and scripts
└── server.js         # Main application entry point
```

## Health Check

The API provides a health check endpoint:
```
GET /health
```

## Testing

Run health check:
```bash
npm run health-check
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- CORS configured for specific origins
- Environment variables for sensitive data
- Input validation on all endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.

# Doctor Appointment System - Production Deployment

## 🚀 Quick Start for Production

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/doctor-appointment-system.git
cd doctor-appointment-system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install --production

# Copy environment template
cp .env.example .env

# Edit .env with your production values
nano .env
```

**Required Environment Variables:**
```bash
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET=generate_strong_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=https://yourdomain.com
```

**Initialize Database:**
```bash
npm run setup-db
npm run seed-doctors
```

**Start Server:**
```bash
npm start
# Or with PM2 (recommended for production)
pm2 start server.js --name doctor-api
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.production

# Edit with your production values
nano .env.production
```

**Required Environment Variables:**
```bash
VITE_API_URL=https://api.yourdomain.com/api
VITE_AGORA_APP_ID=your_agora_app_id
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

**Build for Production:**
```bash
npm run build
```

**Deploy the `dist/` folder to your hosting platform.**

---

## 📁 Project Structure

```
doctor-appointment-system/
├── backend/                 # Node.js Express API
│   ├── config/             # Database configuration
│   ├── middleware/         # Auth middleware
│   ├── routes/             # API routes
│   ├── .env                # Environment variables (DO NOT COMMIT)
│   ├── .env.example        # Environment template
│   ├── server.js           # Main server file
│   └── package.json
├── frontend/               # React Vite application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── App.jsx         # Main app component
│   ├── .env.production     # Production env vars (DO NOT COMMIT)
│   ├── .env.example        # Environment template
│   └── vite.config.js      # Vite configuration
├── DEPLOYMENT_GUIDE.md     # Detailed deployment guide
└── README.md               # This file
```

---

## 🔐 Security Checklist

- [ ] `.env` files added to `.gitignore`
- [ ] Strong JWT secret generated
- [ ] Database credentials secured
- [ ] HTTPS enabled
- [ ] CORS configured for production domain
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] SQL injection protection (parameterized queries)
- [ ] Regular dependency updates

---

## 🌐 Deployment Platforms

### Recommended Combinations:

**Option 1: Railway + Vercel (Easiest)**
- Backend: Railway.app (free tier available)
- Frontend: Vercel (free tier)
- Database: Neon DB (free tier)

**Option 2: Render (All-in-One)**
- Both backend and frontend on Render
- Simple deployment from GitHub

**Option 3: VPS (Full Control)**
- DigitalOcean, AWS EC2, or Linode
- Use PM2 for process management
- Nginx as reverse proxy

See `DEPLOYMENT_GUIDE.md` for detailed instructions for each platform.

---

## 🔧 Environment Variables Reference

### Backend (.env)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| PORT | Server port | Yes | 5000 |
| NODE_ENV | Environment | Yes | production |
| DATABASE_URL | PostgreSQL connection string | Yes | postgresql://... |
| JWT_SECRET | Secret for JWT tokens | Yes | random_string |
| JWT_EXPIRE | Token expiration | No | 7d |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | Yes | dsx5croh5 |
| CLOUDINARY_API_KEY | Cloudinary API key | Yes | 123456789 |
| CLOUDINARY_API_SECRET | Cloudinary API secret | Yes | abcdefg |
| FRONTEND_URL | Frontend domain(s) | Yes | https://domain.com |
| AGORA_APP_ID | Agora app ID | No | agora_app_id |
| RAZORPAY_KEY_ID | Razorpay key | No | rzp_test_... |

### Frontend (.env.production)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| VITE_API_URL | Backend API URL | Yes | https://api.domain.com/api |
| VITE_AGORA_APP_ID | Agora app ID | No | agora_app_id |
| VITE_RAZORPAY_KEY_ID | Razorpay key | No | rzp_test_... |

---

## 📊 Monitoring & Maintenance

### Health Check
```bash
curl https://api.yourdomain.com/health
```

### Logs
```bash
# PM2 logs
pm2 logs doctor-api

# View last 100 lines
pm2 logs doctor-api --lines 100
```

### Backups
```bash
# Database backup (Neon provides automatic backups)
# Manual backup command
pg_dump $DATABASE_URL > backup.sql
```

---

## 🆘 Troubleshooting

### Common Issues

**1. "Cannot connect to database"**
- Verify `DATABASE_URL` is correct
- Check SSL mode is set to `require`
- Ensure database is accessible from your server IP

**2. "CORS error"**
- Check `FRONTEND_URL` in backend .env
- Ensure no trailing slashes
- Restart backend after changing .env

**3. "Images not loading"**
- Verify Cloudinary credentials
- Check image URLs are accessible
- Clear browser cache

**4. "Environment variables not loading"**
- Ensure .env file exists
- Restart application after changes
- Check file permissions

---

## 📞 Support

- **Documentation**: See `DEPLOYMENT_GUIDE.md` for detailed instructions
- **Issues**: Create an issue on GitHub
- **Email**: support@yourdomain.com

---

## 📝 License

ISC

---

**🎉 Ready for production! Follow the steps above and refer to DEPLOYMENT_GUIDE.md for platform-specific instructions.**

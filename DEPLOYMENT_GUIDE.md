# PRODUCTION DEPLOYMENT GUIDE

## 📋 Overview
This guide covers deploying the Doctor Appointment System to production with proper environment variable management.

---

## 🔧 Backend Deployment

### 1. Environment Variables Setup

Create a `.env` file in the `backend/` directory with these variables:

```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# JWT Authentication
JWT_SECRET=generate_a_strong_random_secret_here
JWT_EXPIRE=7d

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS - Your Frontend Domain(s)
FRONTEND_URL=https://yourdomain.com,https://www.yourdomain.com

# Agora (Video Calls) - Optional
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate

# Razorpay (Payments) - Optional
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email Notifications - Optional
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**⚠️ IMPORTANT:** Never commit `.env` to version control!

### 2. Platform-Specific Deployment

#### **Option A: Railway.app**
```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
cd backend
railway init

# 4. Set environment variables
railway variables set PORT=5000
railway variables set NODE_ENV=production
railway variables set DATABASE_URL="your_neon_db_url"
railway variables set JWT_SECRET="your_secret"
# ... set all other variables

# 5. Deploy
railway up
```

#### **Option B: Render.com**
```bash
# 1. Create new Web Service on Render
# 2. Connect your GitHub repository
# 3. Set Build Command: cd backend && npm install
# 4. Set Start Command: cd backend && npm start
# 5. Add all environment variables in Render dashboard
```

#### **Option C: Heroku**
```bash
# 1. Login to Heroku
heroku login

# 2. Create app
heroku create your-doctor-api

# 3. Set environment variables
heroku config:set PORT=5000
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL="your_neon_db_url"
heroku config:set JWT_SECRET="your_secret"
# ... set all other variables

# 4. Deploy
git push heroku main
```

#### **Option D: VPS (DigitalOcean, AWS EC2, etc.)**
```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Clone repository
git clone https://github.com/yourusername/your-doctor-app.git
cd your-doctor-app/backend

# 3. Install dependencies
npm install --production

# 4. Create .env file
nano .env
# Add all environment variables

# 5. Install PM2 for process management
npm install -g pm2

# 6. Start application
pm2 start server.js --name doctor-api

# 7. Setup PM2 to start on boot
pm2 startup
pm2 save

# 8. Setup Nginx as reverse proxy
sudo nano /etc/nginx/sites-available/doctor-api
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🎨 Frontend Deployment

### 1. Environment Variables Setup

Create a `.env.production` file in the `frontend/` directory:

```bash
# API URL (Your Backend Domain)
VITE_API_URL=https://api.yourdomain.com/api

# Agora (Video Calls)
VITE_AGORA_APP_ID=your_agora_app_id

# Razorpay (Payments)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# App Configuration
VITE_APP_NAME=Your Doctor
VITE_APP_DESCRIPTION=Book appointments with qualified doctors
```

### 2. Build for Production

```bash
cd frontend
npm run build
```

This creates optimized files in `frontend/dist/`

### 3. Platform-Specific Deployment

#### **Option A: Vercel (Recommended)**
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
cd frontend
vercel

# 3. Set environment variables in Vercel dashboard
# VITE_API_URL=https://api.yourdomain.com/api
# VITE_AGORA_APP_ID=your_agora_app_id
# VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

#### **Option B: Netlify**
```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Build
cd frontend
npm run build

# 3. Deploy
netlify deploy --prod --dir=dist

# 4. Set environment variables in Netlify dashboard
```

#### **Option C: GitHub Pages**
```bash
# 1. Install gh-pages
npm install --save-dev gh-pages

# 2. Update package.json
{
  "homepage": "https://yourusername.github.io/your-repo",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}

# 3. Deploy
npm run deploy
```

#### **Option D: VPS with Nginx**
```bash
# 1. Build locally
cd frontend
npm run build

# 2. Upload dist folder to server
scp -r dist/* user@your-server:/var/www/doctor-app/

# 3. Configure Nginx
sudo nano /etc/nginx/sites-available/doctor-app
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/doctor-app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (optional - if backend is on same server)
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

---

## 🔒 Security Best Practices

### 1. Generate Strong Secrets
```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Use the output in your .env
JWT_SECRET=<generated_secret>
```

### 2. SSL/TLS Certificate
```bash
# Using Let's Encrypt (free)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

### 3. Database Security
- ✅ Use connection pooling (already configured)
- ✅ Enable SSL (already configured for Neon)
- ✅ Use strong passwords
- ✅ Restrict database access by IP
- ✅ Regular backups

### 4. API Security
- ✅ Rate limiting (add express-rate-limit)
- ✅ Input validation
- ✅ Helmet.js for security headers
- ✅ CORS properly configured
- ✅ HTTPS only in production

---

## 📊 Monitoring & Logging

### 1. Application Monitoring
```bash
# Install monitoring packages
npm install --save winston morgan

# Add to server.js
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 2. Uptime Monitoring
- Use services like UptimeRobot, Pingdom, or StatusCake
- Set up alerts for downtime
- Monitor response times

### 3. Error Tracking
- Sentry.io for error tracking
- LogRocket for session replay
- New Relic for performance monitoring

---

## 🚀 Performance Optimization

### 1. Backend
```javascript
// Add compression
const compression = require('compression');
app.use(compression());

// Add caching headers
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300');
  next();
});
```

### 2. Frontend
```javascript
// vite.config.js optimizations
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
})
```

### 3. Database
- ✅ Indexes already created
- Add query caching with Redis
- Optimize slow queries
- Use connection pooling (already configured)

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        uses: railwayapp/cli-action@v2
        with:
          railwayToken: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          cd backend
          railway up

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

---

## 📝 Checklist Before Going Live

### Backend
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Seed data loaded (specialities, admin user)
- [ ] CORS configured for production domain
- [ ] SSL certificate installed
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Health check endpoint added
- [ ] Backup strategy in place

### Frontend
- [ ] API URL points to production backend
- [ ] All environment variables set
- [ ] Build succeeds without errors
- [ ] Tested on multiple browsers
- [ ] Mobile responsive
- [ ] SEO meta tags added
- [ ] Analytics configured (Google Analytics, etc.)
- [ ] Error boundary implemented

### Testing
- [ ] User registration works
- [ ] Login/logout works
- [ ] Doctor search works
- [ ] Appointment booking works
- [ ] Payment integration works (if applicable)
- [ ] Video calls work (if applicable)
- [ ] Email notifications work (if configured)
- [ ] Admin panel accessible

### Security
- [ ] No sensitive data in code
- [ ] .env files in .gitignore
- [ ] HTTPS enabled
- [ ] Strong passwords enforced
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection
- [ ] CSRF protection

---

## 🆘 Troubleshooting

### Common Issues

**1. CORS Errors in Production**
```bash
# Check FRONTEND_URL in backend .env
FRONTEND_URL=https://yourdomain.com

# Ensure no trailing slashes
```

**2. Database Connection Fails**
```bash
# Verify DATABASE_URL format
# Test connection locally first
node -e "require('./config/db.js')"
```

**3. Images Not Loading**
```bash
# Check Cloudinary credentials
# Verify image URLs are accessible
```

**4. Environment Variables Not Loading**
```bash
# Restart the application after changing .env
# For PM2: pm2 restart doctor-api
# For Railway/Render: Redeploy
```

---

## 💰 Cost Estimation

### Free Tier Options
- **Database**: Neon DB (Free tier - 0.5 GB)
- **Backend**: Railway/Render (Free tier with limitations)
- **Frontend**: Vercel/Netlify (Free tier)
- **Images**: Cloudinary (Free tier - 25 GB)

### Paid Options (Small Scale)
- **Database**: Neon Pro ($19/month)
- **Backend**: Railway Pro ($5-20/month)
- **Frontend**: Vercel Pro ($20/month)
- **Total**: ~$44-64/month

---

## 📞 Support & Resources

- **Neon DB Docs**: https://neon.tech/docs
- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Express.js**: https://expressjs.com
- **React**: https://react.dev

---

**🎉 You're ready to deploy! Follow the steps above for your chosen platform.**

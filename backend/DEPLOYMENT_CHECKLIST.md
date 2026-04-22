# Deployment Checklist

## Pre-Deployment

- [ ] All environment variables are configured in deployment platform
- [ ] Database is set up and migrations are run
- [ ] `.env` file is NOT committed to git (only `.env.example`)
- [ ] `node_modules` is in `.gitignore`
- [ ] All dependencies are listed in `package.json`
- [ ] Test the application locally with production settings

## Environment Variables to Configure

### Required
- [ ] PORT (usually provided by platform)
- [ ] NODE_ENV=production
- [ ] DATABASE_URL (provided by database service)
- [ ] JWT_SECRET (generate a strong random string)
- [ ] JWT_EXPIRE (e.g., 7d)
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] FRONTEND_URL (your frontend domain)

### Optional (if using these features)
- [ ] AGORA_APP_ID
- [ ] AGORA_APP_CERTIFICATE
- [ ] RAZORPAY_KEY_ID
- [ ] RAZORPAY_KEY_SECRET
- [ ] EMAIL_HOST
- [ ] EMAIL_PORT
- [ ] EMAIL_USER
- [ ] EMAIL_PASSWORD
- [ ] ADMIN_EMAIL
- [ ] ADMIN_PASSWORD

## Database Setup

- [ ] PostgreSQL database is created
- [ ] Run `database_postgresql.sql` to create schema
- [ ] Run migrations in `migrations/` folder if needed
- [ ] Database connection is working

## Security Checklist

- [ ] JWT_SECRET is strong and unique (not the example value)
- [ ] All API keys are rotated from examples
- [ ] CORS is configured for your frontend domain only
- [ ] Database SSL mode is enabled (sslmode=require)
- [ ] Admin password is changed from default
- [ ] No sensitive data in code or logs

## Post-Deployment

- [ ] Health check endpoint responds: GET /health
- [ ] Can register a new user
- [ ] Can login successfully
- [ ] File uploads work (Cloudinary)
- [ ] Database queries work
- [ ] CORS allows requests from frontend
- [ ] Error messages don't expose sensitive information
- [ ] Logs are being captured by deployment platform

## Platform-Specific Notes

### Railway
- Automatically detects Node.js apps
- Add PostgreSQL service from Railway dashboard
- Set environment variables in Variables tab
- Check logs in Deployments tab

### Heroku
- Use `heroku config:set` to set environment variables
- Add Heroku PostgreSQL addon
- Check logs with `heroku logs --tail`

### Vercel
- The `api/index.js` file handles serverless deployment
- Set environment variables in Vercel dashboard
- Check function logs in Vercel dashboard

### Render
- Build Command: `npm install`
- Start Command: `npm start`
- Add environment variables in Dashboard > Environment
- Check logs in Logs tab

## Troubleshooting

### App won't start
- Check logs for errors
- Verify all required environment variables are set
- Ensure DATABASE_URL is correct
- Check that port is available

### Database connection fails
- Verify DATABASE_URL format
- Ensure SSL is enabled if required
- Check database credentials
- Verify network access to database

### CORS errors
- Verify FRONTEND_URL is set correctly
- Check that frontend is making requests to correct backend URL
- Ensure credentials flag is set if using cookies

### File upload fails
- Verify Cloudinary credentials
- Check Cloudinary dashboard for errors
- Ensure multer is configured correctly

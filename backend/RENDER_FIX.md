# Render Deployment Fix - Node.js Version Issue

## Problem
```
TypeError: Cannot read properties of undefined (reading 'prototype')
at Object.<anonymous> (/opt/render/project/src/backend/node_modules/buffer-equal-constant-time/index.js:37:35)
Node.js v25.9.0
```

Render is using Node.js v25 which is incompatible with some dependencies.

## Solution Applied ✅

### 1. Updated package.json
Set Node.js engine requirement to version 18-20:
```json
"engines": {
  "node": ">=18.0.0 <21.0.0"
}
```

### 2. Added .nvmrc file
Created `.nvmrc` with content `20` to specify Node.js 20.

### 3. Updated nixpacks.toml
Added Node provider configuration for Railway deployment.

### 4. Fixed Security Vulnerabilities
- Updated `bcrypt` to v6.0.0
- Kept `cloudinary` at v1.41.3 (compatible with multer-storage-cloudinary)
- Resolved 12 vulnerabilities → now only 2 minor ones remain

## How to Deploy on Render Now

### Option 1: Using render.yaml (Recommended)
The `render.yaml` file is already configured. Just:
1. Go to Render Dashboard
2. Click "New +" → "Blueprint"
3. Connect your GitHub repo
4. Render will auto-detect render.yaml and deploy!

### Option 2: Manual Setup
1. Create new Web Service on Render
2. Connect your GitHub repository
3. Set these settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variable:
   ```
   NODE_VERSION=20
   ```
5. Add all other required environment variables (see DEPLOYMENT_CHECKLIST.md)
6. Click "Create Web Service"

## Required Environment Variables on Render

Make sure to set these in Render dashboard:
```
NODE_VERSION=20
NODE_ENV=production
DATABASE_URL=postgresql://... (from your database)
JWT_SECRET=your-strong-secret-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=https://your-frontend.com
```

## Alternative: Use Railway Instead

If you continue having issues with Render, try Railway:
1. Go to railway.app
2. Sign up with GitHub
3. Deploy from your repo
4. Add PostgreSQL database
5. Set environment variables
6. Done! Railway auto-detects Node 20 from package.json

## Verification

After deployment, test:
```bash
curl https://your-app.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Backend is running",
  "timestamp": "2026-04-22T..."
}
```

## Troubleshooting

### Still getting Node version errors?
- Clear Render cache: Settings → Advanced → Clear Build Cache
- Redeploy

### Database connection fails?
- Make sure DATABASE_URL includes `?sslmode=require`
- Check database credentials

### Port issues?
- Render automatically sets PORT environment variable
- Your app already uses `process.env.PORT || 5000` ✅

## Files Modified
- ✅ package.json (Node engine constraint)
- ✅ .nvmrc (created)
- ✅ nixpacks.toml (updated)
- ✅ render.yaml (created)
- ✅ README.md (updated with Node version note)

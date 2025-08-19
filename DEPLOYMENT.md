# Deployment Guide - Facebook OAuth Setup

## Overview
This guide explains how to deploy the Formula 1 Chatter Championship application with working Facebook OAuth authentication on Vercel (frontend) and Render (backend).

## Prerequisites
1. Facebook Developer Account
2. Vercel Account
3. Render Account
4. PostgreSQL Database (Render provides this)

## Step 1: Facebook App Configuration

### 1.1 Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add the "Facebook Login" product to your app

### 1.2 Configure OAuth Settings
1. Go to Facebook Login > Settings
2. Add these Valid OAuth Redirect URIs:
   ```
   https://formula1chatter.vercel.app/api/login/oauth2/code/facebook
   https://formula1chatter.onrender.com/api/login/oauth2/code/facebook
   http://localhost:8090/api/login/oauth2/code/facebook
   ```

### 1.3 Get App Credentials
1. Go to Settings > Basic
2. Note down your App ID and App Secret
3. These will be used as `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET`

## Step 2: Render Backend Deployment

### 2.1 Deploy to Render
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Configure the service:
   - **Build Command**: `cd backend && ./gradlew build`
   - **Start Command**: `cd backend && java -jar build/libs/backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=render`
   - **Environment**: Java

### 2.2 Set Environment Variables
Add these environment variables in Render:
```
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
DATABASE_URL=your-postgresql-connection-string
```

### 2.3 Database Setup
1. Create a PostgreSQL database in Render
2. Copy the connection string to `DATABASE_URL`
3. The application will automatically create tables on first run

## Step 3: Vercel Frontend Deployment

### 3.1 Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Configure the build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `cd frontend && npm install`

### 3.2 Set Environment Variables
Add this environment variable in Vercel:
```
VITE_API_URL=https://your-render-backend-url.onrender.com/api
```

## Step 4: Testing

### 4.1 Test Facebook Login
1. Visit your Vercel frontend URL
2. Click "Login with Facebook"
3. Complete the OAuth flow
4. Verify you're redirected back and logged in

### 4.2 Common Issues

#### Issue: "Invalid OAuth redirect URI"
- **Solution**: Double-check the redirect URIs in Facebook app settings
- Make sure the URLs match exactly (including protocol and path)

#### Issue: "App not configured for OAuth"
- **Solution**: Ensure Facebook Login product is added to your app
- Check that your app is in "Live" mode (not development)

#### Issue: CORS errors
- **Solution**: Verify the CORS configuration in `SecurityConfig.kt`
- Check that your frontend domain is in the allowed origins list

#### Issue: Session not persisting
- **Solution**: Ensure `withCredentials: true` is set in the API client
- Check that cookies are being set correctly

## Step 5: Production Considerations

### 5.1 Security
- Use HTTPS for all production URLs
- Keep your Facebook App Secret secure
- Regularly rotate API keys

### 5.2 Monitoring
- Set up logging in Render
- Monitor Facebook app usage
- Track authentication success/failure rates

### 5.3 Scaling
- Consider using a CDN for static assets
- Monitor database performance
- Set up auto-scaling if needed

## Troubleshooting

### Facebook Login Not Working
1. Check browser console for errors
2. Verify environment variables are set correctly
3. Test with a fresh browser session
4. Check Facebook app status and permissions

### Backend Connection Issues
1. Verify the `VITE_API_URL` is correct
2. Check Render service logs
3. Ensure the backend is running and accessible
4. Test API endpoints directly

### Database Issues
1. Check database connection string
2. Verify database is accessible from Render
3. Check for migration errors in logs
4. Ensure database has proper permissions

# Unified Student Community Backend

This is the backend API for the Unified Student Community platform.

## Deployment to Vercel

### Prerequisites
1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`

### Environment Variables
Before deploying, you need to set up the following environment variables in Vercel:

1. **MONGODB_URI**: Your MongoDB connection string
2. **EMAIL_USER**: Gmail address for sending emails
3. **EMAIL_PASS**: Gmail app password for authentication

### Setting Environment Variables in Vercel

#### Option 1: Using Vercel CLI
```bash
vercel env add MONGODB_URI
vercel env add EMAIL_USER
vercel env add EMAIL_PASS
```

#### Option 2: Using Vercel Dashboard
1. Go to your project in Vercel Dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:
   - `MONGODB_URI` = `your_mongodb_connection_string`
   - `EMAIL_USER` = `your_gmail_address`
   - `EMAIL_PASS` = `your_gmail_app_password`

### Deploy Commands

#### Option 1: Using the deployment script (Recommended)
```bash
cd backend
./deploy.sh
```

#### Option 2: Using npm scripts
```bash
cd backend
npm run deploy        # Deploy to production
npm run deploy-dev    # Deploy to development
```

#### Option 3: Using Vercel CLI directly
```bash
cd backend
vercel --prod         # Deploy to production
vercel               # Deploy to development
```

### Local Development
```bash
npm install
npm start
```

## API Endpoints

- `GET /` - Health check
- `POST /signup` - User registration
- `POST /login` - User authentication
- `POST /forgot-password` - Send password reset OTP
- `POST /reset-password` - Reset password with OTP

## Environment Variables for Local Development

Create a `.env` file in the backend directory:

```env
MONGODB_URI=your_mongodb_connection_string
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
PORT=4500
```

## Notes

- The server automatically detects if it's running in production (Vercel) or development
- In production, the app is exported as a module for Vercel's serverless functions
- In development, it starts a traditional Express server on the specified port

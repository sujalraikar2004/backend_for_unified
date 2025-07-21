
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');




const app = express();

app.use(cors({
  origin: true, // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
}));
app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'text/plain' }));

// Middleware to parse text/plain as JSON
app.use((req, res, next) => {
  if (req.headers['content-type'] === 'text/plain;charset=UTF-8' && typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      console.error('Failed to parse text/plain as JSON:', e);
    }
  }
  next();
});

// Handle preflight requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
    return res.sendStatus(200);
  }
  next();
});

// Debug middleware for troubleshooting
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

 const connectdb= async()=>{
   await mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

 }
 connectdb();

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});


const User = mongoose.model('User', userSchema);

// Routes

app.get('/',(req,res)=>{
  res.json({message:" hello unifiedevent"})
})

// Debug endpoint to check environment variables
app.get('/debug', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    mongoUri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
    emailUser: process.env.EMAIL_USER || 'NOT SET',
    emailPass: process.env.EMAIL_PASS ? 'SET (length: ' + process.env.EMAIL_PASS.length + ')' : 'NOT SET',
    port: process.env.PORT || 'NOT SET'
  });
});

// Test email configuration endpoint
app.get('/test-email', async (req, res) => {
  try {
    console.log('Testing email configuration...');
    console.log('Email User:', process.env.EMAIL_USER);
    console.log('Email Pass length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'undefined');

    // Verify transporter
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    res.json({
      message: 'Email configuration is valid',
      emailUser: process.env.EMAIL_USER,
      passLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
    });
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    res.status(500).json({
      error: 'Email configuration invalid',
      details: error.message,
      emailUser: process.env.EMAIL_USER,
      passLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
    });
  }
})
app.post('/signup', async (req, res) => {
  console.log('=== SIGNUP REQUEST ===');
  console.log('Body:', req.body);
  console.log('Headers:', req.headers);
  try {
    const { username, email, password, confirmPassword } = req.body;

 
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({
      error: 'Server error',
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});


app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

  
    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

   
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User does not exist' });
    }

  
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    
   

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
let otpStore = {}; 


const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true, // Enable debug logging
  logger: true // Enable logger
});


app.post('/forgot-password', async (req, res) => {
  console.log('=== FORGOT PASSWORD REQUEST ===');
  console.log('Body:', req.body);
  console.log('Headers:', req.headers);
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    
    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore[email] = otp;


    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}`,
    };

    // Debug email configuration
    console.log('=== EMAIL DEBUG INFO ===');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.length);
    console.log('EMAIL_PASS first 4 chars:', process.env.EMAIL_PASS?.substring(0, 4));
    console.log('Attempting to send email to:', email);

    // Try to send real email first
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email sending error:', error);
        console.log('=== EMAIL FAILED - Using Development Mode ===');
        console.log('To:', email);
        console.log('OTP:', otp);
        console.log('Error details:', error.message);

        // Fallback to development mode if email fails
        return res.status(200).json({
          message: 'OTP sent to your email (Email service unavailable - check console for OTP)',
          developmentOTP: otp,
          emailError: error.message
        });
      }

      console.log('✅ Email sent successfully to:', email);
      console.log('Email response:', info.response);
      res.status(200).json({ message: 'OTP sent to your email successfully!' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

  
    if (otpStore[email] !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

  
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    
    delete otpStore[email];

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


const PORT = process.env.PORT || 4500;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('=== EMAIL CONFIGURATION ===');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.length);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS);
  });
}

// Export the Express app for Vercel
module.exports = app;

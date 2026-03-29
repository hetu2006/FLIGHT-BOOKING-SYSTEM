// Flight Booking Backend - Server Entry Point
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/flight', require('./routes/flightRoutes'));
app.use('/user', require('./routes/userRoutes'));
app.use('/booking', require('./routes/bookingRoutes'));
app.use('/issue', require('./routes/issueRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/report', require('./routes/reportRoutes'));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// Default Route
app.get('/', (req, res) => {
  res.json({ message: 'Flight Booking API Server Running' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server Running on http://localhost:${PORT}`);
});

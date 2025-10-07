import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { initializeScheduler } from './utils/scheduler';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};
// Ensure CORS headers are set before any rate limiting or other middleware
app.use(cors(corsOptions));
// Handle preflight early so it never hits other middleware
app.options('*', cors(corsOptions));

// Rate limiting - keep after CORS so preflights aren't blocked
// Disabled in development to prevent accidental 429s from parallel requests
if (process.env.NODE_ENV !== 'development') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
}

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/triostack-asset-manager';
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️  Application will continue without database connection');
    // Don't exit - let the app run without database for now
  }
};

// Connect to database
connectDB();

// Initialize scheduler
initializeScheduler();

// API routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Triostack Asset & License Manager API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/api/health'
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  const { stopScheduler } = await import('./utils/scheduler');
  stopScheduler();
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down server...');
  const { stopScheduler } = await import('./utils/scheduler');
  stopScheduler();
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

export default app;

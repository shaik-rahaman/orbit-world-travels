import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import 'express-async-errors';
import { config } from '@/config/env';
import { errorHandlerMiddleware } from '@/middleware';
import { authRoutes } from '@/modules/auth';
import { invoiceRoutes } from '@/modules/invoice';
import { default as visaRoutes } from '@/modules/visa';
import { default as flightRoutes } from '@/modules/flight';
import { default as hotelRoutes } from '@/modules/hotel';
import { default as insuranceRoutes } from '@/modules/insurance';
import { default as crmRoutes } from '@/modules/crm';
import { default as reportsRoutes } from '@/modules/reports';
import { default as aiRoutes } from '@/modules/ai';

const app: Express = express();

// Configure CORS based on environment
const corsOptions = {
  origin: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:8008', 'http://localhost:3000', 'http://localhost:3008'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Orbit World Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
const apiPrefix = '/api/orbit-world';

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/invoices`, invoiceRoutes);
app.use(`${apiPrefix}/visa`, visaRoutes);
app.use(`${apiPrefix}/flight`, flightRoutes);
app.use(`${apiPrefix}/hotel`, hotelRoutes);
app.use(`${apiPrefix}/insurance`, insuranceRoutes);
app.use(`${apiPrefix}/clients`, crmRoutes);
app.use(`${apiPrefix}/reports`, reportsRoutes);
app.use(`${apiPrefix}/ai`, aiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  });
});

// Error handler (must be last)
app.use(errorHandlerMiddleware);

export default app;

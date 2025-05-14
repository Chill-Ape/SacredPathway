import express, { Router } from 'express';
import { log } from './vite';

// Create a router just for static health check routes
// This is separate from the main application logic
export const staticRoutes = Router();

// Root health check - always returns 200 OK
staticRoutes.get('/', (req, res, next) => {
  // For health checks, return OK immediately
  if (!req.headers.accept || !req.headers.accept.includes('text/html')) {
    log('Static root health check OK', 'health');
    return res.status(200).send('OK');
  }
  next();
});

// Dedicated health check path - always returns 200 OK
staticRoutes.get('/health', (_req, res) => {
  log('Static health check endpoint called', 'health');
  res.status(200).send('OK');
});

// Health check with JSON - always returns 200 OK
staticRoutes.get('/_health', (_req, res) => {
  log('Static JSON health check endpoint called', 'health');
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Health check passed'
  });
});
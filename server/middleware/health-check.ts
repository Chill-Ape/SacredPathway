import { Request, Response, NextFunction } from 'express';
import { log } from '../vite';

// Simple middleware to handle health checks with highest priority
export function healthCheckMiddleware(req: Request, res: Response, next: NextFunction) {
  // Health check paths
  const isHealthCheckPath = req.path === '/' || 
                           req.path === '/health' || 
                           req.path === '/_health';
  
  // Health check request indicators
  const isHealthCheckRequest = !req.headers.accept || 
                             !req.headers.accept.includes('text/html') ||
                             req.headers['user-agent']?.includes('Health') ||
                             req.headers['user-agent']?.includes('health') ||
                             req.headers['user-agent']?.includes('ELB-HealthChecker');
  
  // If this is a health check request on a health check path, respond immediately
  if (isHealthCheckPath && isHealthCheckRequest) {
    log(`Health check detected: ${req.path} | Agent: ${req.headers['user-agent']}`, 'health');
    return res.status(200).send('OK');
  }
  
  // Otherwise, continue with the request
  next();
}
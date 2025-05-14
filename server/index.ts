import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";
import { healthCheckMiddleware } from "./middleware/health-check";
import { healthErrorHandler } from "./middleware/health-error-handler";
import { staticRoutes } from "./static-routes";

// Create express app
const app = express();

// ***********************************************
// HEALTH CHECK HANDLING - ABSOLUTE TOP PRIORITY
// ***********************************************

// Layer 1: First middleware - dedicated health check middleware
app.use(healthCheckMiddleware);

// Layer 2: Static routes for health checks with its own router
app.use(staticRoutes);

// Layer 3: Raw handlers for maximum reliability
app.get('/', (req, res, next) => {
  // Bare minimum health check for the root path
  // This will handle ELB health checks
  log('Root health check - highest priority', 'health');
  if (!req.headers.accept || !req.headers.accept.includes('text/html')) {
    return res.status(200).send('OK');
  }
  next();
});

// Layer 4: Additional health check paths
app.get('/health', (req, res) => {
  log('Direct health check call', 'health');
  res.status(200).send('OK');
});

app.get('/_health', (req, res) => {
  log('Direct JSON health check call', 'health');
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  
  // Use our dedicated health check error handler FIRST
  app.use(healthErrorHandler);
  
  // Then use the regular error handler for everything else
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    // Double check for health checks (belt and suspenders approach)
    if (req.path === '/' || req.path === '/health' || req.path === '/_health') {
      log(`Backup health check error handler at ${req.path}`, 'health');
      return res.status(200).send('OK');
    }
    
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // For API routes, return JSON error
    if (req.path.startsWith('/api')) {
      // Send the error response for API routes
      res.status(status).json({ message });
    } else {
      // For non-API routes in production, respond with a basic error page
      if (process.env.NODE_ENV === 'production') {
        res.status(status).send(`
          <!DOCTYPE html>
          <html>
            <head><title>Error</title></head>
            <body>
              <h1>Something went wrong</h1>
              <p>The application encountered an error. Please try again later.</p>
            </body>
          </html>
        `);
      } else {
        // In development, return JSON for better debugging
        res.status(status).json({ message, stack: err.stack });
      }
    }
    
    // Log the error instead of throwing it
    log(`Error caught in global handler (${status}): ${message}`, 'error');
    console.error(err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();

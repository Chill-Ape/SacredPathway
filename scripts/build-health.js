// This script ensures that health check files are properly placed
// for production deployments

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const clientDir = path.join(distDir, 'client');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create client directory if it doesn't exist
if (!fs.existsSync(clientDir)) {
  fs.mkdirSync(clientDir, { recursive: true });
}

// Create health check files
const healthContent = 'OK';
fs.writeFileSync(path.join(distDir, 'health'), healthContent);
fs.writeFileSync(path.join(clientDir, 'health'), healthContent);
fs.writeFileSync(path.join(rootDir, 'public', 'health'), healthContent);

console.log('Health check files created successfully.');
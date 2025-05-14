import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'public/uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req: Request, file, cb) {
    const userId = req.user?.id;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname).toLowerCase();
    
    // Only allow image files
    const allowedFileTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (!allowedFileTypes.includes(extension)) {
      return cb(new Error('Only image files are allowed'), '');
    }

    cb(null, `user-${userId}-${uniqueSuffix}${extension}`);
  }
});

// File size limit (5MB)
const maxSize = 5 * 1024 * 1024;

// Create the multer upload instance
export const profileUpload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: (_req, file, cb) => {
    // Check file types
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Convert file path to URL path
export function getProfilePictureUrl(filePath: string): string {
  const relativePath = path.relative(path.join(process.cwd(), 'public'), filePath);
  return '/' + relativePath.replace(/\\/g, '/');
}
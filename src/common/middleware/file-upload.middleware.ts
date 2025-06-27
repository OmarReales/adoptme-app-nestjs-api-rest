import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Request, Express } from 'express';

// Allowed file types configuration
const ALLOWED_FILE_TYPES = {
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  documents: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'],
  others: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'],
} as const;

// Maximum file sizes configuration (in bytes)
const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024, // 5MB for images
  documents: 10 * 1024 * 1024, // 10MB for documents
  others: 5 * 1024 * 1024, // 5MB for others
} as const;

// Valid fieldnames type
type ValidFieldname = keyof typeof ALLOWED_FILE_TYPES;

// Extended request interface
interface FileUploadRequest extends Request {
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
  file?: Express.Multer.File;
}

// Fieldname to folder mapping
const FOLDER_MAPPING: Record<string, string> = {
  image: 'pets',
  documents: 'documents',
  profileImage: 'profiles',
  petImage: 'pets',
  userDocument: 'documents',
} as const;

// Get destination folder based on fieldname
const getDestinationFolder = (fieldname: string): string => {
  return FOLDER_MAPPING[fieldname] || 'others';
};

// Create directory if it doesn't exist
const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Generate unique filename
const generateUniqueFilename = (originalName: string): string => {
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const ext = path.extname(sanitizedName);
  const nameWithoutExt = path.basename(sanitizedName, ext);
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomId}-${nameWithoutExt}${ext}`;
};

// Multer storage configuration
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
const storage = (multer as any).diskStorage({
  destination: (
    req: FileUploadRequest,
    file: any,
    cb: (error: Error | null, destination: string) => void,
  ): void => {
    const folder = getDestinationFolder(file.fieldname);
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const fullPath = path.join(process.cwd(), 'public', uploadDir, folder);

    try {
      ensureDirectoryExists(fullPath);
      cb(null, fullPath);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      cb(new Error(`Failed to create upload directory: ${errorMessage}`), '');
    }
  },

  filename: (
    req: FileUploadRequest,
    file: any,
    cb: (error: Error | null, filename: string) => void,
  ): void => {
    const filename = generateUniqueFilename(file.originalname);
    cb(null, filename);
  },
});
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */

// File filter function
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
const fileFilter = (req: FileUploadRequest, file: any, cb: any): void => {
  const fieldname = file.fieldname as ValidFieldname;
  const allowedTypes =
    ALLOWED_FILE_TYPES[fieldname] || ALLOWED_FILE_TYPES.others;
  const fileExt = path.extname(file.originalname).toLowerCase();

  const isAllowed = allowedTypes.some((allowedExt) => allowedExt === fileExt);

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type '${fileExt}'. Allowed types for ${fieldname}: ${allowedTypes.join(', ')}`,
      ),
    );
  }
};
/* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */

// Main Multer configuration
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const uploaderConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZES.others,
  },
};
/* eslint-enable @typescript-eslint/no-unsafe-assignment */

// Factory function to create uploader with custom configuration
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
export const createUploader = (options: Partial<any> = {}): any => {
  return (multer as any)({
    ...uploaderConfig,
    ...options,
  });
};

// Predefined uploaders
export const imageUploader = (multer as any)({
  ...uploaderConfig,
  limits: {
    fileSize: MAX_FILE_SIZES.image,
    files: 10,
  },
});

export const documentUploader = (multer as any)({
  ...uploaderConfig,
  limits: {
    fileSize: MAX_FILE_SIZES.documents,
    files: 5,
  },
});

export const singleImageUploader = (multer as any)({
  ...uploaderConfig,
  limits: {
    fileSize: MAX_FILE_SIZES.image,
    files: 1,
  },
});

// Default middleware
export const fileUploadMiddleware = (multer as any)(uploaderConfig);
/* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */

// File handling utilities

/**
 * Generates the public URL for an uploaded file
 */
export const getPublicFileUrl = (filePath: string): string => {
  const relativePath = path.relative(
    path.join(process.cwd(), 'public'),
    filePath,
  );
  return `/${relativePath.replace(/\\/g, '/')}`;
};

/**
 * Deletes a file from the filesystem
 */
export const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

/**
 * Validates file type by extension
 */
export const validateFileType = (
  filename: string,
  fieldname: string,
): boolean => {
  const fileExt = path.extname(filename).toLowerCase();
  const validFieldname = fieldname as ValidFieldname;
  const allowedTypes =
    ALLOWED_FILE_TYPES[validFieldname] || ALLOWED_FILE_TYPES.others;
  return allowedTypes.some((allowedExt) => allowedExt === fileExt);
};

/**
 * Gets information about allowed file types
 */
export const getAllowedFileTypes = (fieldname?: string): readonly string[] => {
  if (fieldname && fieldname in ALLOWED_FILE_TYPES) {
    return ALLOWED_FILE_TYPES[fieldname as ValidFieldname];
  }
  return ALLOWED_FILE_TYPES.others;
};

/**
 * Gets the maximum allowed file size for a field type
 */
export const getMaxFileSize = (fieldname?: string): number => {
  const validFieldname = fieldname as ValidFieldname;
  return MAX_FILE_SIZES[validFieldname] || MAX_FILE_SIZES.others;
};

/**
 * Gets the multer configuration for document uploads
 */
export const getDocumentUploadConfig = () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZES.documents,
    files: 5,
  },
});

// Export types for external use
export type { FileUploadRequest, ValidFieldname };
export { ALLOWED_FILE_TYPES, MAX_FILE_SIZES };

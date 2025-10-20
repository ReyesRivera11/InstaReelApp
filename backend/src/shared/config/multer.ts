import multer from 'multer';
import { Request } from 'express';
import { AppError } from '../../core/errors/AppError';
import { HttpCode } from '../enums/HttpCode';

const storage = multer.memoryStorage();

const fileFilter = (_: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'video/mp4',
    'video/quicktime',
    'video/x-m4v'
  ];

  const allowedExtensions = ['.mp4', '.mov', '.m4v'];

  const fileExtension = file.originalname.toLowerCase().slice(
    file.originalname.lastIndexOf('.')
  );

  const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
  const isValidExtension = allowedExtensions.includes(fileExtension);

  if (isValidMimeType && isValidExtension) {
    cb(null, true);
  } else {
    cb(
      new AppError({
        httpCode: HttpCode.BAD_REQUEST,
        description: `Formato no permitido. Solo se aceptan: ${allowedExtensions.join(', ')}`,
      }),
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

export default upload;
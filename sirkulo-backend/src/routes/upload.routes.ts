import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { uploadMiddleware } from '../config/upload';

const router = Router();
const uploadController = new UploadController();

/**
 * Upload routes for Sirkulo marketplace
 */

// Image upload endpoints
router.post('/image', 
  authenticateToken,
  uploadMiddleware.single('image'), 
  uploadController.uploadSingleImage
);

router.post('/images', 
  authenticateToken,
  uploadMiddleware.multiple('images', 10), 
  uploadController.uploadMultipleImages
);

// Image serving endpoints (public)
router.get('/image/:filename', uploadController.getImage);
router.get('/thumbnail/:filename', uploadController.getThumbnail);

// Image management endpoints (authenticated)
router.get('/image/:id/metadata', 
  authenticateToken,
  uploadController.getImageMetadata
);

router.put('/image/:id/metadata', 
  authenticateToken,
  uploadController.updateImageMetadata
);

router.delete('/image/:id', 
  authenticateToken,
  uploadController.deleteImage
);

router.get('/my-images', 
  authenticateToken,
  uploadController.getUserImages
);

router.post('/image/:id/associate', 
  authenticateToken,
  uploadController.associateImage
);

export default router;

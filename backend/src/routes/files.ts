import { Router } from 'express';
import { upload } from '../middleware/upload';
import { uploadFile } from '../controllers/fileController';

const router = Router();

router.post('/upload', upload.single('file'), uploadFile);

export default router;

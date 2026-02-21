import { Router } from 'express';
import { getMapMarkers } from '../controllers/mapController';

const router = Router();

router.get('/:id/markers', getMapMarkers);

export default router;

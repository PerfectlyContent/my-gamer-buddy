import { Router } from 'express';
import { listGames } from '../controllers/gameController';
import { getCheatCodes } from '../controllers/cheatCodeController';
import { getGameMaps } from '../controllers/mapController';

const router = Router();

router.get('/', listGames);
router.get('/:slug/cheat-codes', getCheatCodes);
router.get('/:slug/maps', getGameMaps);

export default router;

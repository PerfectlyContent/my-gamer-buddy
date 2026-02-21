import { Router } from 'express';
import { sessionMiddleware } from '../middleware/session';
import { getQuests, getQuestProgress, updateQuestProgress } from '../controllers/questController';

const router = Router();

router.get('/games/:slug/quests', getQuests);
router.get('/games/:slug/quest-progress', sessionMiddleware, getQuestProgress);
router.post('/quests/:id/progress', sessionMiddleware, updateQuestProgress);

export default router;

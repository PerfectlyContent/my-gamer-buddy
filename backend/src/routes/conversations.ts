import { Router } from 'express';
import { sessionMiddleware } from '../middleware/session';
import { upload } from '../middleware/upload';
import {
  listConversations,
  createConversation,
  getConversation,
  deleteConversation,
  getMessages,
  sendMessageHandler,
} from '../controllers/conversationController';

const router = Router();

router.use(sessionMiddleware);

router.get('/', listConversations);
router.post('/', createConversation);
router.get('/:id', getConversation);
router.delete('/:id', deleteConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', upload.single('image'), sendMessageHandler);

export default router;

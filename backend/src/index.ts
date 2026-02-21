import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import conversationRoutes from './routes/conversations';
import gameRoutes from './routes/games';
import fileRoutes from './routes/files';
import mapRoutes from './routes/maps';
import questRoutes from './routes/quests';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/conversations', conversationRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api', questRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'my-gamer-buddy-api' });
});

// Global error handler — prevents server crashes
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Catch unhandled promise rejections so server doesn't crash
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
  console.log(`My Gamer Buddy API running on port ${PORT}`);
});

export default app;

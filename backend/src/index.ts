import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { connectDB } from './db/connect';
import issuerRouter from './routes/issuer';
import credentialRouter from './routes/credential';
import verifyRouter from './routes/verify';
import rootRouter from './routes/root';

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// ─── Security middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ─── Body / Logging ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.send('RootPass Backend Running');
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'rootpass-backend', ts: Date.now() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/issuer', issuerRouter);
app.use('/credential', credentialRouter);
app.use('/verify', verifyRouter);
app.use('/root', rootRouter);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Unhandled]', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
async function boot() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 RootPass backend running → http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
  });
}

boot().catch((err) => {
  console.error('Fatal boot error:', err);
  process.exit(1);
});

export default app;

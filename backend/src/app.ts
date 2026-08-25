import express from 'express';
import cors from 'cors';
import { AppConfig } from './config/appConfig';
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';

const app = express();

app.use(
  cors({
    origin: AppConfig.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authRoutes);
app.use('/api', courseRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(AppConfig.port, () => {
  console.log(`Backend listening on http://localhost:${AppConfig.port}`);
});

export default app;

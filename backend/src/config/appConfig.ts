import dotenv from 'dotenv';

dotenv.config();

export const AppConfig = {
  port: Number(process.env.PORT) || 3000,
  corsOrigin: process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean) ?? true,
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-refresh-secret',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8001',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
} as const;

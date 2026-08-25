# NeuralLearn — Setup & Deployment

## Prerequisites

- Node.js 18+
- npm

## Repository layout

```
Elearn-Ai/
├── src/                 # Expo mobile app (React Native)
├── web/                 # Vite web app (React)
├── backend/             # Express + Prisma API
├── ml-service/          # Optional FastAPI risk model
├── assets/              # Expo assets
├── index.tsx            # Expo entry
└── docker-compose.yml
```

## Quick start (local)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set GEMINI_API_KEY (from Google AI Studio)
npm install
npm run setup    # creates SQLite DB + demo user
npm run dev      # http://localhost:3000
```

### 2. Web

```bash
cd web
cp .env.example .env
npm install
npm run dev      # http://localhost:5173
```

### 3. Mobile (Expo)

```bash
# from repo root
npm install
npm start        # http://localhost:8081
```

Update `src/constants/apiConfig.ts` with your machine LAN IP when testing on a physical device.

### Demo login

- Email: `demo@synapse.ai`
- Password: `password123`

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite: `file:./dev.db` or PostgreSQL URL |
| `GEMINI_API_KEY` | Yes | Google Gemini API key (**server only**) |
| `GEMINI_MODEL` | No | Default: `gemini-2.0-flash` |
| `JWT_SECRET` | Yes | Access token signing secret |
| `JWT_REFRESH_SECRET` | No | Falls back to JWT_SECRET |
| `PORT` | No | Default `3000` |
| `CORS_ORIGIN` | No | Comma-separated origins for production |
| `ML_SERVICE_URL` | No | Analytics risk service (optional) |

### Frontend (`web/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Default `http://localhost:3000/api` |

**Never** put `GEMINI_API_KEY` in frontend env files.

## Deployment

### Frontend (Vercel / Netlify)

- Root: `web`
- Build: `npm run build`
- Output: `dist`
- Env: `VITE_API_URL=https://your-api.example.com/api`

### Backend (Railway / Render)

- Root: `backend`
- Build: `npm run build`
- Start: `npm start`
- Env: backend variables including `GEMINI_API_KEY`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`

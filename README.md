# Full Stack Training Project (Production-Ready Starter)

Monorepo with:
- Frontend: React (Vite), Tailwind CSS, React Query, Axios
- Backend: Node.js, Express, MongoDB (Mongoose)
- Auth: JWT access + refresh tokens
- Payments: Stripe Checkout + Webhook
- Deployment: Frontend on Vercel, Backend on Render/Railway, DB on MongoDB Atlas

## Project Structure

- backend
- frontend

## Quick Start

### 1) Backend

1. Copy `backend/.env.example` to `backend/.env` and fill values.
2. Install dependencies:
   - `cd backend`
   - `npm install`
3. Seed data:
   - `npm run seed`
4. Start backend:
   - `npm run dev`

### 2) Frontend

1. Copy `frontend/.env.example` to `frontend/.env` and fill values.
2. Install dependencies:
   - `cd frontend`
   - `npm install`
3. Start frontend:
   - `npm run dev`

## Production Deployment

### Backend (Render/Railway)

- Build command: `npm install`
- Start command: `npm start`
- Required env vars: see `backend/.env.example`

### Frontend (Vercel)

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Required env vars: see `frontend/.env.example`

### Database (MongoDB Atlas)

- Create a MongoDB Atlas cluster
- Use the connection string as `MONGODB_URI`

## Security Notes

- Use long random secrets in production
- Enable HTTPS in production
- Restrict `CORS_ORIGIN` to the frontend domain
- Configure Stripe webhook secret

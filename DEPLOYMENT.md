# POSBuzz Deployment Guide (Railway)

This guide outlines the steps to deploy the POSBuzz backend to [Railway](https://railway.app).

## 1. Prerequisites
- A Railway account (connected to GitHub).
- The POSBuzz repository pushed to GitHub.

## 2. Infrastructure Setup on Railway
1. **Create New Project**: Log in to Railway and click **New Project**.
2. **Add PostgreSQL**: Select **Provision PostgreSQL**.
3. **Add Redis**: Click **New** -> **Database** -> **Add Redis**.

## 3. Connect Backend Service
1. **Deploy from GitHub**: Click **New** -> **GitHub Repo** -> Select `posbuzz`.
2. **Set Root Directory**:
   - Go to the service **Settings**.
   - Under **General**, find **Root Directory** and set it to `/backend`.
3. **Build & Start Commands**:
   - Railway should automatically detect the `Dockerfile`.
   - If not using Docker, set **Build Command** to `npm run build`.
   - Set **Start Command** to `npx prisma migrate deploy && node dist/main`.

## 4. Environment Variables
In the **Variables** tab of your backend service, add the following:

| Variable | Value/Source |
|----------|--------------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (Automatically linked) |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` (Automatically linked) |
| `JWT_SECRET` | Generate a long random string (e.g., `openssl rand -base64 32`) |
| `JWT_EXPIRATION` | `7d` |
| `PORT` | `3000` (Railway will provide this, but setting it as 3000 ensures alignment) |
| `NODE_ENV` | `production` |

## 5. Deployment Flow
- Once the variables are set, Railway will automatically trigger a build.
- The `Dockerfile` will:
  1. Build the NestJS app.
  2. Install production dependencies.
  3. Run `npx prisma migrate deploy` to sync the database schema.
  4. Start the server.

## 6. Accessing the API
Your API will be available at your Railway provided domain (e.g., `posbuzz-production.up.railway.app`).
- **Health Check**: `https://your-url.up.railway.app/api/v1/health`
- **Swagger Docs**: `https://your-url.up.railway.app/api-docs`

---

## 7. Frontend Deployment (Vercel)

### Prerequisites
- A [Vercel](https://vercel.com) account.
- Backend successfully deployed to Railway.

### Deployment Steps
1. **Import Project**: Log in to Vercel and click **Add New** -> **Project**.
2. **Select Repository**: Select the `posbuzz` repository.
3. **Configure Project**:
   - **Root Directory**: Select `frontend`.
   - **Framework Preset**: Vite.
   - **Build Command**: `npm run build`.
   - **Output Directory**: `dist`.
4. **Environment Variables**:
   Add the following in the Vercel project settings:
   - `VITE_API_URL`: `https://your-backend-url.railway.app/api/v1`
5. **Deploy**: Click **Deploy**.

### Post-Deployment (CORS Fix)
Once your Vercel URL is generated (e.g., `posbuzz-frontend.vercel.app`), you **must** update the CORS configuration in your **Railway Backend**:
1. Go to your backend source code (specifically `backend/src/main.ts`).
2. Ensure `enableCors` allows your Vercel domain or is set to `origin: true` (which is already configured in this project).

## 8. Final Verification
1. Access your Vercel URL.
2. Try to register a new account.
3. Verify that the Dashboard stats load correctly.
4. Perform a test sale to ensure end-to-end connectivity.


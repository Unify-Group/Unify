# Deploy Unify to Render (Backend + Frontend)

This project can be deployed to Render using the included blueprint file:
- render.yaml

## 1. Push current code to GitHub
Render will deploy from your Git repository.

## 2. Create services from blueprint
1. In Render, click New > Blueprint.
2. Connect your GitHub repo.
3. Select this repository.
4. Render detects render.yaml and creates:
   - unify-api (Web Service)
   - unify-web (Static Site)

## 3. Configure backend environment variables (unify-api)
Set these in Render dashboard for the API service:
- PGUSER
- PGPASSWORD
- PGHOST
- PGPORT
- PGDATABASE
- JWT_SECRET
- JWT_EXPIRES_IN (default already set to 7d)
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET
- GITHUB_REDIRECT_URI
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI

Notes:
- If your PostgreSQL requires SSL, your current db config already sets rejectUnauthorized false.
- Health check path is /healthz.

## 4. Configure frontend environment variable (unify-web)
Set:
- VITE_API_BASE_URL=https://<your-api-service>.onrender.com

Example:
- VITE_API_BASE_URL=https://unify-api.onrender.com

## 5. OAuth callback setup (critical)
After Render gives you frontend URL, update OAuth apps to match:

GitHub OAuth App:
- Authorization callback URL: https://<your-frontend-site>.onrender.com/login

Google OAuth Client:
- Authorized redirect URI: https://<your-frontend-site>.onrender.com/login

Then set matching values in API env vars:
- GITHUB_REDIRECT_URI=https://<your-frontend-site>.onrender.com/login
- GOOGLE_REDIRECT_URI=https://<your-frontend-site>.onrender.com/login

## 6. Deploy order
1. Deploy API service first.
2. Copy API URL.
3. Set VITE_API_BASE_URL on static site.
4. Redeploy static site.

## 7. Verify deployment
- API health: https://<your-api-service>.onrender.com/healthz
- Open frontend site and test:
  - Sign up/login
  - OAuth login
  - Browse events
  - Create/edit event

## 8. Troubleshooting
- If login/OAuth fails:
  - Confirm OAuth callback URIs exactly match your frontend /login URL.
  - Confirm frontend VITE_API_BASE_URL points to the API service.
- If API cannot connect DB:
  - Recheck PG* env values.
- If frontend calls localhost in production:
  - VITE_API_BASE_URL is missing or incorrect; set and redeploy static site.

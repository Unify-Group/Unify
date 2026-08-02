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

For your deployed services, the URLs shown in Render are:
- API: https://unify-api-bbmc.onrender.com
- Web: https://unify-web.onrender.com

So your frontend variable should be:
- VITE_API_BASE_URL=https://unify-api-bbmc.onrender.com

## 5. OAuth callback setup (critical)
After Render gives you frontend URL, update OAuth apps to match:

GitHub OAuth App:
- Authorization callback URL: https://unify-web.onrender.com/login.html

Google OAuth Client:
- Authorized redirect URI: https://unify-web.onrender.com/login.html

Then set matching values in API env vars:
- GITHUB_REDIRECT_URI=https://unify-web.onrender.com/login.html
- GOOGLE_REDIRECT_URI=https://unify-web.onrender.com/login.html

## 6. Deploy order
1. Deploy API service first.
2. Copy API URL.
3. Set VITE_API_BASE_URL on static site.
4. Redeploy static site.
5. If the OAuth callback still returns 404, clear the Render build cache and redeploy the static site again.

The frontend includes a real static callback file at [public/login](public/login), so the deployed site must build a fresh version to publish it as `/login`.

## 7. Verify deployment
- API health: https://<your-api-service>.onrender.com/healthz
- Open frontend site and test:
  - Sign up/login
  - OAuth login
  - Browse events
  - Create/edit event

## 8. Troubleshooting
- If login/OAuth fails:
  - Confirm OAuth callback URIs exactly match `https://unify-web.onrender.com/login.html`.
  - Confirm frontend VITE_API_BASE_URL points to the API service.
  - If you see `redirect_uri_mismatch`, the OAuth app settings in GitHub/Google do not exactly match `https://unify-web.onrender.com/login.html`.
- If API cannot connect DB:
  - Recheck PG* env values.
- If frontend calls localhost in production:
  - VITE_API_BASE_URL is missing or incorrect; set and redeploy static site.

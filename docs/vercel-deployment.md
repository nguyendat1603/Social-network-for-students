# Vercel frontend

- Project: `campus-social-students` (scope `minhayes-projects`).
- Production: https://campus-social-students.vercel.app
- Project root: repository root; build output: `frontend/dist`.
- Build/install/SPA rewrites are configured in `vercel.json`.
- `.vercelignore` excludes backend, database, local environment files and dependencies.

## Current scope

This deploy serves the frontend. Use `gakusei` / `4444` for the read-only
sample preview. It does not deploy the Express backend or populate Supabase.

The production frontend defaults to `/api/v1`, not the visitor's localhost.
To enable real login/data, deploy the backend separately, set
`VITE_API_BASE_URL` to its HTTPS API endpoint in Vercel, configure backend
`CORS_ORIGIN` for the production frontend, then redeploy.

Never put `SUPABASE_SERVICE_ROLE_KEY`, JWT secrets or backend credentials in
Vercel frontend build variables. `.vercel/` and `.env.local` are local-only.

## GitHub connection

The initial CLI deployment succeeded, but connecting the GitHub repository
was blocked by repository access permissions.

1. Open https://github.com/apps/vercel/installations/new.
2. Select the owner and grant access to
   `nguyendat1603/Social-network-for-students` (owner approval may be needed).
3. From the repository root:

   ```powershell
   vercel git connect https://github.com/nguyendat1603/Social-network-for-students --yes --scope minhayes-projects
   ```

4. Check Vercel Settings → Git → Production Branch. The deployed work is on
   `feat/campus-ux-v2-shell`; select it if pushes to that branch should update
   production, or merge into the configured production branch.

## Manual redeploy

```powershell
vercel deploy --prod --yes --scope minhayes-projects
```

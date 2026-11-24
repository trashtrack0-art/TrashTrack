# TrashTrack — Barangay Calongay

Community waste collection tracking, schedule updates, and private concern reporting for **Barangay Calongay, Pilar, Sorsogon**.

## Local Development

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

## Push to GitHub

Runtime data (`data/`), local environment files (`.env*`), build output (`dist/`), and workspace assets (`public/assets/`, `src/assets/`) are excluded via `.gitignore`.

```bash
git init
git add .
git commit -m "Initial commit: TrashTrack Barangay Calongay"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Deploy to Render

This repository includes a `render.yaml` Blueprint for Render Web Services:

1. In Render, choose **New + → Blueprint** (or **New Web Service**) and connect your GitHub repository.
2. Render uses:
   - **Build Command:** `npm install --include=dev && npm run build`
   - **Start Command:** `npm start` (`node server.ts`, Node `>=22.18.0`)
   - **Health Check Path:** `/api/health`
3. In Render **Environment**, set `ADMIN_PASSCODE` to your Barangay Captain passcode (or leave it unset to claim the admin passcode on first visit).
4. *(Optional)* Mount a Render Persistent Disk and set `DATA_DIR` to the disk mount path so reports and schedule updates persist across redeploys.

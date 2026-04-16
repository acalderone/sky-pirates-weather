# Sky Pirates Field – Weather Dashboard

A mobile-friendly live weather dashboard for the Sky Pirates RC Flying Field in Pipersville, PA.

## How It Works

- `index.html` — the frontend dashboard (static)
- `api/weather.js` — a Vercel serverless function that fetches weather data from spfieldweather.com

The serverless function runs on Vercel's servers, so there are **no CORS issues** — it fetches the weather station page server-side and returns clean JSON to the frontend.

## Deploy to Vercel (free)

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
3. Click **"Add New Project"** → import the `sky-pirates-weather` repository.
4. Click **Deploy** — no settings to change, it auto-detects everything from `vercel.json`.
5. Your site will be live at `https://sky-pirates-weather.vercel.app` (or similar).

Every push to `main` will automatically redeploy.

## Project Structure

```
sky-pirates-weather/
├── api/
│   └── weather.js    ← Vercel serverless function
├── index.html        ← Frontend dashboard
├── vercel.json       ← Vercel routing config
├── package.json      ← Project metadata
└── README.md
```

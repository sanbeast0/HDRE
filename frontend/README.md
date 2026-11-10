# HDRE Frontend

HydroDiplomacy & Resilience Engine: web frontend (Next.js + MapLibre).

## Run locally
npm install
copy .env.example .env.local
npm run dev
Open http://localhost:3000

## Connect the backend
In .env.local set:
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=http://localhost:8000

API calls live in lib/api.ts. Backend responses must match the shapes used there.

# EcoSan Intelligence - Implementation Plan

**Project:** Smart India Hackathon Problem 26195 - Waste Segregation, Disposal & Sanitization  
**Stack:** FastAPI (Backend) + React + Vite + Tailwind (Frontend) + SQLite + Leaflet Maps  
**Target:** 5-page web platform for municipal waste management

---

## 📁 Project Structure

```
ecosan/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # Entry point
│   │   ├── config.py       # Settings
│   │   ├── database.py     # SQLite connection
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── api/            # API routes
│   │   │   ├── bins.py
│   │   │   ├── routes.py
│   │   │   ├── sanitization.py
│   │   │   ├── analytics.py
│   │   │   └── ai_classification.py
│   │   └── services/       # Business logic
│   ├── requirements.txt
│   └── ecosan.db           # SQLite database (auto-created)
├── frontend/               # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # 5 main pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API calls
│   │   ├── contexts/       # React context (auth, theme)
│   │   ├── utils/          # Helpers
│   │   ├── styles/         # Tailwind config, global CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── design/
│   ├── DESIGN.md           # Design system (read)
│   └── code.html           # HTML prototype (read)
└── docs/
    └── PLAN.md             # This file
```

---

## 🗄️ Phase 1: Database Schema (SQLite)

### Tables Needed

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `bins` | Smart bin sensors | id, location_lat, location_lng, fill_level, waste_type, battery, status, last_emptied |
| `routes` | Fleet routes | id, vehicle_id, bin_ids (JSON), status, distance_km, fuel_saved, created_at |
| `vehicles` | Fleet vehicles | id, type (electric/diesel), capacity_kg, current_load, battery_pct, status, lat, lng |
| `sanitization_sites` | Sanitization points | id, name, lat, lng, last_sanitized, uv_c_status, mist_status, supply_liters |
| `ai_classifications` | AI sorting logs | id, bin_id, waste_type, confidence, weight_kg, timestamp |
| `alerts` | System alerts | id, type (hazardous/due/maintenance), message, severity, bin_id, resolved, created_at |
| `analytics_daily` | Daily aggregates | date, total_waste_tons, segregation_accuracy, landfill_diversion_pct, sanitization_index |

**Why SQLite?** Zero setup, file-based, perfect for hackathon demo. Easy to backup/share.

---

## 🔧 Phase 2: Backend (FastAPI)

### Step 2.1: Setup & Config
- Create `backend/` folder
- `requirements.txt`: fastapi, uvicorn, sqlalchemy, pydantic, python-dotenv, pytest
- `config.py`: Load settings from `.env` (DB_URL, CORS_ORIGINS)
- `database.py`: SQLAlchemy engine + session factory

### Step 2.2: Models (`models/`)
- Define SQLAlchemy models for all 7 tables above
- Add relationships (bins → alerts, vehicles → routes)
- Run `alembic init` for migrations (optional but good practice)

### Step 2.3: Schemas (`schemas/`)
- Pydantic models for request/response validation
- Example: `BinCreate`, `BinResponse`, `RouteOptimizeRequest`

### Step 2.4: API Routes (`api/`)
| Endpoint | Method | Page | Description |
|----------|--------|------|-------------|
| `/api/bins` | GET | Live Ops | List all bins with fill levels |
| `/api/bins/{id}` | GET | Live Ops | Single bin details |
| `/api/bins/{id}/fill` | POST | AI Hub | Update fill level from sensor |
| `/api/routes/optimize` | POST | Fleet | AI route optimization |
| `/api/vehicles` | GET | Fleet | List vehicles with GPS |
| `/api/sanitization/sites` | GET | Sanitization | All sanitization points |
| `/api/sanitization/trigger` | POST | Sanitization | Start UV-C/mist cycle |
| `/api/ai/classify` | POST | AI Hub | Simulate waste classification |
| `/api/analytics/kpis` | GET | Analytics | Dashboard KPIs |
| `/api/analytics/trends` | GET | Analytics | Time-series charts |
| `/api/alerts` | GET | All | Active alerts |

### Step 2.5: Services (`services/`)
- `route_optimizer.py`: Simple greedy algorithm (nearest neighbor) for demo
- `ai_classifier.py`: Mock classification (returns random waste type + confidence)
- `sanitization_engine.py`: Track cycles, calculate SVI index

### Step 2.6: Seed Data
- Script to populate 88 bins, 4 vehicles, 18 sanitization sites
- Run once on startup

---

## 🎨 Phase 3: Frontend (React + Vite + Tailwind)

### Step 3.1: Project Init
```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 3.2: Tailwind Config (`tailwind.config.js`)
- Import colors from DESIGN.md (primary: #006948, secondary: #006a61, tertiary: #0051d5)
- Add fonts: Plus Jakarta Sans (headings), Inter (body)
- Configure spacing, border-radius, shadows per design system

### Step 3.3: Global Styles (`src/styles/globals.css`)
- `@tailwind base; @tailwind components; @tailwind utilities;`
- Import Google Fonts
- CSS variables for design tokens

### Step 3.4: Reusable Components (`src/components/`)
| Component | Used In |
|-----------|---------|
| `KPICard` | All pages |
| `StatusBadge` | Live Ops, Fleet, Alerts |
| `BinCard` | Live Ops |
| `VehicleCard` | Fleet |
| `RouteMap` (Leaflet) | Fleet, Live Ops |
| `ConveyorVision` | AI Hub |
| `SanitizationGauge` | Sanitization |
| `AlertPanel` | Live Ops, Sanitization |
| `ChartWrapper` (Recharts) | Analytics |
| `Sidebar` / `TopBar` | Layout |

### Step 3.5: Pages (`src/pages/`)
1. **LiveOperations.jsx** - Bin grid, map, alerts, KPIs
2. **AISegregationHub.jsx** - Conveyor vision, classification feed, presets
3. **FleetLogistics.jsx** - Vehicle cards, route map, re-route buttons
4. **SanitizationIndex.jsx** - SVI gauges, site list, supply tracker
5. **Analytics.jsx** - Charts: waste trends, segregation accuracy, diversion rate

### Step 3.6: Routing & Layout
- `react-router-dom` for navigation
- Main layout: Sidebar (5 nav items) + TopBar + Page content
- Responsive: Mobile → bottom nav bar

### Step 3.7: API Service (`src/services/api.js`)
- Axios instance with baseURL
- Functions for each endpoint
- Error handling + loading states

### Step 3.8: Leaflet Map Integration
- `npm install leaflet react-leaflet`
- Custom markers: bin (color by fill), vehicle (truck icon), sanitization (droplet)
- Map component reusable across pages

---

## 🔄 Phase 4: Integration & Polish

### Step 4.1: Connect Frontend ↔ Backend
- Run backend: `uvicorn app.main:app --reload --port 8000`
- Run frontend: `npm run dev -- --port 5173`
- Test all API calls from browser

### Step 4.2: Real-time Updates (Simulated)
- `setInterval` polling every 5-10 seconds for:
  - Bin fill levels
  - Vehicle positions
  - Alert status
- WebSocket upgrade later (optional)

### Step 4.3: Design Fidelity Check
- Compare each page against `design/code.html`
- Verify colors, spacing, typography, shadows
- Test responsive breakpoints (1280px, 768px, <768px)

### Step 4.4: Error Handling & Loading States
- Skeleton loaders for cards
- Toast notifications for actions (deploy drone, trigger sanitization)
- Empty states for no data

---

## 🚀 Phase 5: Demo Prep (Hackathon)

### Step 5.1: Demo Data Scenarios
- Scenario 1: Normal operations (all green)
- Scenario 2: Bin overflow alert (red badge, map highlight)
- Scenario 3: Hazardous waste detection (AI Hub bounding box)
- Scenario 4: Sanitization due (countdown timer)
- Scenario 5: Route optimization saves fuel (before/after)

### Step 5.2: Presentation Script
- 30-sec elevator pitch
- 2-min live demo flow
- 1-min tech architecture explanation
- SIH innovation highlights (edge AI, NIR, landfill diversion)

### Step 5.3: Deployment (Free)
- Backend: Render.com or Railway.app (free tier)
- Frontend: Vercel or Netlify (free tier)
- SQLite: Include seeded `.db` file in repo

---

## 📋 Implementation Order (Beginner-Friendly)

| Week | Focus | Deliverable |
|------|-------|-------------|
| 1 | Backend foundation | FastAPI running, DB seeded, 5 APIs working |
| 2 | Frontend foundation | Vite+React+Tailwind, design system, routing |
| 3 | Page 1: Live Operations | Bin grid, map, alerts, KPIs |
| 4 | Page 2: AI Segregation Hub | Conveyor vision, classification feed |
| 5 | Page 3: Fleet Logistics | Vehicle cards, route map, re-route |
| 6 | Page 4: Sanitization Index | SVI gauges, site list, trigger actions |
| 7 | Page 5: Analytics | Charts, trends, export |
| 8 | Integration & Polish | Real-time polling, responsive, bug fixes |
| 9 | Demo Prep | Scenarios, deployment, presentation |

---

## 💡 Beginner Tips

1. **Start small** - Get one API endpoint working, then one component, then connect them
2. **Use the HTML prototype** - Copy structure/classes from `design/code.html` directly
3. **Mock first** - Hardcode data in frontend, replace with API calls later
4. **One page at a time** - Don't build all 5 pages simultaneously
5. **Commit often** - `git add . && git commit -m "feat: working bin list"` 
6. **Ask for help** - SIH mentors, Discord communities, Stack Overflow

---

## 🔗 Key References

- Design System: `design/DESIGN.md`
- HTML Prototype: `design/code.html` (copy Tailwind classes from here)
- FastAPI Docs: https://fastapi.tiangolo.com/
- React + Vite: https://vitejs.dev/guide/
- Tailwind: https://tailwindcss.com/docs
- Leaflet React: https://react-leaflet.js.org/
- Recharts: https://recharts.org/

---

## ✅ Next Steps

1. **Create backend folder structure** and `requirements.txt`
2. **Initialize SQLite models** and seed script
3. **Build first API** (`/api/bins`) and test with browser
4. **Initialize frontend** with Vite + Tailwind
5. **Build Sidebar + TopBar layout** with routing
6. **Create Live Operations page** (simplest - mostly data display)

---

*Plan created for SIH 26195 - EcoSan Intelligence Team*
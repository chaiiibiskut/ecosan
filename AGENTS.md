# AGENTS.md - EcoSan Intelligence

## Project Overview
Smart India Hackathon 26195: Waste Segregation, Disposal & Sanitization platform.
- **Backend**: FastAPI + SQLite (SQLAlchemy)
- **Frontend**: React 18 + Vite + Tailwind CSS + Leaflet Maps
- **5 Pages**: Live Operations, AI Segregation Hub, Fleet Logistics, Sanitization Index, Analytics

---

## Repository Structure
```
ecosan/
├── backend/          # FastAPI app
│   ├── app/
│   │   ├── main.py          # Entry point
│   │   ├── config.py        # Settings (.env)
│   │   ├── database.py      # SQLite + SQLAlchemy
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── api/             # Route modules
│   │   └── services/        # Business logic
│   ├── requirements.txt
│   └── ecosan.db            # SQLite (gitignored)
├── frontend/         # React + Vite
│   ├── src/
│   │   ├── components/      # Reusable UI
│   │   ├── pages/           # 5 page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API client (axios)
│   │   ├── contexts/        # React context
│   │   ├── styles/          # Tailwind + globals
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── design/           # Design system (source of truth)
│   ├── DESIGN.md            # Colors, typography, components
│   └── code.html            # HTML prototype (copy classes from here)
└── docs/
    └── PLAN.md              # 9-week implementation plan
```

---

## Development Commands

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                    # Vite dev server on :5173
npm run build                  # Production build
npm run preview                # Preview build
```

### Database
- SQLite file: `backend/ecosan.db` (auto-created on first run)
- Seed script: run once via `python -m app.seed` (to be created)
- No migrations needed for hackathon (recreate on schema change)

---

## Key Conventions

### Design System (source of truth: `design/DESIGN.md`)
- **Colors**: Primary `#006948`, Secondary `#006a61`, Tertiary `#0051d5`
- **Fonts**: Plus Jakarta Sans (headings), Inter (body)
- **Spacing**: `space-md`=1rem, `space-lg`=1.5rem, `gutter`=1.5rem
- **Radius**: `rounded`=0.5rem, `rounded-lg`=1rem, `rounded-full`=9999px
- **Shadows**: Level 1 (cards), Level 2 (hover), Level 3 (overlays)

### HTML Prototype (`design/code.html`)
- Copy Tailwind classes directly from here for pixel-perfect match
- Uses Material Symbols Outlined icons (via Google Fonts)
- All component structures are in this single file

### API Design
- RESTful, JSON request/response
- Prefix: `/api/`
- Pydantic models in `schemas/` for validation
- Error format: `{ "detail": "message" }`

### Frontend Patterns
- Axios instance in `src/services/api.js` with baseURL
- Polling via `setInterval` (5-10s) for real-time feel
- Leaflet maps via `react-leaflet`
- Charts via `recharts`

---

## Implementation Order (from PLAN.md)
1. Backend foundation → DB models → seed data → `/api/bins` working
2. Frontend init → Tailwind config (match DESIGN.md) → Layout (Sidebar + TopBar)
3. Page 1: Live Operations (bin grid, map, alerts, KPIs)
4. Page 2: AI Segregation Hub (conveyor vision, classifications)
5. Page 3: Fleet Logistics (vehicles, route map, re-route)
6. Page 4: Sanitization Index (SVI gauges, trigger actions)
7. Page 5: Analytics (charts, trends)
8. Integration: polling, responsive, bug fixes
9. Demo prep: scenarios, deploy, presentation

---

## Environment Variables
Create `backend/.env`:
```
DATABASE_URL=sqlite:///./ecosan.db
CORS_ORIGINS=http://localhost:5173
```

Frontend uses Vite proxy (configure in `vite.config.js`) or direct API calls.

---

## Testing & Quality
- Backend: `pytest` (to be configured)
- Frontend: `npm run lint` (ESLint + Prettier, to be configured)
- No CI yet - hackathon project

---

## Common Gotchas
- **Tailwind config**: Must match DESIGN.md tokens exactly (colors, spacing, fonts)
- **Leaflet CSS**: Import `leaflet/dist/leaflet.css` in `main.jsx`
- **Material Symbols**: Load via Google Fonts link in `index.html`
- **SQLite**: File locks on Windows - stop backend before deleting `.db`
- **CORS**: Backend must allow `http://localhost:5173`

---

## References
- Full plan: `docs/PLAN.md`
- Design system: `design/DESIGN.md`
- HTML prototype: `design/code.html`
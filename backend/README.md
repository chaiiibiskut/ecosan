# EcoSan Intelligence - Backend

FastAPI backend for Smart India Hackathon 26195: Waste Segregation, Disposal & Sanitization platform.

## Quick Start (Windows)

```powershell
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run seed script (creates database with 40 bins, 6 vehicles, 12 sanitation sites around NIT Rourkela)
python -m app.seed

# Start development server
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/health` | GET | Health check |
| `/api/bins` | GET | List all bins (with filters) |
| `/api/bins/kpis` | GET | Dashboard KPIs |
| `/api/bins/{id}` | GET | Get single bin |
| `/api/bins` | POST | Create bin |
| `/api/bins/{id}` | PATCH | Update bin |
| `/api/bins/{id}/fill` | POST | Record fill level reading |
| `/api/bins/{id}/readings` | GET | Get bin reading history |
| `/api/vehicles` | GET | List vehicles |
| `/api/vehicles/{id}` | GET | Get vehicle |
| `/api/vehicles` | POST | Create vehicle |
| `/api/vehicles/{id}` | PATCH | Update vehicle |
| `/api/vehicles/routes/optimize` | POST | AI route optimization |
| `/api/vehicles/routes` | POST | Create route |
| `/api/sanitization/sites` | GET | List sanitization sites |
| `/api/sanitization/sites/{id}` | GET | Get site |
| `/api/sanitization/sites` | POST | Create site |
| `/api/sanitization/sites/{id}` | PATCH | Update site |
| `/api/sanitization/sites/{id}/trigger` | POST | Trigger sanitization |
| `/api/sanitization/sites/{id}/logs` | GET | Get sanitization logs |
| `/api/ai/classify` | POST | Classify waste (manual) |
| `/api/ai/classifications` | GET | List classifications |
| `/api/ai/classifications/{bin_id}/latest` | GET | Latest classification for bin |
| `/api/ai/simulate/{bin_id}` | POST | Simulate AI classification |
| `/api/alerts` | GET | List alerts |
| `/api/alerts/{id}` | GET | Get alert |
| `/api/alerts` | POST | Create alert |
| `/api/alerts/{id}` | PATCH | Update alert (resolve) |
| `/api/alerts/check` | POST | Auto-check and create alerts |
| `/api/analytics/kpis` | GET | Dashboard KPIs |
| `/api/analytics/waste-trends` | GET | Waste trends (last N days) |
| `/api/analytics/segregation-trends` | GET | Segregation accuracy trends |
| `/api/analytics/vehicle-efficiency` | GET | Vehicle efficiency metrics |
| `/api/analytics/bin-fill-distribution` | GET | Bin fill status distribution |
| `/api/analytics/waste-type-breakdown` | GET | Today's waste type breakdown |
| `/api/analytics/sanitization-coverage` | GET | Sanitization site coverage |

## Database

- SQLite file: `ecosan.db` (auto-created in backend folder)
- Tables: zones, bins, bin_readings, vehicles, sanitation_sites, sanitization_logs, alerts, classifications, routes
- No migrations needed - recreate on schema change

## Environment Variables

Create `.env` file in backend folder:
```
DATABASE_URL=sqlite:///./ecosan.db
CORS_ORIGINS=http://localhost:5173
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Seed Data

The seed script creates:
- **8 zones** around NIT Rourkela campus
- **40 smart bins** with realistic fill levels, battery, waste types
- **7 days of bin readings** (3x daily)
- **6 electric vehicles** (compactors, recyclers, hazardous, sanitizer)
- **12 sanitation sites** (washrooms across campus)
- **Sanitization logs** (3-8 per site)
- **AI classifications** (5-15 per bin)
- **Alerts** for critical/high/offline bins and overdue sanitization
- **Routes** for vehicles

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Settings from .env
│   ├── database.py          # SQLite + SQLAlchemy setup
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic request/response models
│   ├── api/                 # Route modules
│   │   ├── bins.py
│   │   ├── vehicles.py
│   │   ├── sanitization.py
│   │   ├── ai_classification.py
│   │   ├── alerts.py
│   │   └── analytics.py
│   └── services/            # Business logic (empty, for future)
├── requirements.txt
└── ecosan.db                # SQLite database (gitignored)
```

## Testing

```powershell
# Run tests (when configured)
pytest
```

## Common Issues

**SQLite locked on Windows:**
- Stop the backend server before deleting `ecosan.db`
- Use Task Manager to kill any python processes if needed

**CORS errors:**
- Ensure `CORS_ORIGINS` in `.env` matches frontend URL (default: `http://localhost:5173`)

**Port already in use:**
- Change port: `uvicorn app.main:app --reload --port 8001`
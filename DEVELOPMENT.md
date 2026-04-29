# Developer Setup

This guide covers everything you need to run Upload It In locally or contribute to the codebase.

---

## Architecture

```
Upload_It_In/
├── uploaditin_backend/     # Flask REST API (Python)
│   ├── app.py              # Main Flask application & API routes
│   └── utils/
│       ├── LSA.py          # Text extraction & LSA similarity engine
│       ├── embedding_client.py     # Google Gemini embedding API wrapper
│       ├── embedding_scorer.py     # Per-question embedding-based scorer
│       ├── supabase_helpers.py     # Supabase storage helpers
│       └── db.py           # PostgreSQL connection & query helpers
├── uploaditin_v2/          # Next.js frontend (React)
│   └── app/                # App Router pages & components
├── tests/                  # pytest test suite
├── scripts/                # Environment & security validation scripts
├── docs/                   # Migration & operations runbook
└── docker-compose.yml      # Multi-service container configuration
```

---

## Prerequisites

- **Docker & Docker Compose** (recommended for running the full stack)
- Or, for local development:
  - Python 3.10+
  - Node.js 18+

---

## Environment Variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `SUPABASE_SECRET_KEY` | Supabase service_role/secret key |
| `GEMINI_API_KEY` | Google GenAI API key (required for embedding scoring) |
| `FLASK_SECRET_KEY` | Flask session secret key |
| `SCORING_ENGINE` | `embeddings` (default) or `legacy` |
| `EMBEDDING_NORMALIZE` | *(Optional)* `true` to enable L2 normalization of vectors |
| `ALLOWED_ORIGINS` | *(Optional)* Comma-separated list of allowed CORS origins (default: `http://localhost:3000`) |

Copy the example into a `.env` file at the project root and fill in your values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
FLASK_SECRET_KEY=your-flask-secret
SCORING_ENGINE=embeddings
```

---

## Getting Started

### Using Docker Compose (recommended)

```bash
# Clone the repository
git clone https://github.com/richielagito/Upload_It_In.git
cd Upload_It_In

# Configure environment variables
cp .env.example .env   # then edit .env with your values

# Build and start all services
docker compose up --build
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

### Local Development

**Backend**

```bash
cd uploaditin_backend
pip install -r requirements.txt
flask run --port 5000
```

**Frontend**

```bash
cd uploaditin_v2
npm install
npm run dev
```

---

## Scoring Engines

| Engine | Set via | Description |
|---|---|---|
| `embeddings` | `SCORING_ENGINE=embeddings` | Uses `gemini-embedding-2-preview` for semantic similarity (default) |
| `legacy` | `SCORING_ENGINE=legacy` | Uses TF-IDF + LSA (SVD) cosine similarity |

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/assignments/upload/<id>` | Get assignment details |
| `POST` | `/api/assignments/upload/<id>` | Upload student answer & trigger grading |
| `GET` | `/api/admin/summary` | Admin: platform statistics |
| `GET` | `/api/admin/users` | Admin: list all users |
| `GET/POST` | `/api/admin/landing` | Admin: manage landing page content |

---

## Running Tests

```bash
# From the project root
pip install -r uploaditin_backend/requirements.txt
python -m pytest tests/ --tb=short -q
```

**Pre-deploy checks:**

```bash
python scripts/check_secrets.py
python scripts/check_env_contract.py
```

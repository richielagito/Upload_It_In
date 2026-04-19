# Upload It In — Essay Auto-Grading System

A full-stack web application for automated essay grading using text embedding models. Teachers can create classes and assignments, students upload their essay answers (PDF, DOCX, or TXT), and the system automatically scores each submission by computing semantic similarity between student answers and the teacher's model answers using Google Gemini embeddings.

---

## Features

- **Semantic auto-grading** — per-question scoring using `gemini-embedding-2-preview` cosine similarity (0–100 scale)
- **Legacy LSA grading** — fallback engine using TF-IDF + Latent Semantic Analysis (SVD) with Indonesian language support via Sastrawi
- **Multi-format file support** — PDF, DOCX, and TXT submissions
- **Class & assignment management** — teachers create classes with unique join codes; students enroll and submit per assignment
- **Supabase integration** — file storage and PostgreSQL database
- **Admin dashboard** — user management, class overview, and landing page content editing
- **Containerized deployment** — Docker Compose orchestrates the Flask backend and Next.js frontend

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

### Required environment variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `SUPABASE_SECRET_KEY` | Supabase service_role/secret key |
| `GEMINI_API_KEY` | Google GenAI API key (required for embedding scoring) |
| `FLASK_SECRET_KEY` | Flask session secret key |
| `SCORING_ENGINE` | `embeddings` (default) or `legacy` |
| `EMBEDDING_NORMALIZE` | *(Optional)* `true` to enable L2 normalization of vectors |

Copy the example below into a `.env` file at the project root:

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

### Local development

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

## How It Works

1. **Teacher** creates a class (a unique 6-character join code is generated) and adds an assignment with a model answer file.
2. **Student** enrolls in the class using the join code and uploads their answer file for each assignment.
3. The backend extracts text from the uploaded file, then:
   - Parses answers by question number using the pattern `Jawaban N = ...`
   - Generates embeddings for both the model answers and student answers via the Gemini API
   - Computes cosine similarity per question and averages them for a final grade (0–100)
4. Results are stored in the `hasil_penilaian` table in PostgreSQL and are viewable through the dashboard.

### Scoring engines

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
cd Upload_It_In
pip install -r uploaditin_backend/requirements.txt
pytest tests/
```

**Pre-deploy checks:**

```bash
python scripts/check_secrets.py
python scripts/check_env_contract.py
```

---

## Team

**NLP Team:**
- OctoNik — Nikolaus Nathaniel (535230113)
- Borjues — Dhani Andika Maharsi (535230149)

**Software Development Team:**
- Jalsson (535230145)
- Richie Lagito (535230037)
- Nikolaus Nathaniel (535230113)
- Dhani Andika Maharsi (535230149)

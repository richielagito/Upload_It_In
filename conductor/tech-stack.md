# Tech Stack

## Frontend
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS, Framer Motion (for animations)
- **State Management & Data Fetching:** SWR
- **UI Components:** Lucide-React (icons), SweetAlert2, Sonner (notifications)
- **Client Library:** @supabase/supabase-js, @supabase/ssr

## Backend
- **Language:** Python
- **Framework:** Flask
- **CORS:** Flask-CORS
- **PDF & Document Processing:** docx, easyocr (for OCR support), beautifulsoup4 (HTML parsing)

## Database & Infrastructure
- **BaaS:** Supabase (PostgreSQL database, Auth, Storage)
- **Deployment:** Docker, Docker Compose

## Machine Learning & NLP
- **Primary Grading:** Google Gemini Embeddings (`gemini-embedding-2-preview`)
- **Feedback Generation:** Google Gemini 3.1 Flash-Lite (`gemini-3.1-flash-lite-preview`)
- **Fallback Grading:** Latent Semantic Analysis (LSA) using TF-IDF + SVD    

- **Indonesian NLP:** Sastrawi (Stemming and Stopword removal)
- **Embeddings/Similarity:** Semantic similarity computed via cosine similarity.

# Migration & Operations Runbook: Embedding + Supabase Modernization

## Purpose & scope
This runbook provides step-by-step guidance for migrating the essay grading engine from legacy LSA to Google Embeddings (`google-embedding-2-preview`) and modernizing Supabase key usage. Infrastructure changes (database migrations or vector DB additions) are out of scope.

## Required environment variables
The following variables must be set in the runtime environment. Do NOT hardcode these in source files.

- `SUPABASE_URL`: Your Supabase project URL.
- `SUPABASE_PUBLISHABLE_KEY`: The 'anon' or publishable key for client-side/static assets.
- `SUPABASE_SECRET_KEY`: The 'service_role' or secret key for server-side operations.
- `GEMINI_API_KEY`: API key for Google GenAI (required if `SCORING_ENGINE=embeddings`).
- `SCORING_ENGINE`: Set to `embeddings` (default) or `legacy`.
- `EMBEDDING_NORMALIZE`: (Optional) Set to `true` to enable L2 normalization.

## Pre-deploy checklist
- [ ] Verify all required environment variables are available in the target environment.
- [ ] Ensure `google-genai` is listed in `requirements.txt`.
- [ ] Run security and contract checks: `python scripts/check_secrets.py` and `python scripts/check_env_contract.py`.
- [ ] Verify that no hardcoded keys exist in `static/db.js` or `app.py`.

## Deployment steps
1. **Set Environment Variables**: Configure the host or container environment with the required keys listed above.
2. **Install Dependencies**: `pip install -r requirements.txt`.
3. **Restart Service**: Restart the Flask backend to pick up new configurations and the `SCORING_ENGINE` setting.

## Enabling embeddings (SCORING_ENGINE=embeddings)
To enable the new semantic grading engine:
1. Set `SCORING_ENGINE=embeddings`.
2. Ensure `GEMINI_API_KEY` is valid.
3. **Smoke Test**: Upload a student answer via `POST /api/assignments/upload/<id>`.
   - **Expected Output**: A JSON response with `success: true`, a numeric `grade` (0-100), and a `similarity` float.
   - **Verification**: Check `hasil_penilaian` table in Supabase to ensure the record was persisted with the correct fields.

## Rolling back to legacy (SCORING_ENGINE=legacy)
If issues occur with the embedding provider or scoring logic:
1. Set `SCORING_ENGINE=legacy`.
2. Restart the service.
3. **Verification**: The system will revert to using the LSA+cosine similarity logic. Existing `hasil_penilaian` records remain compatible.

## Supabase key rotation guidance
- **Publishable Key**: Update `SUPABASE_PUBLISHABLE_KEY` in the environment. Static assets (`static/db.js`) should fetch this from the server or be rebuilt with the new value. Ensure no secrets are leaked to the client.
- **Secret Key**: Update `SUPABASE_SECRET_KEY` in the server environment and restart. This key has full bypass-RLS permissions; handle with extreme care.
- **Static Assets**: Ensure any client-side code referencing Supabase uses the publishable key only.

## Operational verification commands
Run these commands to verify system health and security:

- **Security Scan**:
  ```bash
  python scripts/check_secrets.py
  ```
- **Environment Contract**:
  ```bash
  python scripts/check_env_contract.py
  ```
- **Test Suite**:
  ```bash
  python -m pytest tests/test_security_contract.py
  python -m pytest tests/test_scoring_regression.py
  python -m pytest tests/test_upload_endpoint.py
  ```
- **Endpoint Smoke Tests (CURL)**:
  - **Set Session**:
    ```bash
    curl -X POST http://localhost:5000/set_session -H "Content-Type: application/json" -d '{"access_token": "YOUR_TOKEN"}'
    ```
  - **Upload & Grade**:
    ```bash
    curl -X POST http://localhost:5000/api/assignments/upload/123 -F "file=@essay.pdf"
    ```

## Troubleshooting
- **Missing API Key**: If `GEMINI_API_KEY` is missing, the scorer will fail fast. Check logs for "GEMINI_API_KEY is not set".
- **429 Rate Limit**: The embedding client includes exponential backoff. If it persists, check your Google AI Studio quota.
- **401/403 Supabase**: Verify `SUPABASE_SECRET_KEY` permissions. Ensure the key has access to the `uploads` bucket and `hasil_penilaian` table.
- **Download Failure**: Ensure the teacher's original assignment file exists in the `uploads` bucket at the path stored in the `assignments` table.

## Contact & escalation steps
- **Primary**: Backend Engineering Team
- **Infra**: DevOps/Cloud Ops Team
- **Escalation**: System Architect

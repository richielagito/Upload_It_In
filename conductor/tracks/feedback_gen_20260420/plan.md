# Implementation Plan: Implement Automated Pedagogical Feedback Generation using Gemini

## Phase 1: Backend Integration & Feedback Generation
- [x] Task: Backend - Research and Prototype Feedback Prompting
    - [x] Research optimal prompting strategies for pedagogical feedback using Gemini.
    - [x] Prototype a feedback generation function in a Jupyter notebook or standalone script.
- [x] Task: Backend - Update Database Schema
    - [x] Create a migration or update the Supabase schema to include a `feedback` field in the submissions/grades table.
- [x] Task: Backend - Implement Feedback Generation Service
    - [x] Write tests for the feedback generation service.
    - [x] Implement the service using the Google GenAI SDK.
    - [x] Integrate the service into the existing grading workflow in `app.py`.    
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)
## Phase 2: Frontend Display & User Experience
- [ ] Task: Frontend - Update API Client
    - [ ] Update the frontend API client to fetch the new `feedback` field.
- [ ] Task: Frontend - Implement Student Feedback View
    - [ ] Design and implement the feedback display component in the student dashboard.
    - [ ] Write tests for the feedback display component.
- [ ] Task: Frontend - Implement Teacher Feedback Review
    - [ ] Update the teacher dashboard to allow teachers to review and potentially edit the automated feedback.
    - [ ] Write tests for the teacher review component.
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

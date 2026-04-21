# Implementation Plan: Manual Review & Override (CoGrader)

## Phase 1: Database Schema & Migration
- [ ] Task: Update Supabase schema for submissions/grades
    - [ ] Update tables to include a `status` column (e.g., enum: 'draft', 'published', default: 'draft')
    - [ ] Ensure existing records are migrated safely (default to 'published' for legacy records if applicable)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Database Schema & Migration' (Protocol in workflow.md)

## Phase 2: Backend API Updates (Flask)
- [ ] Task: Modify AI Grading endpoints for Draft Mode
    - [ ] Write failing test for AI grading returning 'draft' status
    - [ ] Update AI grading logic to save initial results with 'draft' status
    - [ ] Refactor and ensure tests pass
- [ ] Task: Create Override & Publish endpoint
    - [ ] Write failing test for updating scores, sub-scores, feedback, and setting status to 'published'
    - [ ] Implement the override endpoint that fully replaces existing AI values in the database
    - [ ] Refactor and ensure tests pass
- [ ] Task: Update Student Fetch endpoints
    - [ ] Write failing test to ensure only 'published' grades are returned for students
    - [ ] Update database queries to filter by 'published' status when accessed by students
    - [ ] Refactor and ensure tests pass
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Backend API Updates (Flask)' (Protocol in workflow.md)

## Phase 3: Frontend Updates - Teacher Dashboard (Next.js)
- [ ] Task: Update Submission List UI
    - [ ] Fetch and display 'Draft' vs 'Published' status badges on the teacher dashboard
- [ ] Task: Implement Manual Review Interface
    - [ ] Create an intuitive UI (modal or new page) to display AI suggestions (Final Score, Sub-scores, Feedback)
    - [ ] Add editable input fields for all modifiable elements
    - [ ] Add Action buttons: "Save Draft" and "Publish to Student"
- [ ] Task: Integrate UI with Backend API
    - [ ] Hook up "Save Draft" to the Override endpoint (keeping status as 'draft')
    - [ ] Hook up "Publish to Student" to the Override endpoint (setting status to 'published')
    - [ ] Implement loading states and error handling via SweetAlert2/Sonner
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Frontend Updates - Teacher Dashboard (Next.js)' (Protocol in workflow.md)

## Phase 4: Frontend Updates - Student Dashboard (Next.js)
- [ ] Task: Ensure Draft Privacy
    - [ ] Verify that the student dashboard correctly handles and hides submissions that are still in 'draft' status
    - [ ] Update UI to indicate "Pending Teacher Review" for submitted but ungraded/draft assignments
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Frontend Updates - Student Dashboard (Next.js)' (Protocol in workflow.md)
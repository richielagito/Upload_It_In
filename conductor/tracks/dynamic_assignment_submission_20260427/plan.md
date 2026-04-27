# Implementation Plan: Dynamic Assignment Submission & Publication Control

## Phase 1: Database and Backend Support
- [ ] Task: Update Database Schema for Submissions
    - [ ] Update `submissions` table to support versioning (e.g., add `is_active` boolean, `version` integer).
    - [ ] Update `grades` or `assignments` table to include an `is_published` boolean flag.
- [ ] Task: Update Backend API for Submissions (TDD)
    - [ ] Write test for "Turn In" (creating a new submission version, marking older ones inactive).
    - [ ] Write test for "Undo Turn In" (handling state changes and checking deadline constraints).
    - [ ] Implement backend logic to handle versioning and active flags.
    - [ ] Implement backend logic to enforce deadline checks on "Undo Turn In".
- [ ] Task: Conductor - User Manual Verification 'Database and Backend Support' (Protocol in workflow.md)

## Phase 2: Teacher View Enhancements
- [ ] Task: Update Teacher Dashboard API (TDD)
    - [ ] Write test for toggling `is_published` on a student's grade/feedback.
    - [ ] Implement the endpoint to publish/unpublish grades.
- [ ] Task: Update Teacher UI
    - [ ] Add a "Publish Feedback" button or toggle to the teacher's grading interface.
    - [ ] Add UI to view the submission history for a student (showing all versions, highlighting the active one).
- [ ] Task: Conductor - User Manual Verification 'Teacher View Enhancements' (Protocol in workflow.md)

## Phase 3: Student View - Assignment Card & Two-Stage Upload
- [ ] Task: Refactor Assignment Card Component
    - [ ] Move existing upload UI from the Feedback Panel to the Assignment Card.
    - [ ] Implement "Upload" button to stage files locally in React state (`useState`).
- [ ] Task: Implement Turn In Logic
    - [ ] Implement "Turn In" button to push staged files to Supabase Storage and create the database record.
    - [ ] Handle loading states, progress indicators, and success/error notifications.
- [ ] Task: Conductor - User Manual Verification 'Student View - Assignment Card & Two-Stage Upload' (Protocol in workflow.md)

## Phase 4: Student View - Undo & Feedback Visibility
- [ ] Task: Implement Undo Functionality
    - [ ] Add "Undo Turn In" button to the Assignment Card (visible only if an active submission exists).
    - [ ] Implement client-side logic to call the backend Undo endpoint.
    - [ ] Disable the Undo button if the assignment deadline has passed.
- [ ] Task: Control Feedback Panel Visibility
    - [ ] Conditionally render the Feedback Panel based on the `is_published` flag from the database.
    - [ ] Display a placeholder message (e.g., "Grades pending publication") if `is_published` is false.
- [ ] Task: Conductor - User Manual Verification 'Student View - Undo & Feedback Visibility' (Protocol in workflow.md)

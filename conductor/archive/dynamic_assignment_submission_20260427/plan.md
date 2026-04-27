# Implementation Plan: Dynamic Assignment Submission & Publication Control

## Phase 1: Database and Backend Support
- [x] Task: Update Database Schema for Submissions
    - [x] Update `submissions` table to support versioning (e.g., add `is_active` boolean, `version` integer).
    - [x] Update `grades` or `assignments` table to include an `is_published` boolean flag.
- [x] Task: Update Backend API for Submissions (TDD)
    - [ ] Write test for "Turn In" (creating a new submission version, marking older ones inactive).
    - [ ] Write test for "Undo Turn In" (handling state changes and checking deadline constraints).
    - [x] Implement backend logic to handle versioning and active flags.
    - [x] Implement backend logic to enforce deadline checks on "Undo Turn In".
- [x] Task: Conductor - User Manual Verification 'Database and Backend Support' (Protocol in workflow.md)

## Phase 2: Teacher View Enhancements
- [x] Task: Update Teacher Dashboard API (TDD)
    - [ ] Write test for toggling `is_published` on a student's grade/feedback.
    - [x] Implement the endpoint to publish/unpublish grades.
- [x] Task: Update Teacher UI
    - [x] Add a "Publish Feedback" button or toggle to the teacher's grading interface.
    - [x] Add UI to view the submission history for a student (showing all versions, highlighting the active one).
- [x] Task: Conductor - User Manual Verification 'Teacher View Enhancements' (Protocol in workflow.md)

## Phase 3: Student View - Assignment Card & Two-Stage Upload
- [x] Task: Refactor Assignment Card Component
    - [x] Move existing upload UI from the Feedback Panel to the Assignment Card.
    - [x] Implement "Upload" button to stage files locally in React state (`useState`).
- [x] Task: Implement Turn In Logic
    - [x] Implement "Turn In" button to push staged files to Supabase Storage and create the database record.
    - [x] Handle loading states, progress indicators, and success/error notifications.
- [x] Task: Conductor - User Manual Verification 'Student View - Assignment Card & Two-Stage Upload' (Protocol in workflow.md)

## Phase 4: Student View - Undo & Feedback Visibility
- [x] Task: Implement Undo Functionality
    - [x] Add "Undo Turn In" button to the Assignment Card (visible only if an active submission exists).
    - [x] Implement client-side logic to call the backend Undo endpoint.
    - [x] Disable the Undo button if the assignment deadline has passed.
- [x] Task: Control Feedback Panel Visibility
    - [x] Conditionally render the Feedback Panel based on the `is_published` flag from the database.
    - [x] Display a placeholder message (e.g., "Grades pending publication") if `is_published` is false.
- [x] Task: Conductor - User Manual Verification 'Student View - Undo & Feedback Visibility' (Protocol in workflow.md)

## Phase: Review Fixes
- [x] Task: Apply review suggestions 286a69d

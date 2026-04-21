# Implementation Plan: Student Dashboard Enhancements

## Phase 1: Preparation & Component Setup
- [x] Task: Create new component `FeedbackPanel` in `Upload_It_In/uploaditin_v2/app/components/dashboard/FeedbackPanel.js`.
- [ ] Task: Define the structure of the `FeedbackPanel` (Overlay, Content, Mock Criteria Breakdown).
- [ ] Task: Update `ClassDetailsStudent` state to manage the visibility of the `FeedbackPanel` and the selected assignment for feedback.

## Phase 2: Assignment Card Refactoring
- [ ] Task: Update the assignment card rendering in `Upload_It_In/uploaditin_v2/app/kelas-murid/[kode_kelas]/page.js`.
- [ ] Task: Implement "Grade Summary" logic inside the assignment card (Score, Grade Label, Similarity Index).
- [ ] Task: Implement dynamic action button logic (Submit Answer, Pending Review, View Detail).
- [ ] Task: Add "Re-upload" capability to the card/form if the deadline is open.

## Phase 3: Feedback Panel Implementation
- [ ] Task: Integrate `FeedbackPanel` into the `ClassDetailsStudent` page.
- [ ] Task: Pass the necessary data (feedback message, criteria breakdown, submission link) to the `FeedbackPanel`.
- [ ] Task: Implement the "Re-upload" button logic within the `FeedbackPanel` (triggering the upload form).

## Phase 4: UI Clean-up & Finalization
- [ ] Task: Remove the "My Grades" section from the bottom of the page.
- [ ] Task: Final styling adjustments for consistency and responsiveness.
- [ ] Task: Conductor - User Manual Verification 'Student Dashboard Enhancements' (Protocol in workflow.md)

# Implementation Plan: Defer AI Grading to Teacher Trigger

## Phase 1: Backend Updates (API & Logic)
- [x] Task: Update the student upload endpoint to bypass AI grading.
    - [x] Write tests verifying that uploading a file saves it but does not trigger the AI grading function.
    - [x] Modify the Flask route/controller handling file uploads to skip the `generate_feedback` call and only mark the submission status.
    - [x] Refactor as needed.
- [x] Task: Implement the new "Trigger Grading" API endpoint.
    - [x] Write tests verifying the endpoint accepts a submission ID (or list of IDs), triggers the AI grading logic, and updates the database.
    - [x] Implement the Flask route for manual grading invocation.
    - [x] Ensure the endpoint validates that the assignment deadline has passed before proceeding.
- [ ] Task: Conductor - User Manual Verification 'Backend Updates' (Protocol in workflow.md)

## Phase 2: Frontend Updates (Student View)
- [x] Task: Update the student assignment detail view.
    - [x] Write/update tests to ensure the UI displays "Submitted - Pending Review" (or similar mapped status) instead of waiting for immediate AI feedback.
    - [x] Modify the Next.js component to reflect the new pending status.
    - [x] Update the upload component to disable re-uploading if the current time is past the assignment deadline.
- [ ] Task: Conductor - User Manual Verification 'Frontend Updates (Student View)' (Protocol in workflow.md)

## Phase 3: Frontend Updates (Teacher Dashboard)
- [x] Task: Add "Grade Now" individual and bulk buttons.
    - [x] Write/update tests verifying the buttons render correctly and are disabled/hidden if the deadline hasn't passed.
    - [x] Modify the Teacher Assignment Detail component to include the "Grade Now" button per student row/card and a "Bulk Grade" button.
    - [x] Implement the logic to disable these buttons based on the assignment deadline.
- [x] Task: Implement integration with the "Trigger Grading" API.
    - [x] Implement the `onClick` handlers to call the new API endpoint.
    - [x] Add loading state indicators (spinners/overlays) while grading is in progress.
    - [x] Update the UI state to show the newly generated grade/feedback upon successful API response.
- [ ] Task: Conductor - User Manual Verification 'Frontend Updates (Teacher Dashboard)' (Protocol in workflow.md)

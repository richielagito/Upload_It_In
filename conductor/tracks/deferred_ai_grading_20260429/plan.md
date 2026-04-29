# Implementation Plan: Defer AI Grading to Teacher Trigger

## Phase 1: Backend Updates (API & Logic)
- [ ] Task: Update the student upload endpoint to bypass AI grading.
    - [ ] Write tests verifying that uploading a file saves it but does not trigger the AI grading function.
    - [ ] Modify the Flask route/controller handling file uploads to skip the `generate_feedback` call and only mark the submission status.
    - [ ] Refactor as needed.
- [ ] Task: Implement the new "Trigger Grading" API endpoint.
    - [ ] Write tests verifying the endpoint accepts a submission ID (or list of IDs), triggers the AI grading logic, and updates the database.
    - [ ] Implement the Flask route for manual grading invocation.
    - [ ] Ensure the endpoint validates that the assignment deadline has passed before proceeding.
- [ ] Task: Conductor - User Manual Verification 'Backend Updates' (Protocol in workflow.md)

## Phase 2: Frontend Updates (Student View)
- [ ] Task: Update the student assignment detail view.
    - [ ] Write/update tests to ensure the UI displays "Submitted - Pending Review" (or similar mapped status) instead of waiting for immediate AI feedback.
    - [ ] Modify the Next.js component to reflect the new pending status.
    - [ ] Update the upload component to disable re-uploading if the current time is past the assignment deadline.
- [ ] Task: Conductor - User Manual Verification 'Frontend Updates (Student View)' (Protocol in workflow.md)

## Phase 3: Frontend Updates (Teacher Dashboard)
- [ ] Task: Add "Grade Now" individual and bulk buttons.
    - [ ] Write/update tests verifying the buttons render correctly and are disabled/hidden if the deadline hasn't passed.
    - [ ] Modify the Teacher Assignment Detail component to include the "Grade Now" button per student row/card and a "Bulk Grade" button.
    - [ ] Implement the logic to disable these buttons based on the assignment deadline.
- [ ] Task: Implement integration with the "Trigger Grading" API.
    - [ ] Implement the `onClick` handlers to call the new API endpoint.
    - [ ] Add loading state indicators (spinners/overlays) while grading is in progress.
    - [ ] Update the UI state to show the newly generated grade/feedback upon successful API response.
- [ ] Task: Conductor - User Manual Verification 'Frontend Updates (Teacher Dashboard)' (Protocol in workflow.md)

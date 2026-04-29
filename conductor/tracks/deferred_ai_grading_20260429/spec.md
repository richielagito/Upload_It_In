# Specification: Defer AI Grading to Teacher Trigger

## Overview
Change the assignment submission flow to save AI processing tokens. Instead of the AI automatically grading an essay as soon as a student uploads it, the system will now only store the file and mark it as submitted. The AI grading and feedback generation will be manually triggered by the teacher, either individually or in bulk, after the assignment deadline has passed.

## Functional Requirements
1.  **Student Upload Flow:**
    *   When a student uploads an assignment, the system should only upload the file to storage (and update database records) without triggering the AI grading endpoint.
    *   The student's UI should show a status like "Submitted - Pending Review".
    *   Students can re-upload and replace their file ONLY if the assignment deadline has not passed. The "published" status is strictly for the teacher revealing grades to students and does not affect re-upload eligibility.
2.  **Teacher Dashboard - Grading Triggers:**
    *   Introduce an individual "Grade Now" (or "Generate AI Grade") button for each student's submission.
    *   Introduce a "Bulk Grade" button to trigger AI grading for all ungraded submissions in the assignment.
    *   **Deadline Constraint:** The "Grade Now" and "Bulk Grade" buttons must be disabled (or hidden) and unusable until the assignment's deadline has passed. This prevents grading a file that might be subsequently re-uploaded by the student.
3.  **AI Grading Execution:**
    *   When triggered by the teacher, the backend must process the specific file(s), generate the AI score and feedback, and update the submission records accordingly.
    *   During the grading process, the UI should indicate loading/processing status to the teacher.

## Non-Functional Requirements
*   **Token Optimization:** This change must ensure no AI tokens are consumed during the initial student upload phase.
*   **Performance:** Bulk grading should handle multiple submissions gracefully (e.g., async processing or clear progress indicators) to prevent UI freezing.

## Acceptance Criteria
*   [ ] Student uploads a file -> AI grading is NOT triggered. Status shows "Submitted - Pending Review".
*   [ ] Student re-uploads a file BEFORE deadline -> Old file is replaced, AI is still NOT triggered.
*   [ ] Student attempts to re-upload AFTER deadline -> Upload is blocked/disabled.
*   [ ] Teacher views dashboard before deadline -> "Grade Now" buttons are disabled/hidden.
*   [ ] Teacher views dashboard after deadline -> "Grade Now" buttons are active.
*   [ ] Teacher clicks individual "Grade Now" -> AI grades only that submission.
*   [ ] Teacher clicks "Bulk Grade" -> AI grades all pending submissions.

## Out of Scope
*   Modifying the actual AI grading logic (prompt, embeddings, LSA). This track focuses purely on *when* the grading is triggered.

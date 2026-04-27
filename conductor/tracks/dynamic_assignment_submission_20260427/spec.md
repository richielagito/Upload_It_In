# Track Specification: Dynamic Assignment Submission & Publication Control

## Overview
This feature refactors the student view for assignment submissions. It centralizes the upload workflow into the Assignment Card, introduces a two-stage "Upload & Turn In" process, manages submission history with an "Undo" capability, and restricts the visibility of the Feedback Panel until the teacher explicitly publishes the grades.

## Functional Requirements
1.  **Feedback Publication Control:**
    -   The Feedback Panel must remain hidden from the student until the teacher marks the assignment's feedback/grade as "Published".
2.  **Centralized Submission UI:**
    -   Move all file upload and "Turn In" logic out of the Feedback Panel.
    -   Integrate the upload UI directly into the main Assignment Card (which displays title, description, references, and deadline).
    -   Retain the existing upload styling for consistency.
3.  **Two-Stage Workflow:**
    -   **Stage 1 (Upload):** Clicking "Upload" stages the selected file(s) in client-side memory (React state). No server interaction occurs yet.
    -   **Stage 2 (Turn In):** Clicking "Turn In" pushes the staged file(s) to the server (Supabase Storage) and creates the corresponding database records.
4.  **Submission History & Undo:**
    -   Provide an "Undo Turn In" button to allow students to retract a submission and upload a new one.
    -   **Version History:** In the database (Supabase), maintain a persistent history of all submissions for the teacher's reference. Use an "active" or "latest" flag to identify the current submission, rather than deleting previous records.
    -   **Overwriting:** If a student uploads a file with the exact same content/name (duplicate), overwrite it; otherwise, preserve unique versions.
5.  **Restrictions:**
    -   The "Undo Turn In" functionality must be disabled if the assignment's deadline has passed.

## Non-Functional Requirements
-   **Performance:** Client-side staging must not cause UI lag, even with large allowed file sizes.
-   **Security:** Ensure robust validation on the "Turn In" action to prevent bypassing deadline checks via API calls.

## Acceptance Criteria
-   [ ] Students cannot see the Feedback Panel before the teacher publishes it.
-   [ ] The upload interface is located on the Assignment Card.
-   [ ] Files are staged locally and only uploaded upon clicking "Turn In".
-   [ ] Students can undo their submission if the deadline has not passed.
-   [ ] Teachers can view the history of a student's submissions, with the active one clearly marked.

## Out of Scope
-   Changes to the teacher's grading interface (other than adding the "Publish" toggle).
-   Modifications to the underlying NLP grading engine.

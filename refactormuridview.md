### **Feature: Dynamic Assignment Submission & Publication Control**
*   **Restricted Access:** Hide the Feedback Panel entirely until the teacher officially publishes grades/feedback.
*   **Centralized Submission:** Move all upload and "Turn In" logic from the Feedback Panel to the Assignment Card (which displays title, description, references, and deadline).
*   **Two-Stage Workflow:** 
    *   **Stage:** "Upload" button handles client-side file staging.
    *   **Commit:** "Turn In" button pushes staged files to the server.
*   **Submission History:** Enable "Undo Turn In" to allow re-uploads. Maintain a persistent file history for teachers where duplicate files are overwritten but unique versions are preserved.
*   **UI Consistency:** Retain the existing upload styling but restrict it exclusively to the Assignment Card interface.

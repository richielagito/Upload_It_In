# Specification: Full-Page Assignment Detail View

## 1. Overview
Transition the student dashboard from the current "Side-Drawer" feedback panel to a full-page, immersive "Detail View" for assignments. This redesign aims to provide a focused, "Teams-style" experience, reducing visual clutter and emphasizing assignment details and feedback.

## 2. Functional Requirements

### 2.1 UI/UX Flow
- **Default View (List Mode):** The student sees a grid/list of assignments upon entering a class.
- **Detail View:** Clicking an assignment hides the assignment list entirely and displays the assignment details (feedback, scores, etc.) in the full content area.
- **Navigation & Header:**
  - The left navbar remains consistently visible.
  - In Detail View, the header title updates to the **Assignment Title**.
  - A "Back to Class" button is present in the header (or within the detail view) to return to the List Mode.

### 2.2 File Interaction (Teams Style)
- **File Cards:** Uploaded or attached files are displayed as rich "File Cards" rather than simple links.
  - Cards include a visual file icon (e.g., PDF, DOCX), the filename, and clear action buttons.
- **Actions:** Students can both **Preview** and **Download** their files directly from the card.
- **Upload State:** During upload, a simulated loading state (e.g., progress bar or animated underline) is shown on the card to indicate activity.

### 2.3 Turn In Workflow
- **Staging:** Uploading a file stages it for submission but does not immediately finalize it.
- **Submission:** A prominent "Turn In" button becomes active only after the file is fully uploaded. The user cannot turn in while an upload is in progress.
- **Resubmission:** If an assignment is already submitted or graded (and revisions are allowed), the button displays "Turn In Again".
- **File Replacement:** When a student uploads a new file for a resubmission, it will **overwrite the previous submission**.

## 3. Technical Requirements
- **State Management:** Implement a `viewMode` state (e.g., `'list'` vs. `'detail'`) to toggle the visibility of the assignment list and detail view.
- **Component Refactoring:** Modify the existing `FeedbackPanel.js` (or similar components) by removing overlay styles (`fixed inset-0`, `bg-slate-900/60`, `backdrop-blur`) and adjusting width to fill the `DashboardShell` content area (`w-full`).

## 4. Acceptance Criteria
- [ ] Clicking an assignment transitions the view to full-page, hiding the list view.
- [ ] The header correctly displays the assignment title and a functional "Back to Class" button.
- [ ] Uploaded files are rendered as interactive cards with correct icons.
- [ ] The file card provides both "Preview" and "Download" actions.
- [ ] A simulated loading animation is displayed during file uploads.
- [ ] The "Turn In" button is only enabled after the upload completes.
- [ ] Resubmitting an assignment correctly overwrites the previous file.
- [ ] The left navigation bar remains functional and visible throughout the flow.

## 5. Out of Scope
- Real-time/XHR upload progress tracking (simulated loading is sufficient).
- A complete history of past submissions (only the latest submission is retained).
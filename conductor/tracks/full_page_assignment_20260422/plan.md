# Implementation Plan: Full-Page Assignment Detail View

## Phase 1: State Management & Layout Restructuring
- [x] Task: Introduce `viewMode` state in the main Student Dashboard component.
    - [x] Add state `const [viewMode, setViewMode] = useState('list')` (or similar depending on the component).
    - [x] Update assignment click handler to `setViewMode('detail')`.
- [x] Task: Conditionally render the Assignment List.
    - [x] Hide the assignment list when `viewMode === 'detail'`.
- [x] Task: Refactor `FeedbackPanel.js` for Full-Page view.
    - [x] Remove overlay styles (`fixed inset-0`, `bg-slate-900/60`, `backdrop-blur`).
    - [x] Adjust container width to `w-full` to fit the dashboard content area.
- [x] Task: Update Header and Navigation logic.
    - [x] Render dynamic header title based on `viewMode` (Class Name vs. Assignment Title).
    - [x] Implement "Back to Class" button that resets `viewMode` to `'list'`.
- [x] Task: Conductor - User Manual Verification 'Phase 1: State Management & Layout Restructuring' (Protocol in workflow.md)

## Phase 2: File Interaction & Teams-Style Cards
- [x] Task: Create or refactor a `FileCard` component.
    - [x] Implement UI for file icon (PDF/DOCX), filename, and interactive state.
    - [x] Add "Preview" and "Download" buttons on the card.
- [x] Task: Integrate `FileCard` into the Detail View.
    - [x] Display attached assignment files using the new `FileCard` component.
- [x] Task: Conductor - User Manual Verification 'Phase 2: File Interaction & Teams-Style Cards' (Protocol in workflow.md)

## Phase 3: Turn In Workflow & Upload Simulation
- [x] Task: Implement Staging state for file uploads.
    - [x] Allow users to upload a file which gets staged before submission.
- [x] Task: Implement Simulated Loading during file upload.
    - [x] Show a loading animation/progress bar on the `FileCard` while the file is staging.
- [x] Task: Update "Turn In" button logic.
    - [x] Disable the "Turn In" button during the simulated loading state.
    - [x] Enable the "Turn In" button only after the file is successfully staged.
    - [x] Change button text to "Turn In Again" if a previous submission exists.
- [x] Task: Implement File Replacement logic.
    - [x] Ensure that a new file upload correctly overwrites the previously staged/submitted file in the component state before final submission.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Turn In Workflow & Upload Simulation' (Protocol in workflow.md)
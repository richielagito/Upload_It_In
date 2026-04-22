# Implementation Plan: Full-Page Assignment Detail View

## Phase 1: State Management & Layout Restructuring
- [ ] Task: Introduce `viewMode` state in the main Student Dashboard component.
    - [ ] Add state `const [viewMode, setViewMode] = useState('list')` (or similar depending on the component).
    - [ ] Update assignment click handler to `setViewMode('detail')`.
- [ ] Task: Conditionally render the Assignment List.
    - [ ] Hide the assignment list when `viewMode === 'detail'`.
- [ ] Task: Refactor `FeedbackPanel.js` for Full-Page view.
    - [ ] Remove overlay styles (`fixed inset-0`, `bg-slate-900/60`, `backdrop-blur`).
    - [ ] Adjust container width to `w-full` to fit the dashboard content area.
- [ ] Task: Update Header and Navigation logic.
    - [ ] Render dynamic header title based on `viewMode` (Class Name vs. Assignment Title).
    - [ ] Implement "Back to Class" button that resets `viewMode` to `'list'`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: State Management & Layout Restructuring' (Protocol in workflow.md)

## Phase 2: File Interaction & Teams-Style Cards
- [ ] Task: Create or refactor a `FileCard` component.
    - [ ] Implement UI for file icon (PDF/DOCX), filename, and interactive state.
    - [ ] Add "Preview" and "Download" buttons on the card.
- [ ] Task: Integrate `FileCard` into the Detail View.
    - [ ] Display attached assignment files using the new `FileCard` component.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: File Interaction & Teams-Style Cards' (Protocol in workflow.md)

## Phase 3: Turn In Workflow & Upload Simulation
- [ ] Task: Implement Staging state for file uploads.
    - [ ] Allow users to upload a file which gets staged before submission.
- [ ] Task: Implement Simulated Loading during file upload.
    - [ ] Show a loading animation/progress bar on the `FileCard` while the file is staging.
- [ ] Task: Update "Turn In" button logic.
    - [ ] Disable the "Turn In" button during the simulated loading state.
    - [ ] Enable the "Turn In" button only after the file is successfully staged.
    - [ ] Change button text to "Turn In Again" if a previous submission exists.
- [ ] Task: Implement File Replacement logic.
    - [ ] Ensure that a new file upload correctly overwrites the previously staged/submitted file in the component state before final submission.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Turn In Workflow & Upload Simulation' (Protocol in workflow.md)
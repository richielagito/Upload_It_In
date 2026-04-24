# Implementation Plan: Teacher Manual Review Text Highlighting

## Phase 1: Setup and Route Creation
- [x] Task: Create `ManualReview.js` component/page structure.
- [x] Task: Set up routing to navigate to this page from the teacher's dashboard (e.g., when clicking "Review" on an assignment).
- [x] Task: Fetch and pass necessary assignment and submission data to the new component.
- [x] Task: Conductor - User Manual Verification 'Setup and Route Creation' (Protocol in workflow.md)

## Phase 2: UI Implementation (Mockup to Code)
- [x] Task: Implement the split layout (left panel for essay, right panel for sidebar) using Tailwind CSS.
- [x] Task: Build the left panel components (Student Info header, Essay Question block, View Toggle buttons, Legend).
- [x] Task: Build the right sidebar components (Score display, Aspect breakdown list, AI Summary, Override section, Comment box).
- [x] Task: Ensure styling matches the provided `essay_review_mockup (1).html` using Tailwind and specific custom CSS classes where needed.
- [x] Task: Conductor - User Manual Verification 'UI Implementation (Mockup to Code)' (Protocol in workflow.md)

## Phase 3: Highlight Logic and View Toggle Integration
- [x] Task: Extract/Refactor the text highlighting rendering logic from the Student View to be reusable, or duplicate and adapt it for the `ManualReview` component.
- [x] Task: Implement React state for toggling between "highlight" and "plain" views.
- [x] Task: Render the essay text with `<span>` highlights and tooltips based on the backend data when "highlight" mode is active.
- [x] Task: Render plain text/HTML when "plain" mode is active.
- [x] Task: Apply custom CSS classes (`.highlight`, `.hl-good`, `.tooltip`, etc.) to the rendered text.
- [x] Task: Conductor - User Manual Verification 'Highlight Logic and View Toggle Integration' (Protocol in workflow.md)

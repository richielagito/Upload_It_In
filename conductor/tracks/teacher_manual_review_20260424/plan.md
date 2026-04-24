# Implementation Plan: Teacher Manual Review Text Highlighting

## Phase 1: Setup and Route Creation
- [ ] Task: Create `ManualReview.js` component/page structure.
- [ ] Task: Set up routing to navigate to this page from the teacher's dashboard (e.g., when clicking "Review" on an assignment).
- [ ] Task: Fetch and pass necessary assignment and submission data to the new component.
- [ ] Task: Conductor - User Manual Verification 'Setup and Route Creation' (Protocol in workflow.md)

## Phase 2: UI Implementation (Mockup to Code)
- [ ] Task: Implement the split layout (left panel for essay, right panel for sidebar) using Tailwind CSS.
- [ ] Task: Build the left panel components (Student Info header, Essay Question block, View Toggle buttons, Legend).
- [ ] Task: Build the right sidebar components (Score display, Aspect breakdown list, AI Summary, Override section, Comment box).
- [ ] Task: Ensure styling matches the provided `essay_review_mockup (1).html` using Tailwind and specific custom CSS classes where needed.
- [ ] Task: Conductor - User Manual Verification 'UI Implementation (Mockup to Code)' (Protocol in workflow.md)

## Phase 3: Highlight Logic and View Toggle Integration
- [ ] Task: Extract/Refactor the text highlighting rendering logic from the Student View to be reusable, or duplicate and adapt it for the `ManualReview` component.
- [ ] Task: Implement React state for toggling between "highlight" and "plain" views.
- [ ] Task: Render the essay text with `<span>` highlights and tooltips based on the backend data when "highlight" mode is active.
- [ ] Task: Render plain text/HTML when "plain" mode is active.
- [ ] Task: Apply custom CSS classes (`.highlight`, `.hl-good`, `.tooltip`, etc.) to the rendered text.
- [ ] Task: Conductor - User Manual Verification 'Highlight Logic and View Toggle Integration' (Protocol in workflow.md)

# Implementation Plan: Fix Layout of Student Assignment Detail

## Phase 1: Structural Refactoring of Top Section & Overview
- [ ] Task: Adjust Assignment Info & File width to cleanly align with the Grade Overview.
    - [ ] Update flex layout in `FeedbackPanel.js` for the top section on desktop (e.g., balance the sizing of `flex-1` vs `w-full lg:w-80`).
- [ ] Task: Standardize spacing inside the Grade Overview cards to align Final Score, Similarity, and Grade.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Structural Refactoring of Top Section & Overview' (Protocol in workflow.md)

## Phase 2: Feedback & Criteria Columns Balance
- [ ] Task: Refactor the grid layout for Teacher's Feedback and Criteria Breakdown to prevent mismatched heights.
    - [ ] Set `h-full` to both columns or align items to the top uniformly.
- [ ] Task: Standardize padding, borders, and margins inside the Teacher's Feedback box to match the crisp aesthetic.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Feedback & Criteria Columns Balance' (Protocol in workflow.md)

## Phase 3: Submission Area & Footer Fixes
- [ ] Task: Realign the layout for the "Your Work" grid on desktop.
    - [ ] Prevent FileCards from stretching awkwardly or getting cramped when there are two cards (e.g., original vs staged).
- [ ] Task: Adjust Footer Action buttons to span evenly.
    - [ ] Ensure that "Back to List", "Upload New", and "Turn In" buttons align correctly with equivalent gaps on large screens.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Submission Area & Footer Fixes' (Protocol in workflow.md)
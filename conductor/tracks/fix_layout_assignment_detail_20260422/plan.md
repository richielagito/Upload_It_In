# Implementation Plan: Fix Layout of Student Assignment Detail

## Phase 1: Structural Refactoring of Top Section & Overview
- [x] Task: Adjust Assignment Info & File width to cleanly align with the Grade Overview.
    - [x] Update flex layout in `FeedbackPanel.js` for the top section on desktop (e.g., balance the sizing of `flex-1` vs `w-full lg:w-80`).
- [x] Task: Standardize spacing inside the Grade Overview cards to align Final Score, Similarity, and Grade.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Structural Refactoring of Top Section & Overview' (Protocol in workflow.md)

## Phase 2: Feedback & Criteria Columns Balance
- [x] Task: Refactor the grid layout for Teacher's Feedback and Criteria Breakdown to prevent mismatched heights.
    - [x] Set `h-full` to both columns or align items to the top uniformly.
- [x] Task: Standardize padding, borders, and margins inside the Teacher's Feedback box to match the crisp aesthetic.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Feedback & Criteria Columns Balance' (Protocol in workflow.md)

## Phase 3: Submission Area & Footer Fixes
- [x] Task: Realign the layout for the "Your Work" grid on desktop.
    - [x] Prevent FileCards from stretching awkwardly or getting cramped when there are two cards (e.g., original vs staged).
- [x] Task: Adjust Footer Action buttons to span evenly.
    - [x] Ensure that "Back to List", "Upload New", and "Turn In" buttons align correctly with equivalent gaps on large screens.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Submission Area & Footer Fixes' (Protocol in workflow.md)
# Implementation Plan: Theme Unification (Dashboards)

## Phase 1: Sidebar & Navigation Unification
- [x] Task: Update the main Sidebar logo (`UploadItIn`) to use the primary theme color.
    - [x] Locate the Sidebar component and replace hardcoded logo colors.
- [x] Task: Update active menu item styles in the Sidebar/Navbar.
    - [x] Identify the active state classes (e.g., `bg-blue-50`).
    - [x] Replace with `bg-primary/10` or the unified soft blue.
- [x] Task: Unify hover states for navigation links.
    - [x] Ensure all navigation links use a consistent hover effect (e.g., `hover:bg-primary/5`).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Sidebar & Navigation Unification' (Protocol in workflow.md)

## Phase 2: Status Indicators & Badges Unification
- [x] Task: Update status badges (e.g., "Graded", "Pending", "Draft") to use the primary palette.
    - [x] Locate components rendering status badges (Assignment cards, submission lists).
    - [x] Replace Tailwind `blue-600` or similar with `bg-primary`, `text-primary`, etc.
- [x] Task: Unify Assignment Card specific highlights and accents.
    - [x] Ensure any blue accents within assignment cards use the primary theme.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Status Indicators & Badges Unification' (Protocol in workflow.md)

## Phase 3: Interactive Elements (Buttons & Inputs) Unification
- [x] Task: Refactor primary action buttons (e.g., "Submit", "Save", "Turn In").
    - [x] Ensure they use `bg-primary` or the standard gradient.
    - [x] Implement consistent hover states (e.g., `hover:bg-primary-container`).
- [x] Task: Refactor disabled states for buttons and inputs.
    - [x] Ensure disabled buttons have a consistent look (e.g., `opacity-50`, `cursor-not-allowed`) across all forms.
- [x] Task: Unify active/focus states for form inputs.
    - [x] Replace default blue focus rings with `focus:ring-primary`.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Interactive Elements (Buttons & Inputs) Unification' (Protocol in workflow.md)

## Phase 4: Final Sweep & Global Consistency Check
- [x] Task: Perform a final sweep of the dashboard components for any remaining hardcoded hex values or stray default Tailwind blue classes.
    - [x] Search for `#0052CC`, `blue-500`, `blue-600`, etc., in `uploaditin_v2/app/dashboard`, `uploaditin_v2/app/kelas`, and `uploaditin_v2/app/kelas-murid`.
- [x] Task: Ensure all changes align with `globals.css` CSS variables.
- [x] Task: Conductor - User Manual Verification 'Phase 4: Final Sweep & Global Consistency Check' (Protocol in workflow.md)

## Phase: Review Fixes
- [x] Task: Apply review suggestions b770fac
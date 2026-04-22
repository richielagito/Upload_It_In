# Specification: Theme Unification (Dashboards)

## Overview
This track focuses on harmonizing the color palette across the Scova application's dashboard components (Student and Teacher views, Assignment details, etc.). The goal is to ensure a consistent and professional look by strictly adhering to the primary color variables defined in the system (`globals.css` and Tailwind config). Note: Landing page and login/register pages have already been updated and serve as the baseline theme.

## Functional Requirements
- **Sidebar & Navbar**:
    - Update the logo "Upload**ItIn**" to the primary blue.
    - Update active menu items to use a consistent `bg-primary/10` or the unified soft blue instead of `bg-blue-50`.
- **Status Indicators**:
    - Switch status badges and labels currently using default Tailwind `blue-600` to the project's primary color palette (`bg-primary`, `text-primary`, etc.).
- **Interactive States**:
    - **Hover States**: Ensure all interactive elements (buttons, cards, links) have a consistent hover effect.
    - **Active/Selected States**: Ensure active menu items or selected cards use the consistent active blue (`primary-container`).
    - **Disabled States**: Unify the appearance of disabled buttons or inputs.
- **Component Refactoring**:
    - Replace any hardcoded hex values (e.g., `#0052CC`) or default Tailwind blue classes (e.g., `text-blue-600`) in dashboard-related components with Tailwind classes that reference the theme variables (`text-primary`, `bg-primary`, `fill-primary`, etc.).

## Non-Functional Requirements
- **Utility First**: Avoid hardcoded hex values in component files. Rely strictly on Tailwind theme variables.
- **Manual Refactoring**: No new linting rules will be added; this is a manual sweep of the designated components.

## Out of Scope
- Landing Page (`app/page.js`, `app/components/Hero.js`, etc.) - Already unified.
- Login and Register Pages (`app/login-register/page.js`) - Already unified.

## Acceptance Criteria
- [ ] All hardcoded blue hex codes and default `blue-*` Tailwind classes are removed from Dashboard, Class, and Assignment components.
- [ ] Sidebar logo and active items reflect the primary theme colors.
- [ ] Status badges use the primary color palette.
- [ ] Hover, active, and disabled states are consistent across all interactive elements in the dashboard views.
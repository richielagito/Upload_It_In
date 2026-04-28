# Specification: Minimalist Selected Assignment Styling

## Overview
The teacher's class detail page currently uses a heavy blue styling (background, ring, and border) to indicate which assignment is selected. To create a cleaner, less visually fatiguing experience, the styling will be reduced to only a primary blue outline (border).

## Functional Requirements
- When an assignment card is selected, it must NOT have a blue background (`bg-primary/5`).
- When an assignment card is selected, it must NOT have a blue ring (`ring-4 ring-primary/10`).
- The selected assignment card MUST retain the primary blue border (`border-primary`).
- The selected assignment card should keep a white background (`bg-white`) similar to unselected cards.
- To maintain readability, the title of the selected assignment will also revert to the default text color instead of primary blue, keeping the interface minimal.

## Scope
- `uploaditin_v2/app/kelas/[kode_kelas]/page.js`

## Out of Scope
- Functional changes to how assignments are selected or fetched.
- Other UI components on the page outside of the assignment list cards.
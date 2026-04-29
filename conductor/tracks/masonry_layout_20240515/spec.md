# Specification: Masonry Layout for Assignment Cards

## Goal
Improve the visual presentation of assignment cards in the student's class detail view by using a masonry layout instead of a fixed-height grid. This allows cards with longer descriptions or more content to occupy more vertical space without creating empty gaps in the rows.

## Target
- `app/kelas-murid/[kode_kelas]/page.js`

## Requirements
1. Change the card container from a CSS Grid (`grid grid-cols-1 md:grid-cols-2`) to a CSS Column-based layout (`columns-1 md:columns-2`).
2. Ensure vertical spacing between cards is consistent (`space-y-6` or similar).
3. Ensure cards do not break across columns (`break-inside-avoid-column` is already present in `AssignmentCard.js`).
4. Maintain the current gap between columns (`gap-6`).

## Visual Design
- The layout should look like a Pinterest-style board.
- Cards should stack vertically within columns.
- On mobile (single column), it should behave like a normal list.

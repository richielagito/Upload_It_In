# Implementation Plan: Refine Assignment Card Layout

## Phase 1: Research (Completed)
- [x] Analyze `AssignmentCard.js` layout.
- [x] Analyze `FileCard.js` layout.
- [x] Identify target classes for reduction.

## Phase 2: Refine FileCard.js (Completed)
- [x] Reduce padding from `p-5` to `p-3.5`.
- [x] Reduce icon container size from `w-12 h-12` to `w-10 h-10`.
- [x] Reduce icon size from `size={24}` to `size={20}`.
- [x] Adjust text sizes if necessary.

## Phase 3: Refine AssignmentCard.js (Completed)
- [x] Reduce general padding `p-8` to `p-6`.
- [x] Reduce bottom margins of description and reference material sections.
- [x] Reduce upload zone `py-8` to `py-6`.
- [x] Reduce button padding `py-4` to `py-3`.
- [x] Reduce button font size `text-lg` to `text-base`.
- [x] Optimize `space-y-6` and `space-y-3` gaps.

## Phase 4: Refine Grid Layout (Completed)
- [x] Adjust grid gap in `app/kelas-murid/[kode_kelas]/page.js` if necessary (current `gap-8` reduced to `gap-6`).

## Phase 6: Refine FeedbackPanel.js (Completed)
- [x] Reduce main padding from `p-8` to `p-6`.
- [x] Reduce vertical spacing `space-y-10` to `space-y-8`.
- [x] Compact the "Final Score" and summary cards.
- [x] Reduce padding in feedback and essay analysis boxes from `p-8` to `p-6`.

## Phase 7: Final Polish & Validation (Completed)
- [x] Further reduce `AssignmentCard` button padding to `py-2.5`.
- [x] Reduce `UploadCloud` icon size in upload zone to `28`.
- [x] Verify overall consistency across student view.

## Phase 8: Review Fixes (Completed)
- [x] Apply review suggestions 396a0bf

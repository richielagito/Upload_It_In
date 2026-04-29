# Specification: Refine Assignment Card Layout

## Goal
Improve the visual density of the student assignment cards by reducing oversized elements (buttons, file cards, upload zone) and optimizing spacing (margins, gaps).

## Scope
- `uploaditin_v2/app/components/dashboard/AssignmentCard.js`
- `uploaditin_v2/app/components/dashboard/FileCard.js`
- `uploaditin_v2/app/kelas-murid/[kode_kelas]/page.js`

## Requirements
1.  **Buttons**: Reduce vertical padding (`py-4` -> `py-3` or `py-2.5`) and font size (`text-lg` -> `text-base`).
2.  **File Cards**: Reduce internal padding (`p-5` -> `p-3` or `p-4`) and icon size in `FileCard.js`.
3.  **Upload Zone**: Reduce height/padding (`py-8` -> `py-6`).
4.  **Margins/Gaps**: 
    - Reduce `mb-8` in description and reference material to `mb-6` or `mb-4`.
    - Reduce `space-y-6` in submission area.
    - Check grid gap in the student class page.
5.  **Preserve Style**: Colors, animations, and typography font families must remain unchanged.

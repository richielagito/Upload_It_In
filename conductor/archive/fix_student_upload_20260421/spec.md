# Specification: Fix TypeError in Student Upload

## Overview
This track addresses a critical runtime error in the Student Assignment upload process. Students are currently encountering an `Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'files')` when selecting a file for submission on the `ClassDetailsStudent` page.

## Functional Requirements
- **Fix File Access Logic**: Correct the access to the `files` property within the `handleUploadAnswer` and/or `onChange` event handlers in `uploaditin_v2/app/kelas-murid/[kode_kelas]/page.js`.
- **Handle Change Event**: Ensure that the `input type="file"` correctly passes the event or relevant data to the handler.
- **Support Mandatory Formats**: Verify that both `.pdf` and `.docx` files can be selected without triggering this error.

## Non-Functional Requirements
- **Stability**: Prevent the application from crashing during the common user action of file selection.
- **Performance**: Ensure the fix doesn't introduce any noticeable lag in the file selection process.

## Acceptance Criteria
- [ ] Selecting a `.docx` file via the file picker no longer triggers a TypeError.
- [ ] Selecting a `.pdf` file via the file picker no longer triggers a TypeError.
- [ ] The file object is successfully captured and ready for submission to the backend.

## Out of Scope
- Modifications to the backend grading or vectorization logic.
- Styling or layout changes to the dashboard or assignment cards.
- Implementing new file format support beyond what is currently defined (PDF, DOCX, TXT).

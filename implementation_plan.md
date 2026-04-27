# Implementation Plan - Enabling Submission Version History

This plan outlines the technical changes required to support multiple versions of student assignment submissions, preserving historical data while maintaining a clean "active" state for grading.

## User Review Required

> [!IMPORTANT]
> **Data Preservation**: Old versions will no longer be overwritten. They will be kept in the database with `is_active = FALSE`. 
> **Version Constraint**: The database already has a unique constraint on `(user_id, assignment_id, version)`, which we will now utilize to distinguish between attempts.

## Proposed Changes

### 1. Database Schema Migration
We need to remove the constraint that currently forces an "overwrite" behavior.

#### [RUN] SQL Command
- `ALTER TABLE hasil_penilaian DROP CONSTRAINT uq_user_assignment;`
- This allows multiple rows for the same `user_id` and `assignment_id`, as long as their `version` is different.

### 2. Backend Utilities (`uploaditin_backend/utils/db.py`)
Update the persistence logic to support versioning.

#### [MODIFY] [db.py](file:///Users/lembagasidb/richie/Upload_It_In/uploaditin_backend/utils/db.py)
- Update `simpan_ke_postgres` to remove `ON CONFLICT (user_id, assignment_id) DO UPDATE`.
- The function should now focus on `INSERT` operations or updates targeted at specific IDs (for manual reviews).

### 3. Backend API Logic (`uploaditin_backend/app.py`)
Update the submission workflow to handle versioning logic.

#### [MODIFY] [app.py](file:///Users/lembagasidb/richie/Upload_It_In/uploaditin_backend/app.py)
- **Modify `api_upload_student_answer`**:
    - Wrap the following in a database transaction:
        1. Query the current highest version for the student/assignment:
           `SELECT COALESCE(MAX(version), 0) FROM hasil_penilaian WHERE user_id = :uid AND assignment_id = :aid`
        2. Set all existing submissions for this student/assignment to `is_active = FALSE`.
        3. Set the new submission's `version = max_version + 1`.
        4. Set the new submission's `is_active = TRUE`.
        5. Proceed with the save operation.

## Verification Plan

### Automated Verification
- Run a python script to simulate 3 consecutive uploads for a single student.
- Verify that 3 rows exist in `hasil_penilaian` with versions 1, 2, and 3.
- Verify that only version 3 has `is_active = TRUE`.

### Manual Verification
1. As a student, upload an assignment and receive a grade.
2. Use "Undo Turn In" and upload a new version.
3. Verify that the new grade is calculated and displayed.
4. (Optional) Inspect the database to ensure the version 1 data is still intact.

---

> [!TIP]
> This change ensures that if a student accidentally overwrites a good submission with a bad one, the teacher can still access the previous versions if needed.

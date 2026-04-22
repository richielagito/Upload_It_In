# Specification: Manual Review & Override (CoGrader)

## Overview
Implement a "Manual Review & Override" feature that positions the AI as a virtual assistant (CoGrader). The AI generates draft feedback and score suggestions, which teachers can review, modify, and finalize before they are visible to students. This ensures teachers retain full control and builds trust in the grading system.

## Core Capabilities
- **Workflow:** "Draft Mode" - All AI-generated grades are initially saved as drafts and require explicit teacher approval to be published.
- **Overrides:** Teachers can override the Final Score, Overall Feedback, and Sub-criteria Scores.
- **Data Handling:** "Complete Override" - Teacher modifications completely replace the AI's original suggestions in the database.

## Functional Requirements
1. **Draft Status:** Introduce a 'Draft' or 'Pending Review' status for AI-graded submissions.
2. **Review Interface:** Provide a UI for teachers to view the AI's suggested scores (final and sub-criteria) and feedback.
3. **Editing Capabilities:** Allow teachers to edit the numeric scores and text feedback within the review interface.
4. **Publishing:** Implement a mechanism (e.g., a "Publish" or "Approve" button) that transitions the submission from 'Draft' to 'Published', making it visible to the student.
5. **Database Update:** Ensure that saving an override replaces the existing AI values in the database without retaining a separate audit trail of the original AI suggestions.

## Acceptance Criteria
- [ ] AI-graded submissions are clearly marked as requiring review on the teacher dashboard.
- [ ] Teachers can successfully edit final scores, sub-criteria scores, and overall feedback.
- [ ] Saving an edited grade updates the primary grade records in the database.
- [ ] Students cannot see grades while they are in the 'Draft' state.
- [ ] Students can view their grades only after the teacher has approved/published them.

## Out of Scope
- Maintaining a history or comparison view of AI vs. Teacher grades (as 'Complete Override' was selected).
- Real-time collaborative grading between multiple teachers.
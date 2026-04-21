# Specification: Student Dashboard Enhancements

## Overview
This track focuses on improving the UI/UX of the Student Class page in the SCOVA application. The primary goals are to consolidate grading information into assignment cards, implement dynamic action buttons based on submission status, and introduce a detailed Results Feedback Panel for graded assignments.

## Functional Requirements

### 1. Assignment Card Enhancements
- **Grade Summary Integration**: When an assignment is graded, the card must display:
  - **Score**: Numeric value (e.g., `85/100`).
  - **Grade Label**: Visual indicator (e.g., **A**, **B**, **C**) with color coding (Green for A, Yellow for B/C, Red for D/E).
  - **Similarity Index**: AI-detected similarity percentage.
- **Improved Hierarchy**: The grade summary should be prominent and easily readable.

### 2. Dynamic Action Buttons
The primary action button on each assignment card will change its label and behavior based on the current status:
- **Status: Not Submitted**:
  - **Label**: `Submit Answer`
  - **Appearance**: Primary (Blue)
  - **Action**: Opens the file upload interface.
- **Status: Pending Review**:
  - **Label**: `Pending Review`
  - **Appearance**: Disabled / Gray
  - **Action**: None.
- **Status: Graded**:
  - **Label**: `View Detail`
  - **Appearance**: Outline / Secondary
  - **Action**: Opens the Results Feedback Panel.

### 3. Results Feedback Panel
A new component to display detailed feedback for a specific graded assignment.
- **Layout**: A large panel (non-animated) that covers the current view or is displayed as a large modal.
- **Content**:
  - **Feedback Message**: Full text comment from the teacher.
  - **Criteria Breakdown**: Sub-criteria scores (to be implemented even if database support is currently limited).
  - **Submission History**: Link/Button to view the file that was submitted.
  - **Re-upload Button**: Available if the assignment deadline has not passed.

### 4. UI Clean-up
- **Remove "My Grades" Section**: Delete the redundant table block at the bottom of the Student Class page.

## Non-Functional Requirements
- **Responsive Design**: Ensure the new cards and feedback panel work well on various screen sizes.
- **Consistency**: Maintain alignment with the existing Tailwind CSS and Next.js design patterns.

## Acceptance Criteria
- Students see their grades and similarity index directly on assignment cards.
- The action button correctly reflects the submission status (Submit, Pending, View Detail).
- Clicking "View Detail" opens a panel with full teacher feedback and sub-scores.
- The "Re-upload" button is visible and functional only if the deadline is still open.
- The old "My Grades" table is no longer present on the page.

## Out of Scope
- Backend changes to support sub-criteria (will be mocked or implemented as a separate track if needed, but UI support will be built).

# Specification: Fix Layout of Student Assignment Detail

## 1. Overview
The current layout for the student assignment detail view (`FeedbackPanel.js`) appears untidy on desktop screens. This track focuses on making basic visual and structural improvements to the layout without completely overhauling the design system.

## 2. Functional Requirements

### 2.1 Grade Overview Alignment
- Adjust the grid and flexbox settings for the Final Score, Similarity, and Grade summary cards to ensure they align uniformly with the rest of the content on desktop.

### 2.2 Feedback Section Tidying
- Standardize the spacing and padding between the "Teacher's Feedback" box and the "Criteria Breakdown" list.
- Ensure the heights and alignments of the two columns (on desktop) look balanced.

### 2.3 Submission Area Refinement
- Improve the layout of the "Your Work" section. Ensure the spacing around the submitted file cards, staged file cards, and the upload placeholder is consistent and visually clear.

### 2.4 Footer Actions Consistency
- Adjust the alignment and sizing of the action buttons (Back to List, Upload New, Turn In) in the footer to ensure they span the container cleanly and have equal emphasis where appropriate.

## 3. Technical Requirements
- Refactor the Tailwind CSS utility classes in `FeedbackPanel.js` and any related parent containers in `page.js` to address the specific alignment and spacing issues.
- Maintain existing functionality (staging, turning in, viewing files).

## 4. Acceptance Criteria
- [ ] On desktop, the Grade Overview aligns neatly with the Assignment Details section.
- [ ] The Teacher's Feedback and Criteria Breakdown columns have balanced proportions and spacing.
- [ ] The Submission Area clearly distinguishes between submitted, staged, and missing work without looking cluttered.
- [ ] Footer action buttons are evenly aligned and spaced.

## 5. Out of Scope
- A complete redesign using the 'Intelligent Canvas' system or new color palettes.
- Changes to backend logic or the grading algorithm.
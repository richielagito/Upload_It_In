# Implementation Plan: Essay Text Highlighting

## Phase 1: Backend Core & Prompt Engineering
- [ ] Task: Update LLM Prompt for Highlights
    - [ ] Modify the prompt in `uploaditin_backend/utils/feedback_generator.py` to instruct Gemini to return a combined JSON containing the general feedback, aspects, score, and the new `highlights` array.
    - [ ] Parse the new `highlights` field from the LLM's response.
- [ ] Task: Implement Span Matching Logic (TDD)
    - [ ] Write unit tests for the span matching (regex search) and overlap removal functions.
    - [ ] Implement the `extract_highlights(essay_text, raw_highlights)` function to map exact text quotes to `start` and `end` indices.
    - [ ] Implement logic to safely ignore LLM hallucinated quotes (where the quote is not found in the source text).
- [ ] Task: Integrate "Missing" Category
    - [ ] Extract items categorized as "missing" (or with null quotes) and append their `reason` directly to the general feedback string so they are not lost.
- [ ] Task: Update API Endpoint & Database Persistence
    - [ ] Ensure the generated `highlights` array is included in the dictionary returned by the feedback generator.
    - [ ] Update the Supabase database insertion logic to persist the `highlights` array (e.g., saving it as JSONB along with the rest of the feedback data).
    - [ ] Verify the API endpoint correctly sends the `highlights` data to the frontend.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Backend Core & Prompt Engineering' (Protocol in workflow.md)

## Phase 2: Frontend Rendering & Styling
- [ ] Task: Setup CSS for Highlights
    - [ ] Add necessary Custom CSS rules (e.g., `.hl`, `.hl-strong`, `.hl-weak`) to `globals.css` or configure Tailwind classes for the highlight backgrounds.
- [ ] Task: Implement Highlight Rendering Function
    - [ ] Create a utility function `renderHighlightedEssay(essayText, highlights)` that splits the original essay text based on `start` and `end` indices.
    - [ ] Wrap the highlighted spans in `<mark>` tags, injecting the appropriate CSS classes and a data attribute for the tooltip (`data-reason`).
- [ ] Task: Integrate Tooltip & Update UI Component
    - [ ] Update the essay detail page component (e.g., in Next.js) to consume the `highlights` array.
    - [ ] Render the raw essay text using the `renderHighlightedEssay` function.
    - [ ] Implement the hover tooltip interaction (using native `title` or a custom component/event listeners) to show the reason when hovering over a highlight.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Frontend Rendering & Styling' (Protocol in workflow.md)

## Phase 3: E2E Testing & Finalization
- [ ] Task: End-to-End Testing
    - [ ] Perform manual testing of the complete flow: generate feedback, verify the backend correctly extracts spans, and verify the frontend renders highlights and tooltips accurately.
    - [ ] Test edge cases: overlapping quotes, missing quotes, and special characters in quotes.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: E2E Testing & Finalization' (Protocol in workflow.md)
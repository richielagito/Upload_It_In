# Project Workflow

## Development Process
We follow a structured development process based on the Conductor methodology.

### 1. Planning
- Each high-level goal is organized into a **Track**.
- Each track has a **Specification** (`spec.md`) and a phased **Implementation Plan** (`plan.md`).

### 2. Implementation
- Work is performed in small, incremental **Tasks** as defined in the implementation plan.
- We follow **Test-Driven Development (TDD)** principles where applicable:
  - Write a failing test first.
  - Implement the minimum code to pass the test.
  - Refactor.

### 3. Testing and Quality
- **Test Coverage:** All new code must be covered by tests. We maintain a minimum of **80% code coverage**.
- **Linting:** Code must pass all linting checks as defined in the style guides.

### 4. Version Control
- **Commits:** We commit changes after **each task** is completed.
- **Commit Messages:** Use clear, descriptive commit messages. Include a summary of the task performed.

## Phase Completion Protocol
At the end of each Phase in the implementation plan, the following protocol must be followed:
1.  **Verification:** Verify that all tasks in the phase are completed and all tests pass.
2.  **Checkpointing:** Use the `Conductor - User Manual Verification` task to ensure the user is satisfied with the progress.

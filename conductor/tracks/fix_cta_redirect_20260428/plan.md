# Implementation Plan: Fix Landing Page CTA Redirect Logic

## Phase 1: Context & Utility Preparation
- [ ] Task: Ensure Supabase client is accessible and decide on state strategy.
    - [ ] Review how `Navbar.js` manages its session state.
    - [ ] Plan whether to duplicate session fetching logic across the 3 components or refactor to a shared hook/context.

- [ ] Task: Conductor - User Manual Verification 'Phase 1: Context & Utility Preparation' (Protocol in workflow.md)

## Phase 2: Update Landing Page Components
- [ ] Task: Update `Hero.js` conditional routing.
    - [ ] Implement session fetching logic.
    - [ ] Update the "Get Started" `<Link>` to point to `/dashboard` if authenticated, else `/login-register`.
- [ ] Task: Update `CTA.js` conditional routing.
    - [ ] Implement session fetching logic.
    - [ ] Update the "Get Started" `<Link>` to point to `/dashboard` if authenticated, else `/login-register`.
- [ ] Task: Update `Footer.js` conditional routing.
    - [ ] Implement session fetching logic.
    - [ ] Update the "Get Started" `<Link>` to point to `/dashboard` if authenticated, else `/login-register`.

- [ ] Task: Conductor - User Manual Verification 'Phase 2: Update Landing Page Components' (Protocol in workflow.md)
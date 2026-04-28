# Specification: Fix Landing Page CTA Redirect Logic

## Overview
Currently, the "Get Started" buttons on the landing page direct users to the `/login-register` page unconditionally. If a user is already authenticated, clicking these buttons should redirect them to their dashboard instead of asking them to log in again.

## Functional Requirements
- Check authentication state (Supabase session) on the client side for the landing page.
- If a user is logged in, any "Get Started" button (in the Hero, CTA, and Footer sections) must link to `/dashboard`.
- If a user is NOT logged in, the buttons should continue to link to `/login-register`.
- The buttons should retain their current visual styling and hover effects.

## Scope
- `uploaditin_v2/app/components/CTA.js`
- `uploaditin_v2/app/components/Hero.js`
- `uploaditin_v2/app/components/Footer.js`

## Out of Scope
- Modifying the login/register flow itself.
- Modifying the Navbar component (which appears to already handle this state correctly).
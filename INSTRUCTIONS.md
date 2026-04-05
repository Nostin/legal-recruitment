Application Description:
OpenCourt is a marketplace-style hiring platform where lawyers create anonymous profiles and law firms browse and filter those profiles, then request introductions.

Primary Goal for this task:
Turn the existing UI prototype in ./frontend into a real local full-stack implementation for the candidate flow only, while laying the database groundwork for law firm accounts.

Stack:
- Frontend remains Next.js
- Backend is Python FastAPI
- Database is PostgreSQL
- Local dev first
- Authentication uses Clerk magic-link auth
- Keep the code structured so the database connection can be swapped to Neon later

Local Database:
- A local empty PostgreSQL database already exists at:
  postgresql://seanthompson@localhost:5432/legal

High-Level Scope:
Implement the candidate flow end-to-end.
Model firm-related entities in the database, but do not fully implement firm-facing CRUD or full law firm workflow yet unless required for the existing UI to run.

Backend Requirements:
- Create a FastAPI service in ./backend
- Use Python 3.x
- Create a local virtual environment at ./backend/.venv
- Create a requirements.txt with only the minimum required packages
- Create a .env.example with required backend environment variables
- Add a README with exact local setup and run commands
- Do not use Docker
- Keep everything runnable locally on macOS

Database Requirements:
- Create a sensible relational schema with foreign keys
- Create a users table with an account_type column with values:
  - candidate
  - firm
- Create tables needed to support:
  - candidate profiles
  - firm profiles
- Candidate profile columns should support the fields captured in ./frontend/profile-builder
- Firm-related profile columns should support the fields captured in ./frontend/firm-onboarding
- Add migrations
- Add seed data
- Use ./frontend/data/candidates.ts as a reference for sample candidate records where useful

Frontend Requirements:
- Keep the existing UI structure and styling as intact as possible
- Do not redesign the UI
- You may extract only obvious shared layout components such as header, footer, or shared shell components
- Create a simple frontend API layer for calling the backend
- Remove fake/mock data only for candidate-related screens in this pass
- Add sensible form validation and user-facing validation/error messages
- Reuse existing design patterns where possible for notifications and errors

Authentication Requirements:
Set up Clerk magic-link authentication in ./frontend.

Assume these environment variables already exist locally in the frontend:
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY

Requirements:
- Implement sign-in using email magic links
- Keep public marketing pages public
- Protect app pages that require a signed-in user
- Add basic signed-in and signed-out navigation states
- Do not implement backend auth verification yet
- Do not redesign auth UI more than necessary
- Add README notes for local setup and required Clerk dashboard configuration

API Scope for this pass:
Implement candidate-related backend endpoints and connect the corresponding frontend flows:
- GET /candidates
- GET /candidates/{id}
- POST /candidates
- PUT /candidates/{id}

Candidate Flow Scope:
- Candidate list loads from database
- Candidate detail loads from database
- Candidate create flow persists to database
- Candidate edit flow persists to database

Firm Scope for this pass:
- Model firm-related database entities only
- Do not fully implement firm-side CRUD or advanced firm workflows yet unless necessary to make the current prototype run

Constraints:
- Keep code simple
- Prefer explicit code over abstraction
- Keep backend RESTful
- Add basic validation
- Add clear environment setup
- Add README instructions for local run
- Fix, test, and iterate as you go
- Do not make speculative abstractions
- Do not rewrite working frontend code unnecessarily

Verification:
- frontend installs and runs locally
- backend installs and runs locally
- migrations apply successfully
- seed script works
- candidate list loads from database
- candidate detail loads from database
- candidate create works
- candidate edit works
- frontend lint passes
- frontend typecheck/build passes where configured
- backend starts cleanly
- Clerk magic-link sign-in works
- protected app pages require auth
- public pages remain public
# OpenCourt Architecture and Implementation Rules

## Product Summary
OpenCourt is a hiring platform for the legal industry.

Lawyers create anonymous candidate profiles.
Law firms browse, search, sort, and filter candidate profiles.
Law firms can later request introductions to suitable candidates.

The platform has two account types:

- candidate
- firm

This document defines the fixed architecture, constraints, repository structure, and general implementation rules for all phases.

All phase-specific work is defined in separate `PHASE_*.md` files.

---

## Repository Structure

- `./frontend` → existing Next.js frontend
- `./backend` → FastAPI backend to be created and expanded over phases

---

## Fixed Stack Decisions

These are fixed and must not be changed:

- Frontend remains **Next.js**
- Frontend routing remains **App Router**
- Backend is **Python FastAPI**
- Database is **PostgreSQL**
- Local development first
- Authentication uses **Clerk magic-link auth**
- Backend must be structured so the database connection can later be swapped to Neon with minimal change
- Do **not** use Docker

---

## Local Database

A local PostgreSQL database already exists and is empty at:

```
postgresql://seanthompson@localhost:5432/legal
```

Use environment variables for database configuration.
Do not hardcode credentials into application code.

## Primary Product Concepts
### Candidate

A lawyer who creates an anonymous profile describing their background, practice area, experience, preferences, and job-interest details.

### Firm

A law firm account that can maintain a firm profile and later browse candidate profiles.

### User

A local application user record linked to a Clerk user identity.

The local user record must include:

- a unique local ID
- Clerk user ID
- email
- account type (candidate or firm)

### High-Level Domain Model

The system should support at least the following concepts:

- users
- candidate_profiles
- firm_profiles

Later phases may introduce:

- introduction_requests
- account onboarding state
- notifications / email events

Do not add speculative entities unless needed for the scoped phase.

### Data Modelling Principles

- Use foreign keys where appropriate
- Keep the schema normalized where reasonable
- Prefer explicit columns over premature abstraction
- Do not overengineer for hypothetical future features
- Keep naming conventional and clear
- Prefer schema clarity over cleverness

### Backend Design Principles

The backend should use a simple, conventional FastAPI structure.

It should contain at minimum:

- app entrypoint
- database configuration
- models
- schemas
- routes
- migration setup
- seed script

Guidelines:

- keep the backend RESTful
- prefer explicit code over abstraction
- do not introduce unnecessary service layers unless clearly justified
- validation should be clear and minimal
- use only the minimum required packages

### Frontend Design Principles

- Keep the existing UI structure and styling as intact as possible
- Do not redesign the UI
- Do not reintroduce Vite-specific or react-router-dom patterns
- Do not rewrite large areas of working code unnecessarily
- Extract only obvious shared layout components when duplication is clear and reused in 2 or more places
- Save shared components in ./frontend/app/components

### Authentication Principles

Authentication uses Clerk magic-link auth in the frontend.

Assume these environment variables already exist locally in the frontend:

- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY

Rules:

- keep marketing/public pages public
- protect authenticated app pages as required by the phase
- do not implement backend verification of Clerk tokens until explicitly requested in a later phase
- do not redesign auth UI more than necessary

The backend should not depend on Clerk token verification in early phases.

### Account Type Rules

All users authenticate through the same Clerk mechanism.

Account type is an application-level concept and must be stored in the local database.

Allowed account types:

- candidate
- firm

The local app database is the source of truth for account type.

### Environment Setup Rules

- Use .env.example files where appropriate
- Add clear README instructions for local run/setup
- Keep setup runnable locally on macOS
- Do not require Docker

### Change Management Rules

These rules apply to all phases:

Do not begin large refactors
Only change what is required to satisfy the current phase instructions
Do not touch unrelated files unless required to complete the scoped work
Do not introduce speculative abstractions
Prefer explicit code over abstraction
Keep changes minimal, reviewable, and easy to reason about
Fix, test, and iterate as you go

### Dependency Rules

- Use the minimum required dependencies
- Do not add unnecessary packages
- If a new dependency is required, prefer the simplest well-supported option
- Avoid package sprawl

### Verification Philosophy

Every phase must:

- implement only the scoped work
- verify the relevant functionality
- fix errors encountered during implementation
- report exactly what was completed
- report exact verification commands and results

Each phase document will define its own required verification checklist.

### Completion Reporting Rules

At the end of each phase, report:

- completed checklist items
- incomplete items or blockers
- exact verification commands run
- result of each verification step
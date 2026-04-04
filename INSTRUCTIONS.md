Application Description:
OpenCourt is a jobs board where lawyers can post an anonymous profile for law firms to review when looking to hire staff.  Law firms can search, sort, filter the lawyer profiles and request introductions to the profiles that fit their needs.

Goal:
Turn the existing UI prototype in ./frontent for the candidate and law firm flows into a real local full-stack implementation.

Stack:
- Frontend remains Next.js
- Backend is Python FastAPI
- Database is PostgreSQL
- Use Neon-compatible connection config
- Local dev first
- Auth implemented using Clerk

Database Layer:
- An empty database is set up locally at postgresql://seanthompson@localhost:5432/legal
- Please create entities to accomodate the user accounts with a column to denote whether they are a "candidate" or a "firm"
- Candidates should have columns to accomodate all the data entered in the flow in ./frontend/profile-builder
- Firms also need to have data saved in columns that relate to the data captured in ./frontend/firm-onboarding
- Please create a sensibly structured database with foreign key relationships to accomodate the data shown in the prototype.
- Please seed the database with some test data.  Some candidate data examples are available at ./frontend/data/candidates.ts

Front-End Layer:
- Please create sensible component abstractions (such as header and footer components) and save them in the ./frontend/app/components folder
- Please create a sensible api layer which the UI routes consume to display/filter data and which the forms post to.
- Please add linting and make sure type checks and lint passes.
- Please add sensible form validation for the forms and sensible error messages for the user.
- You can add notification and error design choices as necessary where none exist to reuse

Back-End Layer:
- Please create a simple FastAPI service built in Python
- Set up the backend in ./backend using Python 3.x and a local virtual environment at ./backend/.venv
- Create a requirements.txt with only the minimum required packages
- Install the dependencies into the venv
- Create a FastAPI app with local Postgres configuration via .env
- Add a README with exact setup and run commands.
- Do not touch ./frontend.
- Do not use Docker.
- Keep everything runnable locally on macOS

Authentication:
Set up Clerk magic-link authentication in ./frontend.

Assume these env vars already exist locally:
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY

Requirements:
- add sign-in flow using email magic links
- protect app pages behind auth
- keep marketing/public pages public
- add basic signed-in/signed-out navigation states
- do not implement backend auth verification yet
- do not redesign the UI more than necessary
- add README notes for local setup and required Clerk dashboard configuration

Scope:
- Create candidate schema/table
- Add migrations
- Add seed data
- Build candidate CRUD endpoints
- Connect the frontend candidate list and candidate detail/create screens to the API
- Remove fake/mock data only for candidate-related screens

Constraints:
- Keep code simple
- Prefer explicit code over abstraction
- Do not redesign UI
- Keep backend RESTful
- Add basic validation
- Add clear env setup
- Add README instructions for local run
- Please fix, test and iterate as you go

Verification:
- frontend installs and runs
- backend installs and runs
- migration applies successfully
- seed script works
- candidate list loads from database
- create/edit candidate works
- lint/typecheck/build pass where configured
- Auth works
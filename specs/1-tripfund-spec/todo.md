# TripFund Implementation Tasklist

This file breaks the `spec.md` into actionable implementation phases with concrete tasks, files to add or edit, acceptance criteria, and rough estimates.

## Phase 0 — Research & Setup (env, DB, templates)
- Goal: Prepare development environment, DB connection, project conventions, and templates.
- Tasks:
  - Initialize environment variables and add `.env.example` (DB URL, SESSION_SECRET, NODE_ENV).
  - Add PostgreSQL connection helper in `src/lib/db.js` (use parameterized queries).
  - Confirm `package.json` scripts: `dev`, `start`, `migrate`, `seed`.
  - Add database migration plan files under `db/migrations/` (SQL or use node-pg-migrate).
  - Create EJS base layout at `views/layouts/main.ejs` and partials `views/partials/header.ejs`, `views/partials/footer.ejs`.
  - Configure `express-session` in `server.js` with secure defaults (httpOnly, secure when NODE_ENV=production).
- Acceptance:
  - App boots without crashing and serves a basic home page.
  - DB connection succeeds with environment variables.
-- Estimate: 1 day

**Status: COMPLETED**

## Phase 1 — Auth, sessions, and `users` model
- Goal: Secure session-based authentication with `bcrypt` and `express-session`.
- Tasks:
  - Create `src/models/users.js` with functions: `createUser`, `findByEmail`, `findById`.
  - Add migration for `users` table (see `spec.md` fields).
  - Implement `src/controllers/auth.js` routes: `GET /register`, `POST /register`, `GET /login`, `POST /login`, `POST /logout`.
  - Add `src/middleware/auth.js` with `requireAuth`, `requireRole`, and `attachUserToLocals`.
  - Add password hashing using `bcrypt` and server-side validation for email/password.
  - Expose `res.locals.currentUser` to views.
- Files to edit/create: `src/models/users.js`, `src/controllers/auth.js`, `src/middleware/auth.js`, migrations in `db/migrations/`, `views/auth/*.ejs`.
- Acceptance:
  - Register stores a hashed password; duplicate emails rejected.
  - Login sets a session cookie; protected route redirects if unauthenticated.
-- Estimate: 1–2 days

**Status: COMPLETED**

## Phase 2 — Trips model, controllers, and routes
- Goal: Implement trip CRUD and visibility rules.
- Tasks:
  - Create `src/models/trips.js` (CRUD functions using parameterized queries).
  - Migration for `trips` table with required fields and FK to `users`.
  - Implement `src/controllers/trips/index.js` and route wiring in `src/routes/trips.js`.
  - Add `loadTrip` middleware to fetch trip and check ownership; attach to `req.trip`.
  - Views: `views/trips/new.ejs`, `views/trips/edit.ejs`, `views/trips/index.ejs`, `views/trips/details.ejs`.
  - Enforce visibility: private trips only visible to owner/admin.
- Acceptance:
  - Owner can create, edit, delete trip; non-owner receives 403 on edits.
  - Trip detail shows status, funding progress, and visibility.
-- Estimate: 2–3 days

**Status: COMPLETED**

## Phase 3 — Itinerary, budget categories, and trip budgets
- Goal: Allow owners to add itinerary items and planned budgets by category.
- Tasks:
  - Migrations for `itinerary_items`, `budget_categories`, `trip_budget_items`.
  - Models: `src/models/itinerary.js`, `src/models/budgetCategories.js`, `src/models/tripBudgets.js`.
  - Controllers and routes to add/edit/delete itinerary items and budget items.
  - Admin UI to manage `budget_categories` (protected by `requireRole('admin')`).
  - Views under `views/trips/itinerary.ejs` and `views/trips/budget.ejs`.
- Acceptance:
  - Itinerary items saved and listed per trip.
  - Budget categories manageable by admin; trip budgets show planned totals.
-- Estimate: 2 days

**Status: COMPLETED**

## Phase 4 — Expenses and contributions (self_save + donations)
- Goal: Track actual expenses and contributions; enforce donation rules.
- Tasks:
  - Migrations for `expenses` and `contributions` tables.
  - Models: `src/models/expenses.js`, `src/models/contributions.js`.
  - Controllers/routes for posting expenses and contributions (donations only when `allow_donations=true`).
  - Update trip view to show planned vs actual comparison and funding percent.
  - Validation: amounts > 0, valid categories, positive numbers.
- Acceptance:
  - Expenses and contributions correctly aggregate and display on trip page.
  - Donation attempts blocked for `allow_donations=false`.
-- Estimate: 2 days

**Status: COMPLETED**

## Phase 5 — Trip lifecycle, status history, and recaps
- Goal: Implement status transitions, history tracking, and recaps posting.
- Tasks:
  - Migration for `trip_status_history` and `recaps` (+ `recap_photos`).
  - Model functions to change status and record history in a DB transaction.
  - Prevent multiple recaps per trip (unique constraint on `recaps.trip_id`).
  - Controllers for creating recaps (allowed only when trip `completed`).
  - Views: `views/trips/recap_new.ejs`, `views/recaps/show.ejs`.
- Acceptance:
  - Status changes append to `trip_status_history` with `changed_by_user_id`.
  - Only one recap per trip allowed; recap visible under explore pages.
- Estimate: 2 days

**Status: COMPLETED**

## Phase 6 — Comments, reports, moderation flows
- Goal: Add comments, reporting, and moderator actions.
- Tasks:
  - Migrations for `comments` and `reports`.
  - Migrations for `comments` and `reports`.  
  - Models/controllers for creating/editing/deleting comments and creating reports.  
  - Comments UI on trip details (list & create).  
  - Report creation endpoint (create reports for trips/comments).  
  - Moderator endpoints: list reports, resolve report, delete content. Protect with `requireRole('moderator')`/`requireRole('admin')`.
  - Views: moderation queue `views/moderation/index.ejs` and admin report pages.
- Acceptance:
  - Reports create entries and moderators can resolve or delete flagged content.
- Estimate: 2–3 days

**Status: COMPLETED**

Phase 6 status: COMPLETED

## Phase 7 — Admin dashboard and category management
- Goal: Provide admin tools to manage users, roles, categories, and view metrics.
- Tasks:
  - Admin controllers/routes: user listing, change role, category CRUD, reports view.
  - Add operational metrics queries (total users, trips, public trips, recaps, contributions, reports).
  - Views: `views/admin/dashboard.ejs`, `views/admin/users.ejs`, `views/admin/categories.ejs`.
- Acceptance:
  - Admin can change roles and manage categories; metrics display correctly.
- Estimate: 2 days
**Status: COMPLETED**

## Phase 8 — Views, EJS templates, and client forms
- Goal: Implement server-rendered pages, partials, and client-side validation enhancements.
- Tasks:
  - Build common partials and refine forms (error display, field preservation on validation errors).
  - Add explore pages: `views/explore/trips.ejs`, `views/explore/recaps.ejs`.
  - Responsive layout tweaks and CSS assets under `public/css`.
- Acceptance:
  - All pages render correctly with `res.locals.currentUser` and show proper nav options by role.
- Estimate: 2–4 days

**Status: COMPLETED**

## Phase 9 — Testing, validation, security review, deployment
- Goal: Add tests, finalize validation and security hardening, and deploy to Render.
- Tasks:
  - Add server-side tests for models and controllers (use `jest` or `mocha` + `supertest`).
  - Add validation unit tests and route tests for auth and trip ownership enforcement.
  - Security review: ensure parameterized queries, secure cookie flags, input sanitization.
  - Add migration and seed scripts; document `README.md` with test accounts (password P@$$w0rd!).
  - Prepare Render deployment recipe and add necessary environment settings.
- Acceptance:
  - Tests pass locally; a deployment build succeeds on Render using provided `start` script.
- Estimate: 2–4 days

**Status: IN PROGRESS**

Notes:
- Jest unit test scaffolding added and a basic utility test created for `formatDate`.

## Finalize spec validation and sign-off
- Goal: Confirm spec checklist items are complete and sign off.
- Tasks:
  - Run through `specs/1-tripfund-spec/checklists/requirements.md` and mark items done.
  - Generate `quickstart.md` and `data-model.md` artifacts as needed.
- Acceptance:
  - Checklist shows no outstanding `NEEDS CLARIFICATION` items and all testable acceptance criteria are covered.

---
Generated: 2026-03-26

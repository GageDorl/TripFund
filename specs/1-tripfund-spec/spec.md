# TripFund — Feature Specification

## Short Summary
TripFund is a server-rendered web application for planning trips, tracking budgets and expenses, recording personal savings and simulated donations, and publishing post-trip recaps. This specification covers the complete product feature set required for the class-project MVP and useful stretch goals.

## Actors
- Standard User: register, create/manage trips, contribute savings, post recaps, comment
- Mentor/Moderator: review flagged content, moderate comments/recaps, feature recaps
- Admin: manage users, roles, budget categories, reports, and site data
- Anonymous Visitor: browse public trips and recaps

## Goals
- Enable users to create multi-stage trips with budgets, expenses and contributions
- Provide social discovery for public trips and recaps
- Provide admin and moderator workflows for moderation and platform management

## User Scenarios & Testing

Scenario 1 — Create and fund a trip
- Actor: Standard User
- Flow: User registers → creates new trip (title, destination, dates, funding goal, allow_donations flag) → adds budget items by category → logs personal savings contributions → views funding progress on trip page
- Testable outcome: Trip shows planned totals, contributions sum, percent funded, status set to `draft` then `fundraising` when owner changes it.

Scenario 2 — Log expenses and reconcile
- Actor: Standard User
- Flow: Owner marks trip `booked`/`in_progress` → logs expenses tied to budget categories → views planned vs actual comparison
- Testable outcome: Sum of expenses grouped by category is visible and compared to planned amounts.

Scenario 3 — Post a recap
- Actor: Standard User
- Flow: After trip status `completed`, owner creates a recap with body, total_cost, images (URLs) → recap becomes discoverable if marked public
- Testable outcome: Recap record created, associated photos saved, visible under recaps explore page.

Scenario 4 — Moderation and reporting
- Actor: Any logged-in user (reporter), Mentor/Admin (resolver)
- Flow: User flags a comment/recap → report stored with reason → moderator resolves by closing or escalating → moderator can delete offending content
- Testable outcome: Report appears in moderation queue with status; resolved_by and resolved_at fields populated when closed.

Scenario 5 — Admin management
- Actor: Admin
- Flow: Admin views user list, changes a user's role, creates/edits budget categories
- Testable outcome: Role change persists and affects access; new category appears when creating trip budget items.

If any of the above flows cannot be derived from UI actions, consider it an error: ensure all pages and forms listed in requirements exist and are reachable.

## Functional Requirements (Testable)
1. Authentication
   - POST /register creates a user with unique email and hashed password. Test: duplicate email returns validation error.
   - POST /login establishes a session cookie; protected routes redirect to login when unauthenticated.

2. Authorization
   - `requireAuth` middleware prevents unauthenticated access to user pages.
   - `requireRole(role)` middleware enforces admin/mentor-only endpoints. Test: non-admin gets 403 on admin endpoints.

3. Trips CRUD
   - Users can create/read/update/delete their trips. Only owner or admin may edit/delete. Test: other user cannot edit trip (403).
   - Trip fields validated: title non-empty, start_date <= end_date, funding_goal non-negative.

4. Itinerary
   - Owner can add itinerary items with day_number, title, optional time and estimated_cost >= 0.

5. Budget Planning
   - Admin-managed `budget_categories` exist. Users add `trip_budget_items` mapping categories to planned_amount >= 0.

6. Expenses
   - Users (usually owner) log expenses with amount > 0 and valid category. Test: negative amounts rejected.

7. Contributions
   - Two types: `self_save` and `donation`. Donations allowed only if `allow_donations` true for trip.
   - Contribution amount > 0. Test: donation attempt on closed/no-donations trip rejected.

8. Status workflow
   - Trip status stored and changes logged to `trip_status_history` with changed_by_user_id. Test: history rows created on status change.

9. Recaps
   - One-to-one recap per trip; creation permitted only if trip status `completed`. Test: second recap creation rejected.

10. Comments & Reports
   - Comments can be linked to either `trip_id` or `recap_id` (but not both). Test: DB constraint prevents both-non-null or both-null as appropriate.
   - Reports store entity_type, entity_id, reason, reporter.

11. Admin & Moderator controls
   - Admin endpoints for user role changes, category management, deleting content.
   - Moderator endpoints for resolving reports and featuring recaps.

## Success Criteria (Measurable)
- Users can register and log in; 100% of registration attempts with valid data succeed.
- 95% of typical trip create operations complete within 2s on a developer machine.
- At least one recap can be posted and discovered via explore within 3 clicks.
- Authorization enforcement: attempts to access protected endpoints by unauthorized users return 401/403 reliably.

## Key Entities & Schema Summary
- users(id, first_name, last_name, email unique, password_hash, role, created_at)
- trips(id, owner_user_id FK users, title, destination, start_date, end_date, description, visibility, status, funding_goal numeric, allow_donations boolean, created_at, updated_at)
- trip_status_history(id, trip_id FK trips, old_status, new_status, changed_by_user_id FK users, changed_at)
- itinerary_items(id, trip_id FK trips, day_number, title, location, notes, estimated_cost, activity_time)
- budget_categories(id, name, slug, description)
- trip_budget_items(id, trip_id FK trips, category_id FK budget_categories, planned_amount)
- expenses(id, trip_id, category_id, created_by_user_id, amount, description, expense_date, created_at)
- contributions(id, trip_id, contributor_user_id, amount, type enum(self_save, donation), message, created_at)
- recaps(id, trip_id unique FK trips, title, body, total_cost, lessons_learned, recommendation, featured boolean, posted_at)
- recap_photos(id, recap_id FK recaps, image_url, caption, sort_order)
- comments(id, user_id, recap_id nullable, trip_id nullable, body, created_at, updated_at, deleted_at nullable)
- reports(id, reported_by_user_id, entity_type, entity_id, reason, status, created_at, resolved_by_user_id nullable, resolved_at nullable)

Refer to `models/` for table-level constraints and referential on-delete choices: generally ON DELETE CASCADE for dependent records (itinerary_items, trip_budget_items, expenses, contributions, recaps, recap_photos, comments) and SET NULL for optional links where losing the parent shouldn't delete the actor (e.g., reports.resolved_by_user_id).

## Validation & Security Requirements
- Use parameterized queries for all DB access.
- Hash passwords with `bcrypt` (configurable salt rounds). Passwords never stored in plaintext.
- Session cookies: `httpOnly` always; `secure` in production; sameSite Lax.
- Server-side validation for all forms: required fields, numeric ranges, date ordering.
- Sanitize user-provided text before rendering to prevent XSS (escape in EJS; sanitize where needed).

## Middleware Plan
- `requireAuth(req,res,next)` exposes `res.locals.currentUser` and redirects unauthenticated to `/login`.
- `requireRole(role)` checks `res.locals.currentUser.role` and returns 403 if insufficient.
- `loadTrip` middleware fetches trip + authorizations and attaches `req.trip`.
- `validateBody(schema)` for common form validation using a small validation helper.

## Routes Map (High Level)
Public:
- GET / — home
- GET /explore/trips — public trips listing
- GET /explore/recaps — public recaps listing
- GET /trips/:id — trip detail
- GET /recaps/:id — recap detail

Auth:
- GET /register, POST /register
- GET /login, POST /login
- POST /logout

User:
- GET /dashboard
- GET /trips/new, POST /trips
- GET /trips/:id/edit, POST /trips/:id
- POST /trips/:id/delete
- GET /trips/:id/itinerary, POST /trips/:id/itinerary
- GET /trips/:id/budget, POST /trips/:id/budget
- GET /trips/:id/expenses, POST /trips/:id/expenses
- GET /trips/:id/contributions, POST /trips/:id/contributions
- GET /trips/:id/recap/new, POST /trips/:id/recap
- GET /comments/:id/edit, POST /comments/:id/update, POST /comments/:id/delete

Moderator / Admin (protected):
- GET /moderation, POST /moderation/reports/:id/resolve, POST /moderation/comments/:id/delete, POST /moderation/recaps/:id/feature
- GET /admin, GET /admin/users, POST /admin/users/:id/role, GET /admin/categories, POST /admin/categories, POST /admin/categories/:id/update, POST /admin/categories/:id/delete, GET /admin/reports, POST /admin/reports/:id/resolve

## MVC & File Structure (Suggested)
- `src/controllers/` — route handlers (grouped by domain: trips, recaps, auth, admin, moderation)
- `src/models/` — DB queries and schema helpers
- `src/routes/` — Express route wiring
- `src/middleware/` — auth, roles, validation, locals
- `src/utils/` — helpers (formatDate, money formatting, percent calculation)
- `views/` — EJS templates (layouts, partials, trips/, recaps/, admin/, moderation/)

## Implementation Phases / Roadmap
Phase 1 (MVP) — Core backend & authentication (2–4 days)
- User auth, basic trip CRUD, itinerary, budgets, expense logging, contributions (self_save), session management, EJS layouts.

Phase 2 — Trip lifecycle, recaps, explore pages (2–4 days)
- Status history, recap creation/display, contribution donations simulation, comments.

Phase 3 — Admin/Moderator tooling, reporting, validation hardening (2–3 days)
- Admin dashboards, role changes, category management, report resolution, moderator flows.

Phase 4 (Stretch) — Enhanced UX and metrics (2–4 days)
- Likes, featured recaps UI, operational metrics, more robust tests and seed data.

## Risk Areas & Mitigations
- Data integrity: ensure proper FK constraints and transactional updates for multi-step operations (e.g., applying contributions and updating funding progress) — mitigate with DB transactions.
- Authorization leaks: ensure every controller action validates ownership — mitigate with `loadTrip` and role middleware.
- Duplicate recap: prevent via unique constraint on `recaps.trip_id`.

## MVP Scope vs Stretch Goals
- MVP: authentication, trip CRUD, budgets, expenses, self contributions, single recap per trip, admin category management, essential moderation.
- Stretch: real payments, file uploads, social features (likes), advanced analytics, high-performance optimizations.

## Assumptions
- Donations are simulated and stored as DB records; no payment processor.
- Images are referenced by URLs rather than file uploads for MVP.
- Deployment will use environment variables for DB and session config; secure cookie enabled in production environment.

## Acceptance Criteria (by feature)
- Registration: unique email enforced; password hashed; login yields session cookie.
- Trip create: persisted with required fields; owner set to creating user.
- Budget: planned totals computed accurately by category and aggregated.
- Expense logging: amounts added to actual totals and visible on trip page.
- Contribution restrictions: donations only accepted when `allow_donations` is true.
- Recap posting: only after `completed` status; single recap per trip enforced.

---
Generated: 2026-03-26

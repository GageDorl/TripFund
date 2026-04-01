# TripFund Build Walkthrough (Decisions + Code References)

## 1) Project foundation (Express + EJS + ESM + Postgres)

### What was built
- An Express server using ESM modules and server-side rendering with EJS.
- Session support and middleware wiring.
- Centralized startup flow that initializes the database before listening.

### Why this decision
- Assignment requires Node/Express, EJS/Liquid, ESM, and PostgreSQL.
- EJS keeps rendering on the server so role-based UI and form errors can be handled cleanly.

### Code references
- Server bootstrap and middleware: [`../server.js`](../server.js)
- Route wiring entry: [`../src/controllers/routes.js`](../src/controllers/routes.js)

### Example
```js
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));
app.use('/', router);
```

---

## 2) Database schema design and relationships

### What was built
- A normalized schema with multiple related tables:
  - `users`, `trips`, `itinerary_items`, `budget_categories`, `trip_budget_items`,
    `expenses`, `contributions`, `trip_status_history`, `recaps`, `recap_photos`,
    `comments`, `reports`.
- Foreign keys include `ON DELETE CASCADE` or `ON DELETE SET NULL` where appropriate.
- Idempotent schema creation (safe to run repeatedly).

### Why this decision
- Supports distinct domain features without stuffing data into one table.
- Cascades remove dependent records when parent records are deleted.
- Set-null preserves historical data when a referenced user/category is removed.

### Code references
- Schema creation + FK constraints: [`../src/middleware/db.js`](../src/middleware/db.js)

### Example
```sql
CREATE TABLE IF NOT EXISTS contributions (
  id TEXT PRIMARY KEY,
  trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
  contributor_user_id TEXT REFERENCES users(username) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 3) Authentication and authorization

### What was built
- Session-based authentication.
- Role-aware route protection (`user`, `moderator`, `admin`).
- `res.locals.currentUser` injection for view-level conditional UI.

### Why this decision
- Assignment requires session auth (not JWT).
- Central middleware avoids duplicated auth checks in every controller.

### Code references
- Auth middleware: [`../src/middleware/auth.js`](../src/middleware/auth.js)
- Session setup: [`../server.js`](../server.js)

### Example
```js
const requireRole = (...roles) => (req, res, next) => {
  const user = req.session.user;
  if (!user) return res.status(403).send('Forbidden');
  if (roles.includes(user.role)) return next();
  return res.status(403).send('Forbidden');
};
```

---

## 4) Global view context and navigation

### What was built
- A global middleware that injects:
  - current path helper,
  - role-dependent nav links,
  - date formatting helper.

### Why this decision
- Keeps templates DRY.
- Ensures nav options are consistent by login state/role.

### Code references
- Global locals middleware: [`../src/middleware/global.js`](../src/middleware/global.js)
- Shared header partial: [`../src/views/partials/header.ejs`](../src/views/partials/header.ejs)

### Example
```js
if (req.session.user) {
  res.locals.paths = {
    home: '/home',
    my_trips: '/trips',
    explore_trips: '/explore/trips',
    explore_recaps: '/explore/recaps',
    new_trip: '/trips/new',
    logout: '/logout'
  };
}
```

---

## 5) Route structure and SSR flow

### What was built
- Central route file for all feature modules.
- Public pages (explore/trip details) and protected actions (comments, donations, admin).
- Dynamic routes for resource-specific pages (`/trips/:id`, `/recaps/:id`).

### Why this decision
- A single router file makes endpoint coverage clear and auditable.
- Clean URL design maps directly to domain objects.

### Code references
- Route map: [`../src/controllers/routes.js`](../src/controllers/routes.js)

### Example
```js
router.get('/trips/:id', tripDetailsPage);
router.post('/trips/:id/donate', requireAuth, addDonationHandler);
router.get('/admin', requireAuth, requireAdmin, adminPage);
```

---

## 6) Trip CRUD and ownership model

### What was built
- Create, list, view, edit, delete flows for trips.
- “My Trips” page scoped to current user.
- Ownership checks before edit/delete.

### Why this decision
- Prevents users from modifying other users’ content.
- Keeps trip management aligned to account ownership.

### Code references
- Trip controllers: [`../src/controllers/trips/index.js`](../src/controllers/trips/index.js)
- Trip model: [`../src/models/trips.js`](../src/models/trips.js)

### Example
```js
if (trip.userId !== req.session.user.username) {
  return res.status(403).render('trips/edit', { error: 'Unauthorized', trip: null });
}
```

---

## 7) Budgeting, expenses, and contribution tracking

### What was built
- Planned budget categories and trip budget items.
- Actual expenses tracking.
- Donations/contributions with validation and atomic updates of `funds_raised`.

### Why this decision
- Distinguishes planned vs actual money to support financial visibility.
- Uses DB transaction for donation insert + trip total update consistency.

### Code references
- Contribution model transaction: [`../src/models/contributions.js`](../src/models/contributions.js)
- Trip details view showing financial summary: [`../src/views/trips/details.ejs`](../src/views/trips/details.ejs)

### Example
```js
const rows = await sql.begin(async (tx) => {
  const r1 = await tx`INSERT INTO contributions(...) VALUES(...) RETURNING *`;
  await tx`UPDATE trips SET funds_raised = COALESCE(funds_raised,0) + ${numericAmount} WHERE id = ${tripId}`;
  return r1;
});
```

---

## 8) Lifecycle workflow and recaps

### What was built
- Trip status history table and status-aware recap creation.
- Recap creation allowed only when trip is completed.
- One recap per trip (DB uniqueness on `recaps.trip_id`).

### Why this decision
- Satisfies multi-stage workflow requirement with traceable history.
- Prevents duplicate recap content for the same trip.

### Code references
- Recap/status logic in controller: [`../src/controllers/trips/index.js`](../src/controllers/trips/index.js)
- Status/recap tables: [`../src/middleware/db.js`](../src/middleware/db.js)

---

## 9) User interaction and moderation

### What was built
- Comments on trip pages.
- Reporting system for moderation.
- Moderator/admin report queue and resolution flow.

### Why this decision
- Supports user-generated content plus basic safety/moderation controls.

### Code references
- Routes for comments/reports/moderation: [`../src/controllers/routes.js`](../src/controllers/routes.js)
- Reports/comments tables: [`../src/middleware/db.js`](../src/middleware/db.js)

---

## 10) Admin dashboard and operations

### What was built
- Admin dashboard listing users and categories.
- Role updates (single user + bulk).
- Category CRUD.
- Operational metrics (users, trips, recaps, contributions, open reports).

### Why this decision
- Meets requirement for management interface and role control.
- Metrics provide operational visibility without extra tools.

### Code references
- Admin controller: [`../src/controllers/admin/index.js`](../src/controllers/admin/index.js)
- Admin view: [`../src/views/admin/index.ejs`](../src/views/admin/index.ejs)

### Example
```js
const [tu] = await sql`SELECT COUNT(*)::int AS total FROM users`;
const [tt] = await sql`SELECT COUNT(*)::int AS total FROM trips`;
const [orow] = await sql`SELECT COUNT(*)::int AS total FROM reports WHERE status IS NULL OR status = 'open'`;
```

---

## 11) Validation and UX decisions

### What was built
- Server-side validation in controllers/models.
- Form error rendering and value preservation on failed submissions.
- Client-side form helper script for immediate feedback.

### Why this decision
- Server validation is the authoritative security boundary.
- Client validation improves usability and reduces bad submissions.

### Code references
- Trip create/edit with preserved form values: [`../src/controllers/trips/index.js`](../src/controllers/trips/index.js)
- Client form script: [`../public/js/forms.js`](../public/js/forms.js)

---

## 12) Error handling and production behavior

### What was built
- Global error middleware in Express.
- Production-safe messaging (generic text), with details visible in development.
- Dedicated error template for consistent user experience.

### Why this decision
- Centralized error handling reduces duplicated try/catch response code.
- Avoids leaking internals to end users in production.

### Code references
- Global error middleware: [`../server.js`](../server.js)
- Error view: [`../src/views/error.ejs`](../src/views/error.ejs)

### Example
```js
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = NODE_ENV === 'production'
    ? 'An error occurred. Please try again later.'
    : err.message;
  res.status(status).render('error', { error: message, status, showDetails: NODE_ENV !== 'production' });
});
```

---

## 13) Styling evolution and UI layout

### What was built
- Shared typography/colors/navigation in global styles.
- Component-like card styles and responsive layout tweaks.
- Explore cards upgraded with progress indicators and visual accents.

### Why this decision
- Shared styles reduce repetition and keep UI coherent.
- Responsive cards improve mobile readability and engagement.

### Code references
- Global styles: [`../public/css/styles.css`](../public/css/styles.css)
- Feature/style enhancements: [`../public/css/phase8.css`](../public/css/phase8.css)
- Explore trips template: [`../src/views/explore/trips.ejs`](../src/views/explore/trips.ejs)

---

## 14) Deployment and ops notes

### What was built/decided
- Project configured for modern Node and pnpm lockfile consistency.
- Deployment currently targeted to Vercel with Supabase Postgres.

### Why this decision
- Fast hosting iteration during build/debug cycle.
- Supabase provides managed Postgres and schema visualization.

### Code references
- Package/runtime metadata: [`../package.json`](../package.json)
- Docs/deployment notes: [`../README.md`](../README.md)

---

## Summary of architecture choices
- **Server-rendered EJS** for role-aware pages and simple backend-driven UX.
- **Middleware-first security** for auth/roles and shared locals.
- **Normalized relational schema** for financial + workflow-heavy domain logic.
- **Feature folders** in controllers/models/views for maintainability.
- **Centralized error handling** for safer production behavior.
- **Incremental UI polish** without abandoning server-rendered simplicity.

# TripFund Implementation Plan

## Project Summary

**TripFund** is a server-side rendered web application built with **Node.js, Express, EJS, PostgreSQL, ESM, and vanilla JavaScript**. Users can plan trips, build budgets, track savings, optionally receive donations from other users, and publish post-trip recaps with photos and reviews for the community.

This implementation plan is designed to help you build the project in a way that:

- satisfies the CSE 340 final project requirements
- stays realistic for one semester
- looks polished and intentional to hiring managers
- avoids unnecessary complexity early on

---

## Recommended Tech Stack

### Required stack
- **Node.js**
- **Express.js**
- **EJS** for server-side rendering
- **PostgreSQL**
- **ESM modules** (`import` / `export`)
- **Render** for deployment

### Recommended packages
- `express`
- `ejs`
- `express-session`
- `connect-pg-simple` for storing sessions in PostgreSQL
- `pg`
- `bcrypt`
- `dotenv`
- `express-ejs-layouts` or your own partial/layout approach
- `express-validator`
- `method-override` for PUT/DELETE via forms
- `helmet`
- `xss` or a similar sanitization strategy
- `morgan` for development logging
- `multer` only if you decide to support real image uploads later

### Frontend
- **Vanilla JavaScript** only for progressive enhancement
- CSS can be plain CSS or a lightweight utility approach if your class allows it

---

## APIs / External Services You Would Need

You do **not** need many external APIs to make this project work well. In fact, keeping most of the app self-contained is better for a backend class.

### 1. Required external service: PostgreSQL database
You will need:
- a local PostgreSQL instance during development
- a hosted PostgreSQL database on Render in production

This is not really an API in the usual sense, but it is the main external service your app depends on.

### 2. Optional: Cloud image hosting API
If users are going to attach recap photos, you have two implementation choices:

#### Easier MVP approach
Store **image URLs** in the database instead of uploading files.
- Users paste image links
- You save those links in `recap_photos`
- No external upload API required

This is the easiest and safest option for your class project.

#### Better polish approach
Use an image hosting service such as:
- **Cloudinary API**
- UploadThing
- ImageKit

Recommended if you want actual uploads: **Cloudinary**

Why:
- simple Node integration
- stores image URLs after upload
- common in portfolio projects

### 3. Optional: Map/location API
If you want richer itinerary pages, you could later add:
- **Google Maps Places API**
- **Mapbox API**

Use only if you want location search or embedded maps. This is not necessary for the class requirements.

### 4. Optional: Payment API for real donations
If you wanted **real payments**, you would use:
- **Stripe API**

However, for this class, I strongly recommend **simulated donations stored in the database** instead of real payments.

Why:
- much faster to implement
- easier to validate and test
- avoids security complexity
- still satisfies the assignment because the workflow can be tracked in the database

### Best recommendation
For the class version, use:
- **no payment API**
- **no map API**
- **no upload API at first**
- just PostgreSQL, Express, EJS, and optional image URLs

That will keep the project strong and manageable.

---

## Core Application Features

### Public features
- Home page with featured public trips and recaps
- Explore page for public trip recaps
- View trip recap details
- Register / login pages

### Standard user features
- Create a trip plan
- Add itinerary items
- Set budget categories and planned amounts
- Track personal savings toward the trip
- Open trip for public donations
- Add expenses during or after the trip
- Mark trip through workflow stages
- Create a recap post after completing a trip
- Add recap photos by URL
- Comment on public recaps
- Edit/delete own comments

### Moderator features
- View flagged comments/recaps
- Delete inappropriate comments
- Feature a recap
- Review reported content

### Admin features
- Manage users and roles
- Manage core categories/tags
- Moderate comments and recaps
- View all trips and system metrics
- View contribution activity

---

## Multi-Stage Workflow Design

This is one of the most important grading requirements.

### Trip status workflow

`Draft -> Saving -> Fundraising -> Booked -> In Progress -> Completed -> Recap Posted -> Archived`

You do not need every transition to be automatic. Some can be user-triggered.

### Contribution workflow

If doing simulated donations:

`Pending -> Confirmed -> Cancelled`

Or, if you want to simplify even more:
- just store confirmed contributions and skip a separate payment lifecycle

### Moderation/report workflow

`Open -> Reviewed -> Resolved`

---

## Recommended Database Tables

Below is a practical schema that meets the assignment without becoming too large.

### `users`
- `user_id` PK
- `first_name`
- `last_name`
- `email` unique
- `password_hash`
- `role` (`admin`, `moderator`, `user`)
- `created_at`

### `trip_categories`
- `category_id` PK
- `name`
- `description`

Examples:
- Road Trip
- Backpacking
- International Travel
- Food Tour
- National Parks

### `trips`
- `trip_id` PK
- `owner_user_id` FK -> users
- `category_id` FK -> trip_categories
- `title`
- `destination`
- `description`
- `start_date`
- `end_date`
- `visibility` (`private`, `public`)
- `current_status`
- `fundraising_enabled` boolean
- `goal_amount`
- `created_at`
- `updated_at`

### `trip_status_history`
- `status_history_id` PK
- `trip_id` FK -> trips
- `old_status`
- `new_status`
- `changed_by_user_id` FK -> users
- `changed_at`

### `itinerary_items`
- `item_id` PK
- `trip_id` FK -> trips
- `day_number`
- `item_date`
- `title`
- `location`
- `notes`
- `estimated_cost`
- `sort_order`

### `budget_categories`
- `budget_category_id` PK
- `name`
- `description`

Examples:
- Lodging
- Transportation
- Food
- Activities
- Gear
- Miscellaneous

### `trip_budget_items`
- `trip_budget_item_id` PK
- `trip_id` FK -> trips
- `budget_category_id` FK -> budget_categories
- `planned_amount`

### `expenses`
- `expense_id` PK
- `trip_id` FK -> trips
- `budget_category_id` FK -> budget_categories
- `created_by_user_id` FK -> users
- `amount`
- `expense_date`
- `description`
- `created_at`

### `contributions`
- `contribution_id` PK
- `trip_id` FK -> trips
- `contributor_user_id` FK -> users
- `amount`
- `contribution_type` (`self_save`, `donation`)
- `status` (`confirmed`, `cancelled`)
- `message`
- `created_at`

### `recaps`
- `recap_id` PK
- `trip_id` FK -> trips unique
- `user_id` FK -> users
- `title`
- `summary`
- `body`
- `total_cost`
- `would_recommend` boolean
- `budget_accuracy_rating` integer
- `is_featured` boolean
- `created_at`
- `updated_at`

### `recap_photos`
- `photo_id` PK
- `recap_id` FK -> recaps
- `image_url`
- `caption`
- `sort_order`

### `comments`
- `comment_id` PK
- `recap_id` FK -> recaps
- `user_id` FK -> users
- `body`
- `created_at`
- `updated_at`
- `is_deleted` boolean

### `reports`
- `report_id` PK
- `reported_by_user_id` FK -> users
- `entity_type` (`comment`, `recap`)
- `entity_id`
- `reason`
- `status` (`open`, `reviewed`, `resolved`)
- `created_at`

---

## Foreign Key Behavior Recommendations

Use foreign key actions intentionally.

### Good defaults
- `trips.owner_user_id` -> `users.user_id`: **ON DELETE CASCADE**
  - if a user is removed in development or testing, their trips can be removed too
- `itinerary_items.trip_id` -> `trips.trip_id`: **ON DELETE CASCADE**
- `trip_budget_items.trip_id` -> `trips.trip_id`: **ON DELETE CASCADE**
- `expenses.trip_id` -> `trips.trip_id`: **ON DELETE CASCADE**
- `trip_status_history.trip_id` -> `trips.trip_id`: **ON DELETE CASCADE**
- `recaps.trip_id` -> `trips.trip_id`: **ON DELETE CASCADE**
- `recap_photos.recap_id` -> `recaps.recap_id`: **ON DELETE CASCADE**
- `comments.recap_id` -> `recaps.recap_id`: **ON DELETE CASCADE**

### Consider `SET NULL`
For some audit/history relationships, you may want records to remain if a user is deleted:
- `trip_status_history.changed_by_user_id`: **ON DELETE SET NULL**
- `reports.reported_by_user_id`: **ON DELETE SET NULL**
- `contributions.contributor_user_id`: **ON DELETE SET NULL** if you want to preserve donation history

---

## MVC Architecture Plan

Use a clean structure from the beginning.

```text
/project-root
  /src
    /controllers
    /models
    /routes
    /middleware
    /utilities
    /views
      /layouts
      /partials
      /account
      /trips
      /recaps
      /admin
      /moderation
    /public
      /css
      /js
      /images
    /db
      pool.js
      schema.sql
      seed.sql
    app.js
    server.js
  .env
  package.json
  README.md
```

### Suggested responsibility split

#### Controllers
Handle request/response flow.
Examples:
- `tripController.js`
- `authController.js`
- `recapController.js`
- `adminController.js`

#### Models
Contain database queries only.
Examples:
- `tripModel.js`
- `userModel.js`
- `contributionModel.js`

#### Routes
Map URLs to controllers.
Examples:
- `tripRoutes.js`
- `authRoutes.js`
- `adminRoutes.js`

#### Middleware
- auth checks
- role checks
- validation rules
- async error wrapper
- global error handler

#### Utilities
- formatters
- date helpers
- dashboard calculations
- flash message helpers if you add them

---

## Route Plan

### Auth routes
- `GET /register`
- `POST /register`
- `GET /login`
- `POST /login`
- `POST /logout`

### General pages
- `GET /`
- `GET /explore`
- `GET /about`

### Trip routes
- `GET /trips`
- `GET /trips/new`
- `POST /trips`
- `GET /trips/:tripId`
- `GET /trips/:tripId/edit`
- `PUT /trips/:tripId`
- `DELETE /trips/:tripId`

### Itinerary routes
- `GET /trips/:tripId/itinerary`
- `POST /trips/:tripId/itinerary`
- `GET /itinerary/:itemId/edit`
- `PUT /itinerary/:itemId`
- `DELETE /itinerary/:itemId`

### Budget routes
- `GET /trips/:tripId/budget`
- `POST /trips/:tripId/budget-items`
- `PUT /budget-items/:budgetItemId`
- `DELETE /budget-items/:budgetItemId`

### Expense routes
- `GET /trips/:tripId/expenses`
- `POST /trips/:tripId/expenses`
- `GET /expenses/:expenseId/edit`
- `PUT /expenses/:expenseId`
- `DELETE /expenses/:expenseId`

### Contribution routes
- `GET /trips/:tripId/contributions`
- `POST /trips/:tripId/contributions`
- `PUT /contributions/:contributionId/cancel`

### Trip status routes
- `POST /trips/:tripId/status`

### Recap routes
- `GET /trips/:tripId/recap/new`
- `POST /trips/:tripId/recap`
- `GET /recaps/:recapId`
- `GET /recaps/:recapId/edit`
- `PUT /recaps/:recapId`
- `DELETE /recaps/:recapId`

### Recap photo routes
- `POST /recaps/:recapId/photos`
- `PUT /photos/:photoId`
- `DELETE /photos/:photoId`

### Comment routes
- `POST /recaps/:recapId/comments`
- `GET /comments/:commentId/edit`
- `PUT /comments/:commentId`
- `DELETE /comments/:commentId`

### Report / moderation routes
- `POST /reports`
- `GET /moderation`
- `POST /moderation/reports/:reportId/resolve`

### Admin routes
- `GET /admin`
- `GET /admin/users`
- `PUT /admin/users/:userId/role`
- `GET /admin/categories`
- `POST /admin/categories`
- `PUT /admin/categories/:categoryId`
- `DELETE /admin/categories/:categoryId`

---

## EJS View Plan

Organize reusable views early so your app feels cohesive.

### Layouts / partials
- `layouts/main.ejs`
- `partials/header.ejs`
- `partials/footer.ejs`
- `partials/navigation.ejs`
- `partials/flash-messages.ejs`
- `partials/errors.ejs`

### Main pages
- `home.ejs`
- `explore.ejs`
- `login.ejs`
- `register.ejs`
- `error.ejs`

### Trip views
- `trips/index.ejs`
- `trips/new.ejs`
- `trips/show.ejs`
- `trips/edit.ejs`
- `trips/itinerary.ejs`
- `trips/budget.ejs`
- `trips/expenses.ejs`
- `trips/contributions.ejs`

### Recap views
- `recaps/show.ejs`
- `recaps/new.ejs`
- `recaps/edit.ejs`

### Dashboard views
- `account/dashboard.ejs`
- `moderation/index.ejs`
- `admin/index.ejs`
- `admin/users.ejs`
- `admin/categories.ejs`

---

## Vanilla JavaScript Plan

Use JavaScript only where it improves usability. Let the server remain the source of truth.

### Good uses of vanilla JS in this project

#### 1. Dynamic budget totals on forms
When the user types planned amounts or expenses, update totals on the page before submitting.

Example:
- total planned budget
- total actual expenses
- remaining amount

#### 2. Contribution progress bar updates
Update the visual progress bar client-side when entering contribution amounts before submission.

#### 3. Character counters
Useful for:
- trip descriptions
- recap summaries
- comments

#### 4. Form section toggles
Examples:
- show/hide donation settings if `fundraising_enabled` is checked
- show extra fields when visibility is public

#### 5. Delete confirmation modals
Simple JS confirmation for deleting itinerary items, comments, or photos.

#### 6. Sort/filter UI enhancement
Client-side filtering of recap cards already rendered on the page can improve UX.

### Avoid doing too much in vanilla JS
Do not move business logic into the browser.
Examples that should stay server-side:
- auth checks
- role checks
- validation enforcement
- database calculations that matter
- moderation permissions

---

## Authentication and Authorization Plan

### Authentication
Use:
- `express-session`
- `connect-pg-simple`
- `bcrypt`

### Flow
1. User registers
2. Password gets hashed with bcrypt
3. Session is created after login
4. User ID and role are stored in the session
5. Middleware makes current user available to all EJS views

### Authorization middleware
Create middleware like:
- `requireAuth`
- `requireRole('admin')`
- `requireRole('moderator', 'admin')`
- `requireTripOwnershipOrStaff`

This will make your permission system clean and easy to explain.

---

## Validation and Security Plan

### Validation
Use `express-validator` on every form:
- registration
- login
- trip creation
- itinerary item creation
- expense entry
- contribution entry
- recap creation
- comments

### Sanitization
Sanitize:
- text inputs
- comments
- recap body
- trip descriptions

### SQL injection protection
Use only parameterized queries with `pg`:

```js
const result = await pool.query(
  'SELECT * FROM trips WHERE trip_id = $1',
  [tripId]
)
```

### Session security
In production:
- secure cookies
- `httpOnly: true`
- `sameSite: 'lax'` or stronger if appropriate
- use environment variables for session secret

### Other security improvements
- `helmet()`
- generic error messages for users
- no stack traces in production

---

## Analytics / Hiring-Manager-Friendly Features

These are the kinds of features that make the project feel stronger than a class exercise.

### 1. Planned vs actual budget comparison
For each trip:
- total planned
- total spent
- difference
- category-by-category comparison

### 2. Savings progress
For each trip:
- goal amount
- total saved by owner
- total donated
- remaining amount needed

### 3. Trip performance summary on recap
- total cost
- budget accuracy score
- most expensive category
- cost per day

### 4. Explore page sorting
Allow sorting public recaps by:
- newest
- most funded
- lowest total cost
- featured

### 5. Admin metrics
- total users
- total public trips
- total recaps posted
- total contributions recorded
- top trip categories

These features use SQL aggregations and make your backend look more capable.

---

## Best MVP Scope

To avoid overbuilding, start with a version that still satisfies the rubric.

### Phase 1: Core setup
- Express app setup with ESM
- PostgreSQL connection
- EJS layout/partials
- session auth
- role middleware
- base CSS

### Phase 2: User accounts
- register
- login
- logout
- dashboard
- seed 3 roles

### Phase 3: Trip planning
- create/edit/delete trips
- itinerary CRUD
- budget item CRUD
- status updates with history

### Phase 4: Savings and expenses
- self-savings contributions
- expense CRUD
- planned vs actual view

### Phase 5: Social layer
- public/private trips
- recap creation
- recap photo URLs
- comments

### Phase 6: Moderation/admin
- report content
- moderator dashboard
- admin dashboard
- role management
- category management

### Phase 7: Polish
- validation feedback
- better dashboards
- filtering/sorting
- responsive styling
- seed data and test accounts

---

## Stretch Features (Only If Time Allows)

- real file uploads with Cloudinary
- real Stripe donations
- trip templates users can copy into new plans
- likes or bookmarks for recaps
- favorite destinations system
- contributor leaderboard
- public user profiles
- map embeds for itinerary items

Do not start with these.

---

## Suggested Build Order by Week

### Week 1
- project setup
- database schema draft
- ERD
- basic Express/EJS structure

### Week 2
- auth system
- sessions
- roles
- base navigation and layouts

### Week 3
- trip CRUD
- trip detail page
- status workflow basics

### Week 4
- itinerary CRUD
- budget categories and trip budget items

### Week 5
- expenses
- planned vs actual calculations
- dashboard summaries

### Week 6
- contributions and savings progress
- optional donation toggle

### Week 7
- recap creation
- recap photo URLs
- public explore page

### Week 8
- comments and report system
- moderator tools

### Week 9
- admin dashboard
- role management
- system metrics

### Week 10
- validation cleanup
- styling polish
- README
- test accounts
- Render deployment

---

## Deployment Plan for Render

### Environment variables
You will likely need:
- `DATABASE_URL`
- `SESSION_SECRET`
- `NODE_ENV`
- `PORT`

### Deployment checklist
- set production DB connection string
- set secure session cookie settings for production
- trust proxy if needed on Render
- run schema scripts against production DB
- seed test accounts
- verify image URLs and public pages work
- verify all forms use correct action URLs in production

---

## README Requirements Checklist

Make sure your README includes:

### 1. Project description
Explain what TripFund does and who it is for.

### 2. ERD image
Export from pgAdmin and include in README.

### 3. User roles
Explain:
- Admin
- Moderator
- User

### 4. Test account credentials
Provide one account for each role.
Use the required password format from the assignment.

### 5. Known limitations
Examples:
- donations are simulated, not real payments
- photos are URL-based in MVP
- no map integration yet

---

## What Will Make This Impressive to Hiring Managers

If you build this well, the strongest selling points are:

- clear relational database design
- practical multi-stage workflow with status history
- role-based authorization beyond simple auth
- admin/moderation tools
- server-side rendered app that still feels interactive
- analytics and summaries based on real data
- a distinct idea that is not just another generic clone

When you describe it in interviews, you can say you built:

> A full-stack travel planning and crowdfunding platform with trip budgeting, workflow tracking, role-based dashboards, user-generated trip recaps, and moderation tools, using Express, PostgreSQL, EJS, sessions, and server-side MVC architecture.

That sounds much stronger than just saying “I made a budget app.”

---

## Final Recommendation

Build the project in this order of importance:

1. **Auth and roles**
2. **Trip CRUD**
3. **Budget + itinerary**
4. **Status workflow + history**
5. **Expenses + savings**
6. **Recaps + comments**
7. **Moderator/admin tools**
8. **Polish and deployment**

Keep the first version focused and working. A smaller app that is reliable and polished is much better than a huge app with half-finished features.

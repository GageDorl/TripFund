# TripFund

## Project Description

TripFund is a web application designed to help travelers plan trips collaboratively, manage budgets, track expenses, and share travel experiences through recaps. Users can create trips, invite contributions from friends and family, post real-time expenses and itineraries, and write reflective recaps after their journey ends. The app is ideal for group travelers, solo adventurers seeking to document their journeys, and communities sharing travel stories.

**Target Users:** Travelers planning trips, groups coordinating group travel, and travelers who want to share and reflect on their experiences.

---

## Database Schema

### Entity Relationship Diagram (ERD)

The ERD was exported from Supabase and shows all database tables with their relationships:

![Database ERD](./erd.png)

### Tables
- **users**: Authentication and user profile data
- **trips**: Trip metadata, budgets, and funding status
- **itinerary_items**: Day-by-day trip itinerary
- **budget_categories**: Expense categories for organizing budgets
- **trip_budget_items**: Planned budget per category per trip
- **expenses**: Actual spending tracked during/after trips
- **contributions**: Donations and group fund contributions
- **trip_status_history**: Audit trail of trip status changes
- **recaps**: Trip writeups and reflections
- **recap_photos**: Photos included in recaps
- **comments**: User comments on trips and recaps
- **reports**: Moderation reports for content/user violations

---

## User Roles

### User
- Create and manage personal trips
- Edit/delete their own trips, expenses, itinerary items, and budgets
- Add expenses and track spending
- Write recaps for completed trips
- Comment on public trips and recaps
- Donate to friends' trips (if donations enabled)
- Report inappropriate content or users
- View public trips and recaps via explore pages

### Moderator
- All User permissions
- Access moderation queue to review reports
- Resolve reports and delete flagged content
- Cannot manage categories or user roles

### Admin
- All Moderator permissions
- Manage budget categories (create, edit, delete)
- Manage user roles (change roles for individual or bulk users)
- View admin metrics dashboard (total users, trips, contributions, etc.)

---

## Test Account Credentials


| Role | Username | Email |
|------|----------|-------|
| User | userAccount | user@tripfund.com |
| Moderator | modAccount | mod@tripfund.com |
| Admin | adminAccount | admin@tripfund.com |

---

## Known Limitations

1. **Test Coverage:** Unit tests are scaffolded (Jest configured) but comprehensive route and integration tests are not yet implemented.
2. **ERD Image:** The entity relationship diagram image must be manually exported from pgAdmin and added to the repository.
3. **Form Validation:** Client-side validation is present; server-side validation could be more comprehensive (e.g., date range checks, amount boundaries).
4. **Email Notifications:** Sending notifications to contributors or trip participants is not implemented.
5. **Image Uploads:** Recap photos and trip cover images use URL references; no file upload or image storage system is configured.
6. **Search:** A full-text search feature for trips and users is not implemented.
7. **Permissions:** Fine-grained permission controls (e.g., edit permissions for specific users) are not yet implemented.
8. **Performance:** Large datasets (high volume of trips, users, or comments) may encounter performance issues without database indexing tuning.

---

## Deployment

This application is deployed on **Vercel** (not Render) with a PostgreSQL database connected via Supabase. The live deployment can be accessed at the Vercel project URL. https://trip-fund-ten.vercel.app/home

import { Router } from "express";
import { indexPage, homePage, signUpPage, signUpHandler, loginPage, loginHandler, logoutHandler } from "./index.js";
import { tripsPage, newTripPage, newTripHandler, tripDetailsPage, editTripPage, updateTripHandler, deleteTripHandler, newRecapPage, createRecapHandler, showRecapPage } from "./trips/index.js";
import { itineraryPage, addItineraryHandler } from "./itinerary/index.js";
import { budgetPage, addBudgetHandler, deleteBudgetHandler } from "./budget/index.js";
import { expensesPage, addExpenseHandler, deleteExpenseHandler } from "./expenses/index.js";
import { addDonationHandler } from "./contributions/index.js";
import { postCommentHandler, deleteCommentHandler } from "./comments/index.js";
import { createReportHandler } from "./reports/index.js";
import { requireAuth, requireRole, requireAdmin } from "../middleware/auth.js";
import { tripsExplorePage, recapsExplorePage } from "./explore/index.js";
import { moderationQueue, resolveReportHandler } from "./moderation/index.js";
import { adminPage, createCategoryHandler, deleteCategoryHandler, updateUserRoleHandler, updateCategoryHandler, bulkUpdateUserRoles } from "./admin/index.js";


const router = Router();

router.get("/", indexPage);
router.get("/home", requireAuth, homePage);
router.get("/signup", signUpPage);
router.post("/signup", signUpHandler);
router.get("/login", loginPage);
router.post("/login", loginHandler);
router.get("/logout", logoutHandler);

router.get("/trips", requireAuth, tripsPage);
router.get("/trips/new", requireAuth, newTripPage);
router.post("/trips/new", requireAuth, newTripHandler);
router.get("/trips/:id", tripDetailsPage);
router.get("/trips/:id/edit", requireAuth, editTripPage);
router.post("/trips/:id/edit", requireAuth, updateTripHandler);
router.post("/trips/:id/delete", requireAuth, deleteTripHandler);
router.get('/trips/:id/itinerary', requireAuth, itineraryPage);
router.post('/trips/:id/itinerary', requireAuth, addItineraryHandler);
router.get('/trips/:id/budget', requireAuth, budgetPage);
router.post('/trips/:id/budget', requireAuth, addBudgetHandler);
router.get('/trips/:id/expenses', requireAuth, expensesPage);
router.post('/trips/:id/expenses', requireAuth, addExpenseHandler);
router.post('/trips/:id/expenses/:expenseId/delete', requireAuth, deleteExpenseHandler);
router.post('/trips/:id/comments', requireAuth, postCommentHandler);
router.post('/trips/:id/comments/:commentId/delete', requireAuth, deleteCommentHandler);
router.post('/trips/:id/donate', requireAuth, addDonationHandler);
router.post('/reports', requireAuth, createReportHandler);
router.get('/moderation/reports', requireAuth, requireRole('moderator','admin'), moderationQueue);
router.post('/moderation/reports/:id/resolve', requireAuth, requireRole('moderator','admin'), resolveReportHandler);
// explore pages
router.get('/explore/trips', tripsExplorePage);
router.get('/explore/recaps', recapsExplorePage);
// admin dashboard
router.get('/admin', requireAuth, requireAdmin, adminPage);
router.post('/admin/categories', requireAuth, requireAdmin, createCategoryHandler);
router.post('/admin/categories/:id/delete', requireAuth, requireAdmin, deleteCategoryHandler);
router.post('/admin/categories/:id/edit', requireAuth, requireAdmin, updateCategoryHandler);
router.post('/admin/users/:username/role', requireAuth, requireAdmin, updateUserRoleHandler);
router.post('/admin/users/bulk-role', requireAuth, requireAdmin, bulkUpdateUserRoles);
router.post('/trips/:id/budget/:itemId/delete', requireAuth, deleteBudgetHandler);
router.get('/trips/:id/recap/new', requireAuth, newRecapPage);
router.post('/trips/:id/recap', requireAuth, createRecapHandler);
router.get('/recaps/:id', requireAuth, showRecapPage);


export default router;
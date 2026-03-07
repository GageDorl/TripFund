import { Router } from "express";
import { indexPage, homePage, signUpPage, signUpHandler, loginPage, loginHandler, logoutHandler } from "./index.js";
import { tripsPage, newTripPage, tripDetailsPage } from "./trips/index.js";
import { requireAuth } from "../middleware/auth.js";


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
router.get("/trips/:id", requireAuth, tripDetailsPage);


export default router;
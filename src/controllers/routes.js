import { Router } from "express";
import { indexPage, signUpPage, loginPage } from "./index.js";
import { tripsPage, newTripPage, tripDetailsPage } from "./trips/index.js";


const router = Router();

router.get("/", indexPage);
router.get("/signup", signUpPage);
router.get("/login", loginPage);

router.get("/trips", tripsPage);
router.get("/trips/new", newTripPage);
router.get("/trips/:id", tripDetailsPage);


export default router;
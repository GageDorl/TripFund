import { createTrip, getTripById, updateTrip, getAllTrips, getTripsByUserId, deleteTrip } from "../../models/trips.js";
import { findUserById } from "../../models/users.js";
import formatDate from "../../utils/formatDate.js";
import { getTotalExpensesForTrip, getExpensesForTrip } from "../../models/expenses.js";
import { getTotalContributionsForTrip, getContributionsForTrip } from "../../models/contributions.js";
import { addStatusChange, getHistoryForTrip } from "../../models/tripStatusHistory.js";
import { getCommentsForTrip } from "../../models/comments.js";
import { createRecap, getRecapByTripId } from "../../models/recaps.js";

const tripsPage = async (req, res) => {
    const user = req.session.user;
    if (!user) return res.status(403).render('trips/index', { error: 'Unauthorized', trips: [] });
    const trips = await getTripsByUserId(user.username);
    // format dates for display
    const formatted = (trips || []).map(t => ({
        ...t,
        startDate: formatDate(t.startDate),
        endDate: formatDate(t.endDate)
    }));
    res.render("trips/index", { trips: formatted });
}

const newTripPage = (req, res) => {
    res.render("trips/new", { error: null, addValues: null });
}

const newTripHandler = async (req, res) => {
    req.body.userId = (req.session.user && req.session.user.username);
    const { name, destination, startDate, endDate, userId, cost, description } = req.body;
    const allowDonations = !!req.body.allowDonations;
    const fundingGoal = req.body.fundingGoal ? Number(req.body.fundingGoal) : 0;
    try {
        const newTrip = await createTrip({ name, destination, startDate, endDate, userId, cost, description, allowDonations, fundingGoal });
        res.redirect(`/trips/${newTrip.id}`);
    } catch (error) {
        // preserve submitted values to re-populate the form
        const addValues = { name, destination, startDate, endDate, cost, description };
        res.render("trips/new", { error: error.message, addValues });
    }
}

const tripDetailsPage = async (req, res) => {
    const tripId = req.params.id;
    try {
        const trip = await getTripById(tripId);
        console.log("Trip details retrieved:", trip);
        // format trip dates for display
        if (trip) {
            trip.startDate = formatDate(trip.startDate);
            trip.endDate = formatDate(trip.endDate);
            // fetch expenses and contributions summary
            const expenses = await getExpensesForTrip(tripId);
            const contributions = await getContributionsForTrip(tripId);
            trip.expenses = expenses;
            trip.contributions = contributions;
                trip.totalExpenses = await getTotalExpensesForTrip(tripId);
                trip.totalContributions = await getTotalContributionsForTrip(tripId);
                // normalize displayed fundsRaised to match recorded contributions
                trip.fundsRaised = trip.totalContributions;
            // fetch status history and recap (if any)
            trip.statusHistory = await getHistoryForTrip(tripId);
            trip.recap = await getRecapByTripId(tripId);
            // fetch comments
            trip.comments = await getCommentsForTrip(tripId);
        }
        res.render("trips/details", { trip });
    } catch (error) {
        res.render("trips/details", { error: error.message });
    }
}

const editTripPage = async (req, res) => {
    const tripId = req.params.id;
    try {
        const trip = await getTripById(tripId);
        if (!trip) {
            return res.status(404).render("trips/edit", { error: "Trip not found", trip: null });
        }
        // ensure current user is owner
        if (trip.userId !== req.session.user.username) {
            return res.status(403).render("trips/edit", { error: "Unauthorized", trip: null });
        }
        // format dates for form display
        trip.startDate = formatDate(trip.startDate);
        trip.endDate = formatDate(trip.endDate);
        res.render("trips/edit", { error: null, trip });
    } catch (error) {
        res.status(500).render("trips/edit", { error: error.message, trip: null });
    }
}

const updateTripHandler = async (req, res) => {
    const tripId = req.params.id;
    const { name, destination, startDate, endDate, cost, description } = req.body;
    const allowDonations = !!req.body.allowDonations;
    const fundingGoal = req.body.fundingGoal ? Number(req.body.fundingGoal) : 0;
    try {
        const trip = await getTripById(tripId);
        if (!trip) {
            return res.status(404).render("trips/edit", { error: "Trip not found", trip: null });
        }
        // ensure current user is owner
        if (trip.userId !== req.session.user.username) {
            return res.status(403).render("trips/edit", { error: "Unauthorized", trip: null });
        }
        // update trip details
        await updateTrip(tripId, { name, destination, startDate, endDate, cost, description, allowDonations, fundingGoal });
        res.redirect(`/trips/${trip.id}`);
    } catch (error) {
        res.status(500).render("trips/edit", { error: error.message, trip: { id: tripId, name, destination, startDate, endDate, cost, description } });
    }
}

const deleteTripHandler = async (req, res) => {
    const tripId = req.params.id;
    try {        const trip = await getTripById(tripId);
        if (!trip) {
            return res.status(404).render("trips/details", { error: "Trip not found", trip: null });
        }
        // ensure current user is owner
        if (trip.userId !== req.session.user.username) {
            return res.status(403).render("trips/details", { error: "Unauthorized", trip });
        }
        await deleteTrip(tripId);
        res.redirect("/trips");
    } catch (error) {
        res.status(500).render("trips/details", { error: error.message, trip: null });
    }
}




const newRecapPage = async (req, res) => {
    const tripId = req.params.id;
    try {
        const trip = await getTripById(tripId);
        if (!trip) return res.status(404).render('trips/recap_new', { error: 'Trip not found', trip: null });
        if (trip.userId !== req.session.user.username) return res.status(403).render('trips/recap_new', { error: 'Unauthorized', trip: null });
        if (trip.status !== 'completed') return res.status(400).render('trips/recap_new', { error: 'Recap allowed only for completed trips', trip });
        const existing = await getRecapByTripId(tripId);
        if (existing) return res.redirect(`/recaps/${existing.id}`);
        res.render('trips/recap_new', { error: null, trip });
    } catch (error) {
        res.status(500).render('trips/recap_new', { error: error.message, trip: null });
    }
}

const createRecapHandler = async (req, res) => {
    const tripId = req.params.id;
    const { title, body, totalCost, lessonsLearned, recommendation } = req.body;
    try {
        const trip = await getTripById(tripId);
        if (!trip) return res.status(404).send('Trip not found');
        if (trip.userId !== req.session.user.username) return res.status(403).send('Unauthorized');
        const recap = await createRecap({ tripId, title, body, totalCost, lessonsLearned, recommendation });
        res.redirect(`/recaps/${recap.id}`);
    } catch (error) {
        res.status(400).render('trips/recap_new', { error: error.message, trip: await getTripById(tripId) });
    }
}

const showRecapPage = async (req, res) => {
    const recapId = req.params.id;
    try {
        const recap = await getRecapById(recapId);
        if (!recap) return res.status(404).render('recaps/show', { error: 'Recap not found', recap: null });
        res.render('recaps/show', { recap });
    } catch (error) {
        res.status(500).render('recaps/show', { error: error.message, recap: null });
    }
}

export { tripsPage, newTripPage, newTripHandler, tripDetailsPage, editTripPage, updateTripHandler, deleteTripHandler, newRecapPage, createRecapHandler, showRecapPage };
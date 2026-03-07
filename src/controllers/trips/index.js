const tripsPage = (req, res) => {
    res.render("trips/index");
}

const newTripPage = (req, res) => {
    res.render("trips/new");
}

const tripDetailsPage = (req, res) => {
    const tripId = req.params.id;
    res.render("trips/details", { tripId });
}

export { tripsPage, newTripPage, tripDetailsPage };
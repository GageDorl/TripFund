const getCurrentPath = (req, res, next) => {
    res.locals.getCurrentPath = () => {
        return req.path;
    }
    res.locals.paths = {
        home: "/",
        signup: "/signup",
        login: "/login",
        trips: "/trips",
        newTrip: "/trips/new"
    };
    next();
}

export { getCurrentPath };
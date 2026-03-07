const getCurrentPath = (req, res, next) => {
    res.locals.getCurrentPath = () => {
        return req.path;
    }
    res.locals.paths = req.session.user ? {
        home: "/home",
        trips: "/trips",
        new_trip: "/trips/new",
        logout: "/logout",
    } : {
        home: "/",
        signup: "/signup",
        login: "/login",
    };
    next();
}

export { getCurrentPath };
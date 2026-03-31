import formatDate from '../utils/formatDate.js';

const getCurrentPath = (req, res, next) => {
    res.locals.getCurrentPath = () => {
        return req.path;
    }
    if (req.session.user) {
        res.locals.paths = {
            home: "/home",
            my_trips: "/trips",
            explore_trips: "/explore/trips",
            explore_recaps: "/explore/recaps",
            new_trip: "/trips/new",
            logout: "/logout",
        };
        // show admin link for admin users
        if (req.session.user.role && (req.session.user.role === 'admin' || req.session.user.role === 'moderator')) {
            res.locals.paths.admin = '/admin';
        }
    } else {
        res.locals.paths = {
            home: "/",
            explore_trips: "/explore/trips",
            explore_recaps: "/explore/recaps",
            signup: "/signup",
            login: "/login",
        };
    }
    // make formatting helper available in all views
    res.locals.formatDate = formatDate;
    next();
}

export { getCurrentPath };
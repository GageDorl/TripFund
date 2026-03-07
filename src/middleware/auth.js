const setCurrentUser = (req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
}

const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}


export { setCurrentUser, requireAuth };
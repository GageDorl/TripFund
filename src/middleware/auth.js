const setCurrentUser = (req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    res.locals.activeTrips = req.session.user ? req.session.user.activeTrips : [];
    next();
}

const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}

const requireRole = (...roles) => {
    return (req, res, next) => {
        const user = req.session.user;
        if (!user) return res.status(403).send('Forbidden');
        if (roles.length === 0) return next();
        if (roles.includes(user.role)) return next();
        return res.status(403).send('Forbidden');
    }
}


const requireAdmin = (req, res, next) => {
    const user = req.session.user;
    if (!user) return res.redirect('/login');
    if (user.role && user.role === 'admin') return next();
    return res.status(403).render('admin/forbidden', { message: 'Admin role required to access this page.' });
}

export { setCurrentUser, requireAuth, requireRole, requireAdmin };
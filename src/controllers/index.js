import { createUser, findUserByEmail, verifyUser } from "../models/users.js";

const indexPage = (req, res) => {
    if(req.session.user) {
        return res.redirect("/home");
    }
    res.render("index");
}

const homePage = (req, res) => {
    const activeTrips = req.session.user ? req.session.user.activeTrips : [];
    res.render("home", { currentUser: req.session.user, activeTrips });
}

const signUpPage = (req, res) => {
    res.render("signup", { error: null });
}

const signUpHandler = async (req, res) => {
    const { name, email, password } = req.body;
    if (await findUserByEmail(email)) {
        return res.render("signup", { error: "Email already in use" });
    }
    const newUser = await createUser({ name, email, password });
    req.session.user = newUser;
    res.redirect("/home");
}

const loginPage = (req, res) => {
    res.render("login", { error: null });
}

const loginHandler = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await verifyUser(email, password);
        req.session.user = user;
        res.redirect("/home");
    } catch (error) {
        res.render("login", { error: error.message });
    }
}

const logoutHandler = (req, res) => {
    req.session.destroy();
    res.redirect("/");
}

export {indexPage, homePage, signUpPage, signUpHandler, loginPage, loginHandler, logoutHandler};
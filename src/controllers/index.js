import { createUser, verifyUser } from "../models/users.js";
import { getTripsByUserId } from "../models/trips.js";

const indexPage = (req, res) => {
    if(req.session.user) {
        return res.redirect("/home");
    }
    res.render("index");
}

const homePage = async (req, res) => {
    const userKey = (req.session.user && req.session.user.username);
    const userTrips = await getTripsByUserId(userKey);
    res.render("home", { currentUser: req.session.user, userTrips: userTrips || [] });
}

const signUpPage = (req, res) => {
    res.render("signup", { error: null, values: {} });
}

const signUpHandler = async (req, res) => {
    const { name, email, password, username, first_name, last_name } = req.body;
    try{
        const newUser = await createUser({ name, email, password, username, first_name, last_name });
        req.session.user = newUser;
        res.redirect("/home");
    } catch (error) {
        return res.render("signup", { error: error.message, values: { name, email, username, first_name, last_name } });
    }
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
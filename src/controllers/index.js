const indexPage = (req, res) => {
    res.render("index");
}

const signUpPage = (req, res) => {
    res.render("signup");
}

const loginPage = (req, res) => {
    res.render("login");
}

export {indexPage, signUpPage, loginPage};
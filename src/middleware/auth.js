module.exports = {
    isAuthenticated: (req, res, next) => {
        if (req.session.loggedin) {
            return next();
        } else {
            res.redirect('/login');
        }
    }
};
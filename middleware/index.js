let middleware = {};
let Log = require('../models/logbookLog');
let logbook = require('../utilities/logbook');

middleware.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'Please log in');
    res.redirect('/');
}

middleware.checkNotifications = function (req, res, next) {
    Log.find({
        sender: req.user.department,
        approved: false
    }, (err, logs) => {
        if (err) {
            console.log(err);
        } else {
            logbook.pushNotifications(logs, req.user.department);
            return next();
        }
    });
}

module.exports = middleware;
let express = require("express");
let router = express.Router();
let middleware = require('../middleware')

router.get("/", middleware.isLoggedIn, (req, res) => {
	res.render("logbook/index");
});

router.get('/new', middleware.isLoggedIn, (req, res) => {
	res.render('logbook/new');
});

router.get('/incoming', middleware.isLoggedIn, (req, res) => {
	res.render('logbook/incoming')
});

router.get('/approved', middleware.isLoggedIn, (req, res) => {
	res.render('logbook/approved')
});

router.get('/notifications', middleware.isLoggedIn, (req, res) => {
	res.render('logbook/notifications')
});

router.get('/profile', middleware.isLoggedIn, (req, res) => {
	res.render('logbook/profile')
});



module.exports = router;
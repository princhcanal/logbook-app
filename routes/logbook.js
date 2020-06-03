let express = require("express");
let router = express.Router();

router.get("/", (req, res) => {
	res.render("logbook/index");
});

router.get('/new', (req, res) => {
	res.render('logbook/new');
});

router.get('/incoming', (req, res) => {
	res.render('logbook/incoming')
});

router.get('/approved', (req, res) => {
	res.render('logbook/approved')
});

router.get('/notifications', (req, res) => {
	res.render('logbook/notifications')
});

router.get('/profile', (req, res) => {
	res.render('logbook/profile')
});



module.exports = router;
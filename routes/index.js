let express = require("express");
let router = express.Router();
let passport = require('passport');
let User = require('../models/user');

// root route
router.get("/", (req, res) => {
	res.render("login");
});

// AUTH ROUTES //

// signup
router.post('/signup', (req, res) => {
	let userData = {
		firstName: req.body.firstname,
		lastName: req.body.lastname,
		email: req.body.email,
		username: req.body.username,
		accountType: req.body.accType,
		department: req.body.department
	}
	let newUser = new User(userData);
	User.register(newUser, req.body.password, (err, user) => {
		if (err) {
			req.flash('error', err.message);
			return res.redirect('/');
		} else {
			passport.authenticate('local')(req, res, () => {
				req.flash('success', `Welcome to Logbook ${user.username}!`);
				res.redirect('/logbook');
			});
		}
	});
});

// login
router.post('/login', passport.authenticate('local', {
	successRedirect: '/logbook',
	failureRedirect: '/'
}), (req, res) => {});

// logout
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success', 'Successfully logged out!');
	res.redirect('/');
})

module.exports = router;
let express = require("express");
let router = express.Router();
let passport = require('passport');
let User = require('../models/user');
let Department = require('../models/department');
let Log = require('../models/logbookLog');

// root route
router.get("/", (req, res) => {
	if (req.user) {
		Log.find({
			sender: req.user.department,
			approved: false
		}, (err, logs) => {
			if (err) {
				console.log(err);
			} else {
				res.render('logbook/index', {
					logs: logs
				});
			}
		});
	} else {
		// Department.find({}, (err, departments) => {
		// 	if (err) {
		// 		console.log(err);
		// 	} else {
		// 		res.render('login', {
		// 			departments: departments
		// 		});
		// 	}
		// });
		res.render('login', {
			departments: [{
				abbreviation: 'ETO',
				name: 'Enrollment Technical Office'
			}]
		})
	}
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
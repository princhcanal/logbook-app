let express = require("express");
let router = express.Router();
let passport = require('passport');
let User = require('../models/user');
let Department = require('../models/department');
let Log = require('../models/logbookLog');

function sort(arr) {
	for (let i = 0; i < arr.length; i++) {
		for (let j = i + 1; j < arr.length; j++) {
			if (arr[j].name < arr[i].name) {
				let temp = arr[i];
				arr[i] = arr[j];
				arr[j] = temp;
			}
		}
	}
}

// root route
router.get("/", (req, res) => {
	if (req.user) {
		res.redirect('/logbook');
	} else {
		Department.find({}, (err, departments) => {
			if (err) {
				console.log(err);
			} else {
				sort(departments);
				res.render('login', {
					departments: departments
				});
			}
		});
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
	failureRedirect: '/',
	failureFlash: true
}), (req, res) => {});

// logout
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success', 'Successfully logged out!');
	res.redirect('/');
})

module.exports = router;
// assigning a variable to a "require('filename.ext')" is how we import files in NodeJS
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Department = require('../models/department');
const sort = require('../utilities/sort');

/* 
	In backend web development, we need to define the routes that the user can go to. For example, the home page route is '/', so we need to define what the user gets when they visit '/' on our website. We also need to define what type of requests the user wants with a certain route.

	There are 4 main types of "requests" that we use in our application

	1. GET - a get request simply means you're asking the server to give you data. This can be in the form of HTML, JSON, plain text, etc. In most cases of our application, we will be sending HTML to be shown the user.

	2. POST - a post request means we want the server to create something given the data that we give the server to a database. In most cases of our application, we will be using HTML forms to send data to our server. However, in our frontend code, we will also be sending AJAX requests to send data.

	3. DELETE - a delete request is just like what it sounds. It tells our server to delete data from our database.

	4. PUT - a put request means that we want the server to update existing data that is already on our database. Again, we will be sending our data to the server using HTML forms or AJAX requests 
*/

// root route
// This is the route that shows the login page of our application
// we use the router variable defined above to handle our routes
// the first parameter is the path or route that we want to handle
// the second parameter is what's called a callback function which is a function that is passed into another function
// in JavaScript, we are able to define functions as we're passing them into functions as seen below
// we can define a function with the function keyword and pass in arguments in parentheses like a regular function
// the callback takes in two parameters, req and res
// req is the request object that we get from the user
// what's important in the req object is the data that the user gives to the server and the user data
// res is the response variable that allows us to respond to the user making the request
// so basically, the req comes from the user and the res comes from the server
router.get('/', function (req, res) {
	// if logged in
	if (req.user) {
		// if(req.user) is checking if there is a user logged in
		// if there is a user, we want to redirect them to the logbook route which is our home page
		res.redirect('/logbook');
	} else {
		// if there is no user, then we want to render the login page
		// but before that, we need to find all the departments that our database contains
		// in order to do that, we use the mongoose method "find"
		// the first argument in find is a JavaScript object which filters out which departments we want
		// since we want all departments, we leave the object empty
		// in our callback function, we get our error (if there is one) as well as the departments that were found
		Department.find({}, function (err, departments) {
			if (err) {
				// if there is an error, then this happens
				console.log(err); // mura rag printf()
			} else {
				// if there is no error, meaning we were able to get our departments, this happens

				// first, we sort the departments alphabetically using the sort function that we defined in our utilities
				sort(departments);
				// next, we want to render our login HTML and there, we pass a a variable called departments which contains our sorted departments
				// to do that, we need to use the render method on our res variable
				// then we need to pass in a string which is the path to where the HTML is
				// the next argument is a JavaScript object that contains all the variables that we want to pass into our HTML to render it dynamically
				// in our JavaScript we define a variable called departments (which is the key) and its value is the departments that we sorted
				res.render('login', {
					departments: departments,
				});
			}
		});
	}
});

// AUTH ROUTES //

// signup
// this is where our signup form will be processed
// this is a post route, so it is meant to create something in our database
// in this case, to create a user
router.post('/signup', function (req, res) {
	User.findOne({ username: req.body.username }, (err, user) => {
		if (user) {
			req.flash('error', 'Username taken');
			res.redirect('/');
		} else {
			// all the values that the user sends to the server can be found in req.body
			// we define userData to be a JavaScript object that contains the data that we want when we create our new user
			let userData = {
				firstName: req.body.firstname,
				lastName: req.body.lastname,
				username: req.body.username,
				accountType: req.body.accType,
				department: req.body.department,
			};
			// to create our user, we need to do two steps
			// first is to create a new instance of our User Schema passing in our userData variable
			let newUser = new User(userData);
			// notice how there is no password in the userData
			// that is because we want the password to be encrypted so we use the passport-local-mongoose method "register"
			// in register, we pass in our newUser, the password given by the user, and our callback function
			User.register(newUser, req.body.password, function (err, user) {
				if (err) {
					// if the user failed to register, we will "flash" an error message and redirect them back to the / route which is our login page
					req.flash('error', err.message);
					return res.redirect('/');
				} else {
					// if the user was created, we authenticate the user
					passport.authenticate('local')(req, res, function () {
						// when the user is authenticated, we flash a welcome message that is seen once the user is redirected to /logbook
						req.flash(
							'success',
							`Welcome to Logbook ${user.username}!`
						);
						res.redirect('/logbook');
					});
				}
			});
		}
	});
});

// login
// this post route handles our login
// we first authenticate the user using passport
// if user is authenticated, redirect the to /logbook
// if not, redirect them back to the login page with a flash message
router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/logbook',
		failureRedirect: '/',
		failureFlash: true,
	}),
	function (req, res) {}
);

// logout
// this route allows a user to logout simply by using req.logout()
router.get('/logout', function (req, res) {
	req.logout();
	req.flash('success', 'Successfully logged out!');
	res.redirect('/');
});

module.exports = router;

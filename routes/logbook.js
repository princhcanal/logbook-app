let express = require("express");
let router = express.Router();
let middleware = require('../middleware');
let Log = require('../models/logbookLog');
let Department = require('../models/department')

router.get("/", middleware.isLoggedIn, (req, res) => {
	Department.findOne({
		abbreviation: req.user.department
	}).populate('logs').exec((err, department) => {
		if (err) {
			console.log(err);
		} else {
			res.render('logbook/index', {
				logs: department.logs
			})
		}
	})
});

router.get('/new', middleware.isLoggedIn, (req, res) => {
	Department.find({}, (err, departments) => {
		if (err) {
			console.log(err);
		} else {
			res.render('logbook/new', {
				departments: departments
			});
		}
	})
});

router.post('/new', middleware.isLoggedIn, (req, res) => {
	let today = new Date()
	let day = today.getDate();
	let month = today.getMonth() + 1;
	let year = today.getFullYear();

	if (day < 10) day = '0' + day;
	if (month < 10) day = '0' + month;

	let dateString = `${month}${day}${year}`

	const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

	let dueDate = req.body.dueDate;
	let date = dueDate.split('-');
	console.log(dueDate)
	let dueDateString = `${months[Number(dueDate[1])]} ${date[2]}, ${date[0]}`

	let logData = {
		re: req.body.re,
		docType: req.body.docType,
		dueDate: dueDateString,
		destination: req.body.destination,
		status: 'FROZEN',
		approved: false
	}

	Department.find({
		abbreviation: req.user.department
	}, (err, department) => {
		if (err) {
			console.log(err);
			res.redirect('/new')
		} else {
			Log.create(logData, (err, log) => {
				if (err) {
					req.flash('error', 'Something went wrong');
					console.log(err);
				} else {
					log.author = req.user.firstName + ' ' + req.user.lastName;
					log.sender = req.user.department
					log.docId = `${dateString}-${department[0].logs.length + 1}`
					log.save();
					department[0].logs.push(log);
					department[0].save();
					req.flash('success', 'Successfully added log');
					res.redirect('/logbook');
				}
			});
		}
	})
});

router.put('/', (req, res) => {
	Log.updateOne({
		docId: req.body.docId
	}, {
		status: req.body.status
	}, (err, log) => {
		if (err) {
			console.log(err)
		} else {
			res.redirect('/logbook')
		}
	})
})

router.get('/incoming', middleware.isLoggedIn, (req, res) => {
	Log.find({
		sender: req.user.department
	}, (err, logs) => {
		res.render('logbook/incoming', {
			logs: logs
		})
	})
});

router.get('/approved', middleware.isLoggedIn, (req, res) => {
	Log.find({
		sender: req.user.department,
		approved: true
	}, (err, logs) => {
		if (err) {
			console.log(err);
		} else {
			res.render('logbook/approved', {
				logs: logs
			})
		}
	});
});

router.get('/notifications', middleware.isLoggedIn, (req, res) => {
	res.render('logbook/notifications')
});

router.get('/profile', middleware.isLoggedIn, (req, res) => {
	res.render('logbook/profile')
});



module.exports = router;
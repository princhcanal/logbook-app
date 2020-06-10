let express = require("express");
let router = express.Router();
let middleware = require('../middleware');
let User = require('../models/user');
let Log = require('../models/logbookLog');
let Department = require('../models/department');
let ActivityLog = require('../models/activityLog');
let Notification = require('../models/notification');
let logbook = require('../utilities/logbook');
let sort = require('../utilities/sort');
let dates = require('../utilities/dates');
let multer = require('multer');
let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads/')
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
});
let fileFilter = (req, file, cb) => {
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
		cb(null, true);
	} else {
		cb(null, false);
	}
}
let upload = multer({
	storage: storage,
	limits: {
		fileSize: 1024 * 1024 * 5
	},
	fileFilter: fileFilter
});

router.get("/", middleware.isLoggedIn, middleware.checkNotifications, (req, res) => {
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
});

router.get('/new', middleware.isLoggedIn, middleware.checkNotifications, (req, res) => {
	Department.find({}, (err, departments) => {
		if (err) {
			console.log(err);
		} else {
			sort(departments);
			res.render('logbook/new', {
				departments: departments
			});
		}
	})
});

// create a log
router.post('/new', middleware.isLoggedIn, (req, res) => {
	let dateIdString = dates.createDateString(...[, ], 'id');
	let createdDate = dates.createDateString();
	let pendingDate = dates.createDateString(...[, , ], 3);
	let dueDate = '-';
	if (req.body.dueDate && req.body.dueDate.length > 0) {
		dueDate = dates.createDateString(new Date(req.body.dueDate));
	}
	let almostDueDate = dates.createDateString(new Date(req.body.dueDate), ...[, ], -1);

	let logData = {
		re: req.body.re,
		author: `${req.user.firstName} ${req.user.lastName}`,
		sender: req.user.department,
		docType: req.body.docType,
		approved: false,
		returned: false,
		dueDate: dueDate,
		createdDate: createdDate,
		pendingDate: pendingDate,
		almostDueDate: almostDueDate
	}

	Department.findOne({
		abbreviation: req.user.department
	}, (err, department) => {
		if (err) {
			console.log(err);
			res.redirect('/logbook/new');
		} else {
			Log.create(logData, (err, log) => {
				if (err) {
					req.flash('error', 'Something went wrong');
					console.log(err);
				} else {
					log.docId = `${dateIdString}-${department.logs.length + 1}`;

					let destinations = req.body.destinations
					for (let destination in destinations) {
						log.destinations.push(destinations[destination]);
						log.statuses.push('FROZEN');
					}

					log.save();

					department.logs.push(log);
					department.save();

					logbook.addActivityLog(req, log, 'added');

					req.flash('success', 'Successfully added log');
					res.redirect('/logbook');
				}
			});
		}
	})
});

// approve a log
router.put('/', middleware.isLoggedIn, (req, res) => {
	logbook.findAndAddActivityLog(req, 'approved');

	let approvedDate = dates.createDateString();

	Log.updateOne({
		docId: req.body.docId
	}, {
		approved: true,
		approvedDate: approvedDate
	}, (err, log) => {
		if (err) {
			res.send(err)
		} else {
			res.send(log);
		}
	})
})

router.delete('/', middleware.isLoggedIn, (req, res) => {
	logbook.findAndAddActivityLog(req, 'deleted');

	Log.deleteOne({
		docId: req.body.docId
	}, (err) => {
		if (err) {
			res.send(err);
		} else {
			res.send('deleted');
		}
	})
});

router.get('/incoming', middleware.isLoggedIn, middleware.checkNotifications, (req, res) => {
	Log.find({
		destinations: req.user.department,
		returned: false
	}, (err, logs) => {
		// logs = logs.filter((log) => {
		// 	return !log.statuses[log.destinations.indexOf(req.user.department)].includes('Returned') &&
		// 		!log.statuses[log.destinations.indexOf(req.user.department)].includes('Processed') &&
		// 		!log.approved
		// })
		res.render('logbook/incoming', {
			logs: logs
		})
	})
});

router.put('/incoming', middleware.isLoggedIn, (req, res) => {
	Log.findOne({
		docId: req.body.docId
	}, (err, log) => {
		if (err) {
			console.log(err);
		} else {
			logbook.addActivityLog(req, log, req.body.status.toLowerCase());
			logbook.addNotification(req, log);
		}
	});

	let hour = dates.get12HourWithMeridian();

	let statuses = req.body.statuses;
	let indices = req.body.statusIndices;
	for (let i = 0; i < indices.length; i++) {
		statuses[indices[i]] = `${req.body.status} by ${req.user.firstName} ${req.user.lastName} @${hour}`;
	}

	Log.updateOne({
		docId: req.body.docId
	}, {
		statuses: statuses,
		returned: req.body.returned
	}, (err, log) => {
		if (err) {
			res.send(err);
		} else {
			res.send(log);
		}
	})
})

router.get('/approved', middleware.isLoggedIn, middleware.checkNotifications, (req, res) => {
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

router.get('/notifications', middleware.isLoggedIn, middleware.checkNotifications, (req, res) => {
	Notification.find({
		receiver: req.user.department
	}, (err, notifications) => {
		if (err) {
			console.log(err);
		} else {
			res.render('logbook/notifications', {
				notifications: notifications
			})
		}
	})
});

router.get('/profile', middleware.isLoggedIn, middleware.checkNotifications, (req, res) => {
	ActivityLog.find({
		author: req.user.username
	}, (err, activityLogs) => {
		if (err) {
			console.log(err);
		} else {
			res.render('logbook/profile', {
				activityLogs: activityLogs
			});
		}
	});
});

router.get('/profile/edit', middleware.isLoggedIn, middleware.checkNotifications, (req, res) => {
	res.render('logbook/edit-profile');
})

router.put('/profile/edit', middleware.isLoggedIn, upload.single('profilePicture'), (req, res) => {
	let newUserData = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		profilePicture: '/' + req.file.path
	}
	User.findByIdAndUpdate(req.user._id, newUserData, (err, user) => {
		if (err) {
			req.flash('error', 'Something went wrong')
			res.redirect('/logbook/profile/edit');
		} else {
			res.redirect('/logbook/profile');
		}
	})
});

router.put('/profile/edit/picture', middleware.isLoggedIn, upload.single('profilePicture'), (req, res) => {
	let newUserData = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		profilePicture: '/' + req.file.path
	}
	User.findByIdAndUpdate(req.user._id, newUserData, (err, user) => {
		if (err) {
			req.flash('error', 'Something went wrong')
			res.redirect('/logbook/profile/edit');
		} else {
			res.redirect(303, '/logbook/profile');
		}
	});
})

module.exports = router;
const express = require("express");
const router = express.Router();
const middleware = require('../middleware');
const User = require('../models/user');
const Log = require('../models/logbookLog');
const Department = require('../models/department');
const ActivityLog = require('../models/activityLog');
const Notification = require('../models/notification');
const logbook = require('../utilities/logbook');
const sort = require('../utilities/sort');
const dates = require('../utilities/dates');
const fs = require('fs');
const upload = require('../utilities/upload');

router.get("/", middleware.isLoggedIn, middleware.checkNotifications, function (req, res) {
	Log.find({
		sender: req.user.department,
		approved: false
	}, async function (err, logs) {
		if (err) {
			console.log(err);
		} else {
			res.render('logbook/index', {
				logs: logs,
				numIncoming: await logbook.getIncomingLength(req.user.department)
			});
		}
	});
});

router.get('/new', middleware.isLoggedIn, middleware.checkNotifications, function (req, res) {
	Department.find({}, async function (err, departments) {
		if (err) {
			console.log(err);
		} else {
			sort(departments);
			res.render('logbook/new', {
				departments: departments,
				numIncoming: await logbook.getIncomingLength(req.user.department)
			});
		}
	})
});

// create a log
router.post('/new', middleware.isLoggedIn, function (req, res) {
	let dateIdString = dates.createDateString(...[, ], 'id'); // 06142020
	let createdDate = dates.createDateString(); // June 14, 2020
	let pendingDate = dates.createDateString(...[, , ], 3); // June 17, 2020
	let dueDate = '-';
	if (req.body.dueDate && req.body.dueDate.length > 0) {
		dueDate = dates.createDateString(new Date(req.body.dueDate));
	}
	let almostDueDate = dates.createDateString(new Date(req.body.dueDate), ...[, ], -1); // June 14, 2020

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
	}, function (err, department) {
		if (err) {
			console.log(err);
			res.redirect('/logbook/new');
		} else {
			Log.create(logData, function (err, log) {
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
router.put('/', middleware.isLoggedIn, function (req, res) {
	logbook.findAndAddActivityLog(req, 'approved');

	let approvedDate = dates.createDateString();

	Log.updateOne({
		docId: req.body.docId,
		sender: req.user.department
	}, {
		approved: true,
		approvedDate: approvedDate
	}, function (err, log) {
		if (err) {
			res.send(err)
		} else {
			res.send(log);
		}
	})
})

router.delete('/', middleware.isLoggedIn, function (req, res) {
	logbook.findAndAddActivityLog(req, 'deleted');

	Log.deleteOne({
		docId: req.body.docId,
		sender: req.user.department
	}, function (err) {
		if (err) {
			res.send(err);
		} else {
			res.send('deleted');
		}
	})
});

router.get('/incoming', middleware.isLoggedIn, middleware.checkNotifications, function (req, res) {
	Log.find({
		destinations: req.user.department,
		returned: false
	}, async function (err, logs) {
		if (err) {
			console.log(err);
		} else {
			logs = logs.filter(function (log) {
				return !log.statuses[log.destinations.indexOf(req.user.department)].includes('Returned') &&
					!log.statuses[log.destinations.indexOf(req.user.department)].includes('Processed') &&
					!log.approved
			});
			res.render('logbook/incoming', {
				logs: logs,
				numIncoming: await logbook.getIncomingLength(req.user.department)
			});
		}
	})
});

router.put('/incoming', middleware.isLoggedIn, function (req, res) {
	Log.findOne({
		docId: req.body.docId,
		sender: req.body.sender
	}, function (err, log) {
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
		docId: req.body.docId,
		sender: req.body.sender
	}, {
		statuses: statuses,
		returned: req.body.returned
	}, function (err, log) {
		if (err) {
			res.send(err);
		} else {
			res.send(log);
		}
	})
})

router.get('/approved', middleware.isLoggedIn, middleware.checkNotifications, function (req, res) {
	Log.find({
		sender: req.user.department,
		approved: true
	}, async function (err, logs) {
		if (err) {
			console.log(err);
		} else {
			res.render('logbook/approved', {
				logs: logs,
				numIncoming: await logbook.getIncomingLength(req.user.department)
			})
		}
	});
});

router.get('/notifications', middleware.isLoggedIn, middleware.checkNotifications, function (req, res) {
	Notification.find({
		receiver: req.user.department
	}, async function (err, notifications) {
		if (err) {
			console.log(err);
		} else {
			res.render('logbook/notifications', {
				notifications: notifications,
				numIncoming: await logbook.getIncomingLength(req.user.department)
			});
			User.findByIdAndUpdate(req.user._id, {
				notifications: []
			}, function (err, user) {
				if (err) {
					console.log(err);
				}
			});
		}
	})
});

router.get('/profile', middleware.isLoggedIn, middleware.checkNotifications, function (req, res) {
	ActivityLog.find({
		author: req.user.username
	}, async function (err, activityLogs) {
		if (err) {
			console.log(err);
		} else {
			res.render('logbook/profile', {
				activityLogs: activityLogs,
				numIncoming: await logbook.getIncomingLength(req.user.department)
			});
		}
	});
});

router.get('/profile/edit', middleware.isLoggedIn, middleware.checkNotifications, async function (req, res) {
	res.render('logbook/edit-profile', {
		numIncoming: await logbook.getIncomingLength(req.user.department)
	});
});

router.put('/profile/edit', middleware.isLoggedIn, upload.single('profilePicture'), function (req, res) {
	let newUserData = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		course: req.body.course,
		image: {
			data: req.file && req.user.profilePicture.length > 0 ? fs.readFileSync(req.file.path) : req.user.image.data,
			contentType: req.file && req.user.profilePicture.length > 0 ? req.file.mimetype : req.user.image.contentType
		},
	}
	User.findByIdAndUpdate(req.user._id, newUserData, function (err, user) {
		if (err) {
			req.flash('error', 'Something went wrong')
			res.redirect('/logbook/profile/edit');
		} else {
			if (newUserData.image.data) {
				user.imageSrc = `data:${newUserData.image.contentType};base64,${newUserData.image.data.toString('base64')}`;
				user.save();
			}
			res.redirect('/logbook/profile');
		}
	})
});

router.put('/profile/edit/picture', middleware.isLoggedIn, upload.single('profilePicture'), function (req, res) {
	let newUserData = {
		profilePicture: '/' + req.file.path,
	}
	User.findByIdAndUpdate(req.user._id, newUserData, function (err, user) {
		if (err) {
			req.flash('error', 'Something went wrong')
			res.redirect('/logbook/profile/edit');
		} else {
			res.send(newUserData);
		}
	});
});

router.put('/profile/delete/picture', middleware.isLoggedIn, function (req, res) {
	let newUserData = {
		imageSrc: req.body.imageSrc,
		profilePicture: '',
		image: {
			data: null,
			contentType: null
		}
	}
	User.findByIdAndUpdate(req.user._id, newUserData, function (err, user) {
		if (err) {
			req.flash('error', 'Something went wrong');
			res.redirect('/logbook/profile/edit');
		} else {
			res.send(newUserData);
		}
	})
})

module.exports = router;
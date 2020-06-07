let express = require("express");
let router = express.Router();
let middleware = require('../middleware');
let Log = require('../models/logbookLog');
let Department = require('../models/department');
let ActivityLog = require('../models/activityLog');

router.get("/", middleware.isLoggedIn, (req, res) => {
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

// create a log
router.post('/new', middleware.isLoggedIn, (req, res) => {
	let today = new Date()
	let day = today.getDate();
	let month = today.getMonth() + 1;
	let year = today.getFullYear();

	if (day < 10) day = '0' + day;
	if (month < 10) day = '0' + month;

	let dateString = `${month}${day}${year}`

	const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	let dueDate = req.body.dueDate;
	let date;
	let dueDateString;
	if (dueDate) {
		date = dueDate.split('-');
		dueDateString = `${months[Number(dueDate[1])]} ${date[2]}, ${date[0]}`
	} else {
		dueDateString = '-'
	}

	let logData = {
		re: req.body.re,
		docType: req.body.docType,
		dueDate: dueDateString,
		approved: false,
		returned: false
	}

	Department.findOne({
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
					log.docId = `${dateString}-${department.logs.length + 1}`
					log.destinations.push(req.body.destination1);
					log.destinations.push(req.body.destination2);
					log.destinations.push(req.body.destination3);
					log.destinations.push(req.body.destination4);
					for (let i = 0; i < 4; i++) {
						log.statuses.push('FROZEN');
					}
					log.save();
					department.logs.push(log);
					department.save();
					let activityLogData = {
						log: `${req.user.firstName} ${req.user.lastName} added a ${log.docType.length > 0 ? log.docType : 'document'} to rout (document #${log.docId}) `,
						author: req.user.username
					}
					ActivityLog.create(activityLogData, (err, activityLog) => {
						if (err) {
							req.flash('error', 'Something went wrong');
							console.log(err);
						} else {
							req.user.logs.push(activityLog);
						}
					});
					req.flash('success', 'Successfully added log');
					res.redirect('/logbook');
				}
			});
		}
	})
});

// approve a log
router.put('/', middleware.isLoggedIn, (req, res) => {
	Log.findOne({
		docId: req.body.docId
	}, (err, log) => {
		if (err) {
			console.log(err);
		} else {
			let activityLogData = {
				log: `${req.user.firstName} ${req.user.lastName} approved a ${log.docType.length > 0 ? log.docType : 'document'} (document #${log.docId}) `,
				author: req.user.username
			}
			ActivityLog.create(activityLogData, (err, activityLog) => {
				if (err) {
					console.log(err);
				} else {
					req.user.logs.push(activityLog);
				}
			});
		}
	});

	let today = new Date()
	let day = today.getDate();
	let month = today.getMonth() + 1;
	let year = today.getFullYear();

	const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	let dateString = `${months[month]} ${day}, ${year}`
	Log.updateOne({
		docId: req.body.docId
	}, {
		approved: req.body.approved,
		approvedDate: dateString
	}, (err, log) => {
		if (err) {
			res.send(err)
		} else {
			res.send(log);
		}
	})
})

router.delete('/', middleware.isLoggedIn, (req, res) => {
	Log.findOne({
		docId: req.body.docId
	}, (err, log) => {
		if (err) {
			console.log(err);
		} else {
			let activityLogData = {
				log: `${req.user.firstName} ${req.user.lastName} deleted a ${log.docType.length > 0 ? log.docType : 'document'} (document #${log.docId}) `,
				author: req.user.username
			}
			ActivityLog.create(activityLogData, (err, activityLog) => {
				if (err) {
					console.log(err);
				} else {
					req.user.logs.push(activityLog);
				}
			});
		}
	});
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

router.get('/incoming', middleware.isLoggedIn, (req, res) => {
	Log.find({
		destinations: req.user.department,
		returned: false
	}, (err, logs) => {
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
			let activityLogData = {
				log: `${req.user.firstName} ${req.user.lastName} ${req.body.status.toLowerCase()} a ${log.docType.length > 0 ? log.docType : 'document'} from ${log.sender} (document #${log.docId}) `,
				author: req.user.username
			}
			ActivityLog.create(activityLogData, (err, activityLog) => {
				if (err) {
					console.log(err);
				} else {
					req.user.logs.push(activityLog);
				}
			});
		}
	});
	let today = new Date();
	let hour = today.getHours();
	let meridian = 'am';
	if (hour > 12) {
		hour -= 12;
		meridian = 'pm'
	} else if (hour === 0) {
		hour = 12;
	}

	let statuses = req.body.statuses;
	let indices = req.body.statusIndices;
	for (let i = 0; i < indices.length; i++) {
		statuses[indices[i]] = `${req.body.status} by ${req.user.firstName} ${req.user.lastName} @${hour}${meridian}`;
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



module.exports = router;
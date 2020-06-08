let express = require("express");
let router = express.Router();
let middleware = require('../middleware');
let Log = require('../models/logbookLog');
let Department = require('../models/department');
let ActivityLog = require('../models/activityLog');
let Notification = require('../models/notification');

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

function checkLogDates(logs, userDepartment) {
	let today = new Date();
	let day = today.getDate();
	let month = today.getMonth();
	let year = today.getFullYear();
	const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	if (day < 10) day = '0' + day;

	let todayString = `${months[month]} ${day}, ${year}`;

	for (let log of logs) {
		if (log.pendingDate === todayString) {
			let notificationData = {
				receiver: log.sender,
				text: `Document #${log.docId} has been pending for 3 days`
			}
			Notification.create(notificationData, (err, notification) => {
				if (err) {
					console.log(err);
				}
			});
		}
		if (log.almostDueDate === todayString) {
			let notificationData = {
				receiver: log.sender,
				text: `Document #${log.docId} is almost due. Due date is ${log.dueDate}`
			}
			Notification.find({
				receiver: userDepartment
			}, (err, notifications) => {
				if (err) {
					console.log(err);
				} else {
					let isNotified = false;
					for (let notification of notifications) {
						if (notification.text === notificationData.text) {
							isNotified = true;
							break;
						}
					}
					if (!isNotified) {
						Notification.create(notificationData, (err, notification) => {
							if (err) {
								console.log(err);
							}
						});
					}
				}
			});

		}
	}
}

router.get("/", middleware.isLoggedIn, (req, res) => {
	Log.find({
		sender: req.user.department,
		approved: false
	}, (err, logs) => {
		if (err) {
			console.log(err);
		} else {
			checkLogDates(logs, req.user.department);
			res.render('logbook/index', {
				logs: logs
			});
		}
	});
});

router.get('/new', middleware.isLoggedIn, (req, res) => {
	Log.find({
		sender: req.user.department,
		approved: false
	}, (err, logs) => {
		if (err) {
			console.log(err);
		} else {
			checkLogDates(logs, req.user.department);
		}
	});

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
	let today = new Date()
	let day = today.getDate();
	let month = today.getMonth() + 1;
	let year = today.getFullYear();

	if (day < 10) day = '0' + day;
	if (month < 10) month = '0' + month;

	let dateString = `${month}${day}${year}`

	const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	let createdDate = `${months[month - 1]} ${day}, ${year}`;

	Date.prototype.addDays = function (days) {
		var date = new Date(this.valueOf());
		date.setDate(date.getDate() + days);
		return date;
	}

	let pendingDate = new Date();
	pendingDate = pendingDate.addDays(3);
	let pendingDateDay = pendingDate.getDate();
	let pendingDateMonth = pendingDate.getMonth() + 1;
	let pendingDateYear = pendingDate.getFullYear();

	if (pendingDateDay < 10) pendingDateDay = '0' + pendingDateDay
	if (pendingDateMonth < 10) pendingDateMonth = '0' + pendingDateMonth

	let pendingDateString = `${months[pendingDateMonth - 1]} ${pendingDateDay}, ${pendingDateYear}`;

	let dueDate = req.body.dueDate;
	let date;
	let dueDateString;
	if (dueDate) {
		date = dueDate.split('-');
		dueDateString = `${months[Number(date[1] - 1)]} ${date[2]}, ${date[0]}`
	} else {
		dueDateString = '-'
	}

	let almostDueDate = new Date(dueDateString);
	almostDueDate = almostDueDate.addDays(-1);
	let almostDueDateDay = almostDueDate.getDate();
	let almostDueDateMonth = almostDueDate.getMonth() + 1;
	let almostDueDateYear = almostDueDate.getFullYear();

	if (almostDueDateDay < 10) almostDueDateDay = '0' + almostDueDateDay
	if (almostDueDateMonth < 10) almostDueDateMonth = '0' + almostDueDateMonth

	let almostDueDateString = `${months[almostDueDateMonth - 1]} ${almostDueDateDay}, ${almostDueDateYear}`;

	let logData = {
		re: req.body.re,
		docType: req.body.docType,
		dueDate: dueDateString,
		approved: false,
		returned: false,
		createdDate: createdDate,
		pendingDate: pendingDateString,
		almostDueDate: almostDueDateString
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
					log.docId = `${dateString}-${department.logs.length + 1}`;
					let destinations = req.body.destinations
					for (let destination in destinations) {
						log.destinations.push(destinations[destination]);
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
		sender: req.user.department,
		approved: false
	}, (err, logs) => {
		if (err) {
			console.log(err);
		} else {
			checkLogDates(logs, req.user.department);
		}
	});

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

			let notificationData = {
				receiver: log.sender,
				text: `Document #${log.docId} was ${req.body.status.toLowerCase()} by ${req.user.firstName} ${req.user.lastName} from ${req.user.department}`
			}
			Notification.create(notificationData, (err, notification) => {
				if (err) {
					console.log(err);
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
		approved: false
	}, (err, logs) => {
		if (err) {
			console.log(err);
		} else {
			checkLogDates(logs, req.user.department);
		}
	});

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

router.get('/profile', middleware.isLoggedIn, (req, res) => {
	Log.find({
		sender: req.user.department,
		approved: false
	}, (err, logs) => {
		if (err) {
			console.log(err);
		} else {
			checkLogDates(logs, req.user.department);
		}
	});

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
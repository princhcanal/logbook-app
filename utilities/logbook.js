const logbook = {}
const Log = require('../models/logbookLog');
const Notification = require('../models/notification');
const ActivityLog = require('../models/activityLog');
const User = require('../models/user');
const dates = require('./dates');

logbook.addNotification = function (req, log) {
    let notificationData = {
        receiver: log.sender,
        text: `Document #${log.docId} was ${req.body.status.toLowerCase()} by ${req.user.firstName} ${req.user.lastName} from ${req.user.department}`
    }
    Notification.create(notificationData, function (err, notification) {
        if (err) {
            console.log(err);
        } else {
            User.find({
                department: log.sender
            }, function (err, users) {
                if (err) {
                    console.log(err);
                } else {
                    for (let user of users) {
                        user.notifications.push(notification.text);
                        user.save();
                    }
                }
            });
        }
    });
}

logbook.checkNotified = function (department, notificationData) {
    Notification.find({
        receiver: department
    }, function (err, notifications) {
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
                Notification.create(notificationData, function (err, notification) {
                    if (err) {
                        console.log(err);
                    } else {
                        User.find({
                            department: department
                        }, function (err, users) {
                            if (err) {
                                console.log(err);
                            } else {
                                for (let user of users) {
                                    user.notifications.push(notification.text);
                                    user.save();
                                }
                            }
                        });
                    }
                });
            }
        }
    });
}

logbook.pushNotifications = function (logs, userDepartment) {
    let today = dates.createDateString();

    for (let log of logs) {
        if (log.pendingDate === today) {
            let notificationData = {
                receiver: log.sender,
                text: `Document #${log.docId} has been pending for 3 days`
            }
            logbook.checkNotified(userDepartment, notificationData)
        }
        if (log.almostDueDate === today) {
            let notificationData = {
                receiver: log.sender,
                text: `Document #${log.docId} is almost due. Due date is ${log.dueDate}`
            }
            logbook.checkNotified(userDepartment, notificationData);
        }
    }
}

logbook.addActivityLog = function (req, log, action) {
    let activityLogData = {
        log: `${req.user.firstName} ${req.user.lastName} ${action} a ${log.docType.length > 0 ? log.docType : 'document'} ${action === 'added' ? 'to rout' : ''} (document #${log.docId}) `,
        author: req.user.username
    }
    ActivityLog.create(activityLogData, function (err, activityLog) {
        if (err) {
            req.flash('error', 'Something went wrong');
            console.log(err);
        } else {
            req.user.logs.push(activityLog);
        }
    });
}

logbook.findAndAddActivityLog = function (req, action) {
    Log.findOne({
        docId: req.body.docId,
        sender: req.user.department
    }, function (err, log) {
        if (err) {
            console.log(err);
        } else {
            logbook.addActivityLog(req, log, action);
        }
    });
}

logbook.getIncomingLength = (function () {
    // Something declared here will only be available to the function below.
    // Code here is executed only once upon the creation of the inner function
    let length = 0;
    return async function (department) {
        // Actual callback here
        await Log.find({
            destinations: department,
            returned: false,
            approved: false
        }, function (err, logs) {
            if (err) {
                console.log(err);
            } else {
                logs = logs.filter(function (log) {
                    return !log.statuses[log.destinations.indexOf(department)].includes('Returned') &&
                        !log.statuses[log.destinations.indexOf(department)].includes('Processed') &&
                        !log.approved
                });
                length = logs.length;
            }
        });
        return length;
    };
})(); // The last brackets execute the outer function

module.exports = logbook;
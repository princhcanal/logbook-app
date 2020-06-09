let logbook = {}
let Log = require('../models/logbookLog');
let Notification = require('../models/notification');
let ActivityLog = require('../models/activityLog');
let dates = require('./dates');

logbook.addNotification = function (req, log) {
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

logbook.pushNotifications = function (logs, userDepartment) {
    let today = dates.createDateString();

    for (let log of logs) {
        if (log.pendingDate === today) {
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
        if (log.almostDueDate === today) {
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

logbook.addActivityLog = function (req, log, action) {
    let activityLogData = {
        log: `${req.user.firstName} ${req.user.lastName} ${action} a ${log.docType.length > 0 ? log.docType : 'document'} ${action === 'added' ? 'to rout' : ''} (document #${log.docId}) `,
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
}

logbook.findAndAddActivityLog = function (req, action) {
    Log.findOne({
        docId: req.body.docId
    }, (err, log) => {
        if (err) {
            console.log(err);
        } else {
            logbook.addActivityLog(req, log, action);
        }
    });
}


module.exports = logbook;
let mongoose = require('mongoose');

let notificationSchema = mongoose.Schema({
    text: String,
    receiver: String
});

module.exports = mongoose.model('Notification', notificationSchema);
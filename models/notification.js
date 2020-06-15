const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    text: String,
    receiver: String
});

module.exports = mongoose.model('Notification', notificationSchema);
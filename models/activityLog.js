let mongoose = require('mongoose');

let activityLog = new mongoose.Schema({
    log: String,
    author: String
});

module.exports = mongoose.model('ActivityLog', activityLog);
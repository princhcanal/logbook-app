let mongoose = require('mongoose');

let logbookLogSchema = new mongoose.Schema({
    docId: String,
    re: String,
    docType: String,
    dueDate: String,
    destinations: [{
        type: String
    }],
    statuses: [{
        type: String
    }],
    author: String,
    sender: String,
    approved: Boolean,
    approvedDate: String,
    returned: Boolean,
    createdDate: String,
    pendingDate: String,
    almostDueDate: String
});

module.exports = mongoose.model('LogbookLog', logbookLogSchema);
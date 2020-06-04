let mongoose = require('mongoose');

let logbookLogSchema = new mongoose.Schema({
    docId: String,
    re: String,
    docType: String,
    dueDate: String,
    destination: String,
    status: String,
    author: String,
    sender: String,
    approved: Boolean,
    approvedDate: String
});

module.exports = mongoose.model('LogbookLog', logbookLogSchema);
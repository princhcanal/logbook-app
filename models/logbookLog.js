let mongoose = require('mongoose');

let logbookLogSchema = new mongoose.Schema({
    docId: String,
    re: String,
    docType: String,
    dueDate: {
        type: Date,
        default: Date.now
    },
    destination: String,
    status: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String
    }
});

module.exports = mongoose.model('LogbookLog', logbookLogSchema);
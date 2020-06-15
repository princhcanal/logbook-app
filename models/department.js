const mongoose = require('mongoose')

const departmentSchema = new mongoose.Schema({
    name: String,
    abbreviation: String,
    logs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LogbookLog'
    }]
});

module.exports = mongoose.model('Department', departmentSchema);
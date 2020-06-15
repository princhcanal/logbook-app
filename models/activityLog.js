const mongoose = require('mongoose'); // needed to interact with database

// assigns activityLog to a "Schema"
// a Schema defines what a collection (in this case, the collection is activityLog) has
// the mongoose.Schema constructor accepts a JavaScript object (similar to Python dictionaries)
// the keys of the JavaScript object are the names of the fields and the value is the data type
const activityLog = new mongoose.Schema({
    log: String,
    author: String
});

// whatever is in module.exports is what we get when we import this file
// mongoose.model allows us to use functions to interact with the database (ex. ActivityLog.find())
// we need to pass in a string that describes our model as well as our schema
module.exports = mongoose.model('ActivityLog', activityLog);
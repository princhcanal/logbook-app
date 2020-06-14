let mongoose = require("mongoose");
let passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
	firstName: String,
	lastName: String,
	username: String,
	password: String,
	accountType: String,
	department: String,
	officeHours: String,
	course: String,
	logs: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'LogbookLog'
	}],
	notifications: [{
		type: String
	}],
	profilePicture: String,
	image: {
		data: Buffer,
		contentType: String
	},
	imageSrc: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
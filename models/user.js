const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose"); // passportLocalMongoose allows us to create users easily

const userSchema = new mongoose.Schema({
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
		data: Buffer, // data type for binary
		contentType: String
	},
	imageSrc: String
});

// we need to "plugin" passportLocalMongoose in order to use its functions for our users
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
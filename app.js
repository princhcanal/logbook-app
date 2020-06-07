let express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	methodOverride = require("method-override"),
	mongoose = require("mongoose"),
	path = require("path"),
	passport = require('passport'),
	LocalStrategy = require('passport-local'),
	flash = require('connect-flash'),
	User = require('./models/user');

let indexRoutes = require("./routes/index"),
	logbookRoutes = require("./routes/logbook"),
	departmentRoutes = require('./routes/department');

app.set("port", process.env.PORT || 3000);
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname + "/public")));
app.use(flash());
app.use(methodOverride("_method"));

let db = "";
if (app.get("port") === 3000) {
	db = "mongodb://localhost:27017/logbook_app";
} else {
	db = 'mongodb://princhcanal:logbook@cluster0-shard-00-00-onyef.mongodb.net:27017,cluster0-shard-00-01-onyef.mongodb.net:27017,cluster0-shard-00-02-onyef.mongodb.net:27017/<dbname>?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority';
}
mongoose.connect(db, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});

// PASSPORT CONFIGURATION
app.use(
	require("express-session")({
		secret: "The quick brown fox jumps over the lazy dog",
		resave: false,
		saveUninitialized: false,
	})
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

if (app.get("port") === 3000) {
	let liveReload = require("livereload"),
		liveReloadServer = liveReload.createServer(),
		connectLiveReload = require("connect-livereload");
	liveReloadServer.watch(path.join(__dirname + "/public"));
	app.use(connectLiveReload());
}

app.use(indexRoutes);
app.use("/logbook", logbookRoutes);
app.use("/department", departmentRoutes);

let port = app.get("port");
let server = app.listen(port, () => {
	console.log("Logbook running on port", port);
});
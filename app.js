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
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname + "/public")));
app.use(flash());
app.use(methodOverride("_method"));
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	if (req.method === "OPTIONS") {
		res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
		return res.status(200).json({});
	}
	next();
});

let mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/logbook_app";
mongoose.connect(mongoURI, {
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
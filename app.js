let express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	methodOverride = require("method-override"),
	mongoose = require("mongoose"),
	path = require("path");

let indexRoutes = require("./routes/index"),
	logbookRoutes = require("./routes/logbook");

app.set("port", process.env.PORT || 3000);
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname + "/public")));
app.use(methodOverride("_method"));

let db = "";
if (app.get("port") === 3000) {
	db = "mongodb://localhost:27017/logbook_app";
} else {
	db =
		"mongodb://princhcanal:logbook@cluster0-shard-00-00-onyef.mongodb.net:27017,cluster0-shard-00-01-onyef.mongodb.net:27017,cluster0-shard-00-02-onyef.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";
}
mongoose.connect(db, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});

/* ! COMMENT OUT BEFORE DEPLOYMENT ! */
if (app.get("port") === 3000) {
	let liveReload = require("livereload"),
		liveReloadServer = liveReload.createServer(),
		connectLiveReload = require("connect-livereload");
	liveReloadServer.watch(path.join(__dirname + "/public"));
	app.use(connectLiveReload());
}

app.use(indexRoutes);
app.use("/home", logbookRoutes);

let port = app.get("port");
let server = app.listen(port, () => {
	console.log("Logbook running on port", port);
});

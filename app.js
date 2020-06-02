let express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	methodOverride = require("method-override"),
	path = require("path"),
	liveReload = require("livereload"),
	liveReloadServer = liveReload.createServer(),
	connectLiveReload = require("connect-livereload");

app.set("port", process.env.PORT || 3000);
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname + "/public")));
liveReloadServer.watch(path.join(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(connectLiveReload());

app.get("/", (req, res) => {
	res.render("index");
});

let port = app.get("port");
let server = app.listen(port, () => {
	console.log("Express running on port", port);
});

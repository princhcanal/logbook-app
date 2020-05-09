let express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	methodOverride = require("method-override");

app.set("port", process.env.PORT || 3000);
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
	res.render("index");
});

let server = app.listen(app.get("port"), function () {
	console.log("Express running on port", app.get("port"));
});

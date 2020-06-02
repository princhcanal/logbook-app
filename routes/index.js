let express = require("express");
let router = express.Router();

// root route
router.get("/", (req, res) => {
	res.render("login");
});

module.exports = router;

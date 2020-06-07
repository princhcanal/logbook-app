let express = require("express");
let router = express.Router();
let Deparment = require('../models/department')

router.get('/', (req, res) => {
    res.render('department/index');
});

router.post('/new', (req, res) => {
    console.log('DEPARTMENT ENTERING');
    Deparment.create({
        name: req.body.name,
        abbreviation: req.body.abbrev
    }, (err, department) => {
        if (err) {
            console.log('DEPARTMENT ERROR');
            console.log(err);
        } else {
            console.log('DEPARTMENT REDIRECT');
            res.redirect('/department');
        }
    })
})

module.exports = router;
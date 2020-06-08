let express = require("express");
let router = express.Router();
let Deparment = require('../models/department')

router.get('/', (req, res) => {
    res.render('department/index');
});

router.post('/new', (req, res) => {
    Deparment.create({
        name: req.body.name,
        abbreviation: req.body.abbrev
    }, (err, department) => {
        if (err) {
            console.log(err);
        } else {
            req.flash('success', 'Successfully created department');
            res.redirect('/department');
        }
    })
})

module.exports = router;
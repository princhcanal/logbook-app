const express = require("express");
const router = express.Router();
const Deparment = require('../models/department')

router.get('/', function (req, res) {
    res.render('department/index');
});

router.post('/new', function (req, res) {
    Deparment.create({
        name: req.body.name,
        abbreviation: req.body.abbrev
    }, function (err, department) {
        if (err) {
            console.log(err);
        } else {
            req.flash('success', 'Successfully created department');
            res.redirect('/department');
        }
    })
})

module.exports = router;
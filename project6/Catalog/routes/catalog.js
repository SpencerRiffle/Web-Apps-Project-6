var express = require('express');
var db = require('../db/database.js');
var router = express.Router();

/* Edit catalog item */
router.get('/edit/:catId', function(req, res, next) {
    console.log(req.params);
    res.render('catalog');
});

/* Delete catalog item */
router.post('/delete/:catId', function(req, res, next) {
    console.log(req.params.catId);
    res.render('catalog');
});

module.exports = router;

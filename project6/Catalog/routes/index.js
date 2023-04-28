var express = require('express');
var db = require('../db/database.js');
var router = express.Router();

// Redirects to index pug
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

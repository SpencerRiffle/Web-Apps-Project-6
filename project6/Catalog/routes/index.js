var express = require('express');
var db = require('../db/database.js');
var router = express.Router();

// Redirects to index pug
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Redirects to login pug
router.get('/login', function(req, res, next) {
  res.render('login', { title : "Login", error : ""})
});

// Redirects to login pug
router.get('/register', function(req, res, next) {
  res.render('register', { title : "Register", error : ""})
});

module.exports = router;

var express = require('express');
var router = express.Router();

// Redirects to admin pug
router.get('/', async function(req, res, next) {
  res.render('admin');
});

module.exports = router;

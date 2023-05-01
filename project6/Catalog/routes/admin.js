var express = require('express');
var router = express.Router();

// Redirects to admin pug
router.get('/', async function(req, res, next) {
  // Check permission
  if (req.session.hasOwnProperty('role')) {
    if (req.session.role == 'Admin') {
        res.render('admin');
    } else {
      res.redirect(req.headers.referer || '/login');
    }
  } else {
    res.redirect(req.headers.referer || '/login');
  }
});

module.exports = router;

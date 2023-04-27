var express = require('express');
var router = express.Router();
var UserData = require('../db/models/jss_users.js')
var bcrypt = require('bcryptjs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users');
});

/* Get data */
router.get('/get-users', function(req, res, next) {
  UserData.find()
    // Displays all items found to the page
    .then(function(doc) {
      // The first argument is the name of the pug file.
      // The 'items' gives us an object to reference for the pug file,
      // containing all of our data.
      res.render('users', {items: doc});
    });
});

/* Store data */
router.post('/insert', function(req, res, next) {
  // Same structure as the schema
  var item = {
    UserName: req.body.UserName,
    PasswordHash: Crypto.bcrypt(req.body.Password)
  };

  // Save data to database
  var data = new UserData(item);
  data.save();
  
  // Redirect to index after processing
  res.redirect('/');
});

/* Update data */
router.post('/update', function(req, res, next) {
  var id = req.body.id;

  UserData.findById(id, function(err, doc) {
    if (err) {
      console.error("error, no entry found");
    }
    doc.title = req.body.title;
    doc.content = req.body.content;
    doc.author = req.body.author;
    doc.save;
  });
});

/* Delete data */
router.post('/delete', function(req, res, next) {
  var id = req.body.id;
  UserData.findByIdAndRemove(id).exec();

  // Redirect to index after processing
  res.redirect('/');
});

module.exports = router;

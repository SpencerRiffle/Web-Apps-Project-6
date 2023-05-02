var express = require('express');
var router = express.Router();
var users = require('../db/models/jss_users.js')

/* GET login listing */
router.get('/', function(req, res, next) {
    res.render('register');
});

/* Register */
router.post('/validate', async function(req, res, next) {
    // Get data from body
    const {username, password, role} = req.body;
    // Create user
    await users.createUser(username, password, role)
    .then((user) => {
        const success = "New user created!";
        const fail = "User already exists.";
        if (user) {
            req.session.alert = success;
        } else {
            req.session.alert = fail;
        }
        res.redirect('/register');
    });
});

module.exports = router;
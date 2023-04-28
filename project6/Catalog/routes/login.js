var express = require('express');
var router = express.Router();
var users = require('../db/models/jss_users.js');
var bcrypt = require('bcrypt');

/* GET login listing */
router.get('/', function(req, res, next) {
    res.render('login');
});

/* Log in */
router.post('/validate', async function(req, res, next) {
    // Get data from body
    error = "Invalid username or password.";
    success = "Logged in";
    const {username, password} = req.body;

    // Find a matching user
    await users.validateUser(username)
    .then(async (user) => {
        if (user) {
            // Validate password
            await bcrypt.compare(password, user.PasswordHash)
            .then((isValid) => {
                if (isValid) {
                    // Render index with john's name
                    res.redirect('/?user=' + encodeURIComponent(user.UserName));
                } else {
                    res.render('login', {alert: error});
                }
            });
        } else {
            res.render('login', {alert: error});
        }
    });
});

module.exports = router;
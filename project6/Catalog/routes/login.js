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
    const error = "Invalid username or password.";
    const {username, password} = req.body;

    // Find a matching user
    await users.validateUser(username)
    .then(async (user) => {
        if (user) {
            // Validate password
            await bcrypt.compare(password, user.PasswordHash)
            .then((isValid) => {
                if (isValid) {
                    // Set user session variable
                    const sessionUser = req.session.user;
                    if (sessionUser === undefined || sessionUser !== user.UserName) {
                        req.session.user = user.UserName;
                    }
                    // Redirect to index on success
                    res.redirect('/');
                } else {
                    // Send message on fail
                    req.session.alert = error;
                    res.redirect('/login');
                }
            });
        } else {
            // Redirect to login on fail
            res.redirect('/login');
        }
    });
});

module.exports = router;
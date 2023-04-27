var express = require('express');
var router = express.Router();
var UserData = require('../db/models/jss_users.js')

/* GET login listing */
router.get('/', function(req, res, next) {
    res.render('login');
});

/* Log in */
router.post('/validate', async function(req, res, next) {
    // Get data from body
    const { username, password } = req.body;

    // Error checking
    if (!username || !password) {
        res.status(400).send("Missing username or password.");
    } else {
        // Find a matching user
        const user = await UserData.findOne({username});
        if (!user) {
            res.status(401).send("Invalid username or password.");
        } else {
            // Validate password
            const isValid = await user.validatePassword(password);
            if (!isValid) {
                res.status(401).send("Invalid username or password.");
            } else {
                // Redirect to home on success
                res.redirect('/');
            }
        }
    }
});
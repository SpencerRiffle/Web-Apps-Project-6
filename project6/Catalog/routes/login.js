var express = require('express');
var router = express.Router();
var users = require('../db/models/jss_users.js');
var plans = require('../db/models/jss_plans.js');
var bcrypt = require('bcrypt');

/* GET login listing */
router.get('/', function(req, res, next) {
    res.render('login');
});

/* Log in */
router.post('/validate', async function(req, res, next) {
    // Get data from body
    const invalidError = "Invalid username or password.";
    const dbError = "Database corrupted.";
    const {username, password} = req.body;

    // Find a matching user
    await users.validateUser(username)
    .then(async (user) => {
        if (user) {
            // Validate password
            await bcrypt.compare(password, user.PasswordHash)
            .then(async (isValid) => {
                if (isValid) {
                    // Set user session variable
                    req.session.user = user.UserName;
                    // Set plan session variable
                    plans.findOne({username: req.session.user, default: true}).exec()
                    .then((plan) => {
                        if (plan) {
                            req.session.plan = plan._id;
                            req.session.planName = plan.planName;
                            console.log("Set req.session.plan to: " + req.session.plan);
                            // Redirect to index on success
                            res.redirect('/');
                        } else {
                            req.session.alert = dbError;
                            res.redirect('/login');
                        }
                    });
                } else {
                    req.session.alert = invalidError;
                    res.redirect('/login');
                }
            });
        } else {
            // Redirect to login on fail
            req.session.alert = invalidError;
            res.redirect('/login');
        }
    });
});

module.exports = router;
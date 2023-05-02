var express = require('express');
var router = express.Router();
var users = require('../db/models/jss_users.js');
var plans = require('../db/models/jss_plans.js').plans;
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
    const roleError = "Roles corrupted.";
    const {username, password} = req.body;

    // Find a matching user
    await users.validateUser(username)
    .then(async (user) => {
        if (user) {
            // Validate password
            await bcrypt.compare(password, user.PasswordHash)
            .then(async (isValid) => {
                if (isValid) {
                    // Set user and role session variables
                    req.session.user = user.UserName;
                    const currentUser = await users.users.findOne({UserName: req.session.user}).exec()
                    .catch((error) => {
                        console.error(error);
                    });
                    req.session.role = currentUser.Role;
                    // Determine next action by role
                    switch (req.session.role) {
                        case "Admin":
                            res.redirect('/admin');
                            break;
                        case "Faculty":
                            res.redirect('/faculty');
                            break;
                        case "Student":
                            // Set plan session variable
                            plans.findOne({username: req.session.user, default: true}).exec()
                            .then((plan) => {
                                if (plan) {
                                    req.session.plan = plan._id;
                                    req.session.planName = plan.planName;
                                    res.redirect('/');
                                } else {
                                    req.session.alert = dbError;
                                    res.redirect('/login');
                                }
                            });
                            break;
                        default:
                            req.session.alert = roleError;
                            res.redirect('/login');
                    }
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
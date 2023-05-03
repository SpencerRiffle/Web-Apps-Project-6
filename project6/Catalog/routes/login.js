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
    var username = "";
    var password = "";
    var facultyPlan = "";
    if (req.session.hasOwnProperty('faculty')) {
        username = decodeURIComponent(req.body.students);
        facultyPlan = decodeURIComponent(req.body.plans);
    } else {
        username = req.body.username;
        password = req.body.password;
    }

    // Find a matching user
    const user = await users.validateUser(username);
    if (user) {
        // Validate password
        var isValid = true;
        if (!req.session.hasOwnProperty('faculty')) {
            isValid = await bcrypt.compare(password, user.PasswordHash);
        } else {
            // Logging into a student from faculty view; omit password and pass in session variables
            // Check role of person you're trying to log into to make sure it's a student!!!
            isValid = await users.users.findOne({UserName: username, Role: "Student"}).exec()
            .catch((error) => {
                console.error(error);
                req.session.destroy();
            });

            // Set facultyPlan to the student's default plan (the student is stored in isValid)
            // Set user's plans to NOT default
            const plansSetToNotDefault = await plans.find({username: username}).exec();
            if (!plansSetToNotDefault) {
                console.error("Plans not found when setting all plans to not default.");
                req.session.destroy();
            } else {
                // Iterate through results and set default to false
                await Promise.all(plansSetToNotDefault.map(async (result) => {
                    result.default = false;
                    await result.save();
                }));

                // Set user's active plan to default
                const planSetToDefault = await plans.findOne({username: username, planName: facultyPlan}).exec();
                if (!planSetToDefault) {
                    console.error("Error: Plan not found when setting default plan.");
                    req.session.destroy();
                } else {
                    planSetToDefault.default = true;
                    await planSetToDefault.save();
                }
            }
        }

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
                    req.session.faculty = req.session.user;
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
    } else {
        // Redirect to login on fail
        req.session.alert = invalidError;
        res.redirect('/login');
    }
});

module.exports = router;
var express = require('express');
var router = express.Router();
var users = require('../db/models/jss_users.js').users;
var plans = require('../db/models/jss_plans.js').plans;

// Redirects to faculty pug
router.get('/', async function(req, res, next) {

    // Get user
    const faculty = req.session.user;

    // Get all students associated with the user
    // Username: faculty
    const students = await users.findOne({ UserName: faculty })
    .populate("Student")
    .exec()
    .catch((error) => {
        console.error(error);
    });
    if (!students) {
        console.error("Error: Faculty member not found while populating faculty.");
    }
    const usernames = students.Student.map(student => ({UserName: student.UserName}));

    // Get all these student's associated plans
    const userPlans = {};
    const usernamesArray = Array.isArray(usernames) ? usernames : [usernames];
    const mappings = usernamesArray.map(async (student) => {
        const studentPlans = await plans.find({ username: student.UserName }).exec();
        userPlans[student.UserName] = studentPlans.map((plan) => plan.planName);
    });
    
    Promise.all(mappings)
    .then(() => {
        console.log(userPlans);
        res.render('faculty', {users: userPlans});
    })
    .catch((error) => {
        console.error(error);
        res.render('faculty');
    });
});

module.exports = router;

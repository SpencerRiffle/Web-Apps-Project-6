var express = require('express');
var router = express.Router();
var plans = require('../db/models/jss_plans.js').plans;

// Redirects to manage pug
router.get('/', async function(req, res, next) {

    // Get user
    const user = req.session.user;

    // Get all plans associated with the user
    const p = await plans.find({username: user}).exec();
    if (!p) {
        console.error("Error: Plans not found while populating manage.");
    }

    res.render('manage', {plans: p});
});

// Redirects to index pug with new plan
router.post('/render', async function(req, res, next) {

    // Get data
    const user = req.session.user;
    const plan = req.body.planName;
    const loadError = "Could not load plan.";

    // Get the given plan from the user
    await plans.findOne({username: user, planName: plan}).exec()
    .then((p) => {
        if (p) {
            req.session.plan = p._id;
            req.session.planName = p.planName;
            res.redirect('/');
        } else {
            req.session.alert = loadError;
            res.redirect('/manage');
        }
    });
});

module.exports = router;

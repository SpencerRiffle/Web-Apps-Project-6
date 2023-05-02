var express = require('express');
var router = express.Router();
var users = require('../db/models/jss_users.js');
var majors = require('../db/models/jss_majors.js');
var plans = require('../db/models/jss_plans.js');
var catalogCourses = require('../db/models/jss_catalogCourses.js');

// Redirects to add pug
router.get('/', async function(req, res, next) {

    // Get user
    const user = req.session.user;

    // Get all majors
    const m = await majors.majors.distinct("major").exec();
    if (!m) {
        console.error("Error: Majors not found while populating add.");
    }

    // Get all catalog years
    const y = await catalogCourses.distinct("catalogYear").exec();
    if (!y) {
        console.error("Error: Catalog years not found while populating add.");
    }

    res.render('add', {majors: m, years: y});
});

// Redirects to index pug with new plan
router.post('/add', async function(req, res, next) {

    // Get data
    const user = req.session.user;
    const plan = req.body.planName;
    const catYear = req.body.catYear;
    const planMajors = req.body.majors;
    const planDefault = (req.body.default !== undefined) ? true : false;

    // Create plan
    const planId = await plans.createPlan(user, plan, catYear, planDefault)
    .then((result) => {
        const fail = "Plan already exists.";
        if (!result) {
            req.session.alert = fail;
        }
        return result;
    })
    .catch((error) => {
        console.error(error);
    });

    // Create each major entry for plan
    const majorIds = await majors.addMajors(user, plan, planId, planMajors)
    .then((result) => {
        const fail = "Major(s) already exist(s).";
        if (!result) {
            req.session.alert = fail;
        }
        return result;
    })
    .catch((error) => {
        console.error(error);
    });

    // Fill major array in for plan
    const linkPlan = await plans.plans.findById(planId).exec()
    .catch((error) => {
        console.error(error);
    });

    const finalResult = await linkPlan.linkMajors(majorIds)
    .then((result) => {
        const success = "New plan created!";
        const fail = "Plan could not be created.";
        if (result) {
            req.session.alert = success;
        } else {
            req.session.alert = fail;
        }
        return result;
    })
    .catch((error) => {
        console.error(error);
    });
   
   res.redirect('/');
});

module.exports = router;

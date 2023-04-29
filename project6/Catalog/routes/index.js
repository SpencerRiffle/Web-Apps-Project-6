var express = require('express');
var router = express.Router();
var users = require('../db/models/jss_users.js');
var plans = require('../db/models/jss_plans.js');
var majors = require('../db/models/jss_majors.js');
var courses = require('../db/models/jss_courses.js');

// Redirects to index pug
router.get('/', async function(req, res, next) {

  // Get variables
  const user = req.session.user;
  const currentPlan = req.session.plan;
  const date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var term;

  // Get term
  if (month === 12 || month <= 2) {
    term = "Winter";
  } else if (month >= 3 && month <= 5) {
    term = "Spring";
  } else if (month >= 6 && month <= 8) {
    term = "Summer";
  } else {
    term = "Fall";
  }

  // Set user's plans to NOT default
  plans.find({username: user}).exec()
  .then((results) => {
      if (!results) {
          console.error("Plans not found.");
      } else {
          // Iterate through results and set default to false
          for (var i = 0; i < results.length; i++) {
              results[i].default = false;
              results[i].save();
          }
      }
  })

  // Set user's active plan to default
  .then(() => {
    plans.findOne({username: user, planName: currentPlan}).exec()
    .then((result) => {
      if (!result) {
          console.error("Error: Plan not found.");
      } else {
          result.default = true;
          result.save();
      }
    });
  })

  // Get default plan's majors
  const planMajors = await plans.findOne({username: user, default: true})
  .populate({
    path: "major",
    model: majors
  }).select("majors").exec()

  if (!planMajors) {
    console.error("Error: Plan not found.");
    return;
  }

  // Log results
  console.log(planMajors);
  console.log("Printing individual majors...");
  for (let i = 0; i < planMajors.major.length; i++) {
    console.log(planMajors.major[i].major);
  }

  // Render the page
  res.render('index');
});

module.exports = router;

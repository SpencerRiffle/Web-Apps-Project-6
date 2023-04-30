var express = require('express');
var router = express.Router();
var plans = require('../db/models/jss_plans.js');
var majors = require('../db/models/jss_majors.js');
var courses = require('../db/models/jss_courses.js');
var planCourses = require('../db/models/jss_planCourses.js');
var catalogCourses = require('../db/models/jss_catalogCourses.js');

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
  console.log("Session user: " + user + "\nSession plan: " + currentPlan);

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
  await plans.find({username: user}).exec()
  .then((results) => {
      if (!results) {
          console.error("Plans not found when setting all plans to not default.");
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
    plans.findOne({username: user, _id: currentPlan}).exec()
    .then((result) => {
      if (!result) {
          console.error("Error: Plan not found when setting default plan.");
      } else {
          result.default = true;
          result.save();
      }
    });
  })

  // Get default plan's majors
  // Use planMajors.majors[i].major to get the actual major name(s)
  const planMajors = await plans.findOne({_id: currentPlan})
  .populate({
    path: "major",
    model: majors
  }).select("majors").exec();
  if (!planMajors) {
    console.error("Error: Plan not found for planMajors.");
  }

  // Get default plan's catalog year
  // Use planCatYear.catYear
  const planCatYear = await plans.findOne({_id: currentPlan}).select("catYear").exec();
  if (!planCatYear) {
    console.error("Error: Plan not found for planCatYear.");
  }

  // Get all courses from its catalog
  /*
  const cc = await catalogCourses.find({})
  .populate({
    path: "course",
    model: courses
  }).exec()
  .catch((error) => {
    console.error(error);
  });

  console.log(cc);
  */

  // Get all courses for the actual plan
  // Populate to fill in JOIN collections
  // FILTER THE RESULT to get what you want afterwards
  // ...otherwise, we get ALL the fields from the original collection
  var planPlanCourses = "";
  const pc = await planCourses.find({})
  .populate({
    path: "course",
    model: courses
  })
  .populate({
    path: "plan",
    model: plans
  }).exec()
  .catch((error) => {
    console.error(error);
  });

  if (!pc) {
    console.error("Error: Courses not found for planCourses.");
  } else {
    // "Where" statement
    planPlanCourses = pc.filter((item) => {
      return item.plan._id == currentPlan;
    })
    // "Select" statement
    .reduce((result, { year, term, course }) => {
      // collection[what goes on the outside] = {what, goes, inside}
      // Example: 'CS-1220': { year: 2021, term: 'Fall', courseId: 'CS-1220' }
      result[course.courseId] = { year, term, courseId: course.courseId };
      return result;
    }, {});
  }

  // Return a JSON object with all this info combined that some js function can use in /indexFunctions.js
  // Maybe just directly call that function


  // Render the page
  res.render('index');
});

module.exports = router;

var express = require('express');
var router = express.Router();
var plans = require('../db/models/jss_plans.js').plans;
var majors = require('../db/models/jss_majors.js').majors;
var courses = require('../db/models/jss_courses.js');
var planCourses = require('../db/models/jss_planCourses.js');
var catalogCourses = require('../db/models/jss_catalogCourses.js');
var requirements = require('../db/models/jss_requirments.js');
var notes = require('../db/models/jss_notes.js');

// Redirects to index pug
router.get('/', async function (req, res, next) {
  // Check permission
  if (req.session.hasOwnProperty('role')) {
    if (req.session.role == 'Student') {
      res.render('index');
    } else {
      res.redirect(req.headers.referer || '/login');
    }
  } else {
    res.redirect(req.headers.referer || '/login');
  }
});

// GetCombined
router.get('/getCombined', async function (req, res, next) {
  // Get variables
  const user = req.session.user;
  const currentPlan = req.session.plan;
  const currentPlanName = req.session.planName;
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
  const plansSetToNotDefault = await plans.find({ username: user }).exec();
  if (!plansSetToNotDefault) {
    console.error("Plans not found when setting all plans to not default.");
  } else {
    // Iterate through results and set default to false
    await Promise.all(plansSetToNotDefault.map(async (result) => {
      result.default = false;
      await result.save();
    }));
  }

  // Set user's active plan to default
  const planSetToDefault = await plans.findOne({ username: user, _id: currentPlan }).exec();
  if (!planSetToDefault) {
    console.error("Error: Plan not found when setting default plan.");
  } else {
    planSetToDefault.default = true;
    await planSetToDefault.save();
  }

  // Get default plan's majors
  var planMajors = [];
  const m = await plans.findOne({ _id: currentPlan })
    .populate({
      path: "major",
      model: majors
    }).select("majors").exec();
  if (!m) {
    console.error("Error: Plan not found for planMajors.");
  }

  for (var i = 0; i < m.major.length; i++) {
    planMajors[i] = m.major[i].major;
  }

  // Get default plan's catalog year
  const planCatYear = await plans.findOne({ _id: currentPlan }).select("catYear").exec();
  if (!planCatYear) {
    console.error("Error: Plan not found for planCatYear.");
  }

  // Get all courses from its catalog
  var planCatalogCourses = "";
  const cc = await catalogCourses.find({ catalogYear: planCatYear.catYear })
    .populate({
      path: "course",
      model: courses
    }).exec()
    .catch((error) => {
      console.error(error);
    });

  if (!cc) {
    console.error("Error: Courses not found for catalogCourses.");
  }
  else {
    // "Select" statement
    planCatalogCourses = cc.reduce((result, { course }) => {
      result[course.courseId] = {
        id: course.courseId,
        name: course.name,
        credits: course.credits,
        description: course.description
      };
      return result;
    }, {});
  }

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
        result[course.courseId] = {
          year,
          term,
          courseId: course.courseId
        };
        return result;
      }, {});
  }

  // Return a JSON object with all this info combined
  const getCombined = JSON.stringify({
    plan: {
      catYear: planCatYear.catYear,
      courses: planPlanCourses,
      currTerm: term,
      currYear: year.toString(),
      majors: planMajors,
      name: currentPlanName,
      student: user
    },
    catalog: {
      courses: planCatalogCourses,
      year: planCatYear.catYear
    }
  });

  res.json(getCombined);
});

router.get('/getNotes', async function (req, res, next){
  let planId = req.session.plan;
  const sNotes = await notes.findOne({plan: planId, role: "Student"}).exec()
  .catch((error) => {
    console.error(error);
  });
  const fNotes = await notes.findOne({plan: planId, role: "Faculty"}).exec()
  .catch((error) => {
    console.error(error);
  });
  let s = sNotes.data;
  let f = fNotes.data;
  res.json({s, f});
});


router.post('/save', async function (req, res, next) {
  let planId = req.session.plan;
  let sN = req.body.studentNotes;
  let fN = req.body.facultyNotes;
  let cL = req.body.changeLog;

  cL = cL.slice(0, -2);

  //clean change Log
  //each line of change log
  if (cL) {
    cL.split(",").forEach(async function (line) {
      //each part of the line( only care about first three)
      let parts = line.split(" ");
      let cIDFromLog = parts[2];

      if (parts[1] != "courseName") {//DEL logs that come from adding course from accordion or course finder are throw-away      
        let termYear = parts[1];
        let termRx = /[A-Z, a-z]+/;
        let yearRx = /\d+/;
        let termNew = termYear.match(termRx);
        let yearNew = termYear.match(yearRx);

        //find mongo course Id
        const cID = await courses.findOne({ courseId: cIDFromLog }).exec()
          .catch((error) => {
            console.error(error);
          });
        let courseString = cID._id.toString();

        //for ADD logs
        if (parts[0] == "ADD") {
          var item = {
            year: yearNew[0],
            term: termNew[0],
            course: courseString,
            plan: planId
          }

          var data = new planCourses(item);
          await data.save();
        }

        else if (parts[0] == "DEL") {
          let del = await planCourses.findOneAndDelete({ plan: planId, course: courseString }).exec()
            .catch((error) => {
              console.error(error);
            });
        }
        else {
          console.log("error finding parts");
        }
      }
    });
  }

  //save student Notes
  // Find the document
  const notesResult = await notes.findOne({plan: planId, role: "Student"}).exec()
  .catch((error) => {
    console.error(error);
    return;
  });

  if (!notesResult){
    let item = {
      plan: planId,
      role: "Student",
      data: sN
    }

    let sData = new notes(item);
    await sData.save();
  }
  else{
    const notesResult = await notes.findOneAndUpdate({plan: planId, role: "Student"}, { $set: {data: sN} }).exec()
    .catch((error) => {
      console.error(error);
      return;
    });

  }

  //save fac notes
  if (req.session.hasOwnProperty('faculty')) {
    // Find the document
    const facResult = await notes.findOne({ plan: planId, role: "Faculty" }).exec()
      .catch((error) => {
        console.error(error);
        return;
      });

    if (!facResult) {
      let item = {
        plan: planId,
        role: "Faculty",
        data: fN
      }

      let fData = new notes(item);
      await fData.save();
    }
    else {
      const facResult = await notes.findOneAndUpdate({ plan: planId, role: "Faculty" }, { $set: { data: fN } }).exec()
        .catch((error) => {
          console.error(error);
          return;
        });

    }
  }
  res.redirect("/");
});

// GetRequirments
router.get('/getRequirments', async function (req, res, next) {
  // Get variables
  const user = req.session.user;
  const plnID = req.session.plan;

  //Get major ids and name from current plan 
  // Get default plan's majors
  var currMajor = [];
  const m = await plans.findOne({ _id: plnID })
    .populate({
      path: "major",
      model: majors
    }).select("majors").exec();
  if (!m) {
    console.error("Error: Plan not found for planMajors.");
  }

  for (var i = 0; i < m.major.length; i++) {
    currMajor[i] = m.major[i].major;
  }
  var specReqs;
  var groupedReq = [];
  for (let i = 0; i < currMajor.length; i++) {
    specReqs = await requirements.find({ major: currMajor[0] })
      .populate({
        path: "course",
        model: courses
      }).exec();
    groupedReq.push(specReqs);
  }
  uniqueSpecReqs = specReqs.filter(req => !Array.isArray(req.course));

  var core = [];
  var electives = [];
  var cognates = [];
  var genEds = [];
  for (item of uniqueSpecReqs) {
    if (item.type == "cognate") {
      cognates.push(item.course.courseId);
    } else if (item.type == "elective") {
      electives.push(item.course.courseId);
    } else if (item.type == "core") {
      core.push(item.course.courseId);
    } else if (item.type == "gen-ed") {
      genEds.push(item.course.courseId);
    }
  }

  const getCombined = JSON.stringify({
    categories: {
      Core: core,
      Electives: electives,
      Cognates: cognates,
      GenEds: genEds
    }
  });


  res.json(getCombined);
});

module.exports = router;

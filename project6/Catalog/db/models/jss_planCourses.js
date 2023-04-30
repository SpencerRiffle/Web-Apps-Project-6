const mongoose = require('mongoose');
const db = require('../database.js');

// Set the parameters of what a queried model should have
const planCourseSchema = new mongoose.Schema({
    plan: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "plans"},
    course: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "courses"},
    year: {type: Number, required: true},
    term: {type: String, required: true}
}, {collection: "jss_plan_course"});

// Set the usable model for querying
const planCourses = db.model('planCourses', planCourseSchema);

// Export the object
// Make sure to export static functions as well
module.exports = planCourses;
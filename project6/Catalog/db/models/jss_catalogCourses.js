const mongoose = require('mongoose');
const db = require('../database.js');

// Set the parameters of what a queried model should have
const catalogCourseSchema = new mongoose.Schema({
    catalogYear: {type: Number, required: true},
    course: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "courses"},
},
{
    collection: "jss_catalog_course",
    versionKey: false
});

// Set the usable model for querying
const catalogCourses = db.model('catalogCourses', catalogCourseSchema);

// Export the object
// Make sure to export static functions as well
module.exports = catalogCourses;
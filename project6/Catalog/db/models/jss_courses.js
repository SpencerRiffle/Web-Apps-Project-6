const mongoose = require('mongoose');
const db = require('../database.js');

// Set the parameters of what a queried model should have
const courseSchema = new mongoose.Schema({
    courseId: {type: String, required: true},
    name: {type: String, required: true},
    credits: {type: Number, required: true},
    description: {type: String, required: true}
},
{
    collection: "jss_course",
    versionKey: false
});

// Set the usable model for querying
const courses = db.model('courses', courseSchema);

// Export the object
// Make sure to export static functions as well
module.exports = courses;
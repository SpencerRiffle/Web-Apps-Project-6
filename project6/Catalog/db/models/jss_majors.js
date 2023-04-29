const mongoose = require('mongoose');
const db = require('../database.js');

// Set the parameters of what a queried model should have
const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    planName: {type: String, required: true},
    plan: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "plans"},
    major: {type: String, required: true}
}, {collection: "jss_major"});

// Set the usable model for querying
const majors = db.model('majors', userSchema);

// Export the object
// Make sure to export static functions as well
module.exports = majors;
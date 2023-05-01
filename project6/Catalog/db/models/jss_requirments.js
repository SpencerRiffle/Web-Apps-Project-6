const mongoose = require('mongoose');
const db = require('../database.js');

// Set the parameters of what a queried model should have
const requirementsSchema = new mongoose.Schema({
    major: {type: String, required: true},
    catalogYear: {type: Number, required: true},
    course: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "courses"},
    type: {type: String, required: true}
}, {collection: "jss_requirment"});

// Set the usable model for querying
const requirements = db.model('requirements', requirementsSchema);

// Export the object
// Make sure to export static functions as well
module.exports = requirements;
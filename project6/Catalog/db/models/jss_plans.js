const mongoose = require('mongoose');
const db = require('../database.js');

// Set the parameters of what a queried model should have
const planSchema = new mongoose.Schema({
    catYear: {type: Number, required: true},
    default: {type: Number, required: true},
    major: [{type: mongoose.Schema.Types.ObjectId, required: true, ref: "majors"}],
    planName: {type: String, required: true},
    username: {type: String, required: true}
}, {collection: "jss_plan"});

// Set the usable model for querying
const plans = db.model('plans', planSchema);

// Export the object
// Make sure to export static functions as well
module.exports = plans;
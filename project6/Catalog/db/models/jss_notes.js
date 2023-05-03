const mongoose = require('mongoose');
const db = require('../database.js');

// Set the parameters of what a queried model should have
const noteSchema = new mongoose.Schema({
    plan: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "plans"},
    role: {type: String, required: true},
    data: {type: String, required: true}
},
{
    collection: "jss_notes",
    versionKey: false
});

// Set the usable model for querying
const notes = db.model('notes', noteSchema);

// Export the object
// Make sure to export static functions as well
module.exports = notes;
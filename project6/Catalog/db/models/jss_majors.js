const mongoose = require('mongoose');
const db = require('../database.js');

// Set the parameters of what a queried model should have
const majorSchema = new mongoose.Schema({
    username: {type: String, required: true},
    planName: {type: String, required: true},
    plan: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "plans"},
    major: {type: String, required: true}
},
{ 
    collection: "jss_major",
    versionKey: false 
});

// Set the usable model for querying
const majors = db.model('majors', majorSchema);

// Create majors for a plan
majorSchema.static('addMajors', async function(user, planName, planId, planMajors) {
    // Validate input
    const existingMajor = await majors.findOne({plan: planId, major: { $in: planMajors }}).exec();
    if (existingMajor) {
        return null;
    } else {
        // Create object to insert
        var newMajors = [];
        const majorsArray = Array.isArray(planMajors) ? planMajors : [planMajors];
        await Promise.all(majorsArray.map(async (m) => {
            const major = new majors({
              username: user,
              planName: planName,
              plan: planId,
              major: m
            });
            await major.save();
            newMajors.push(major._id);
          }));
        return newMajors;
    }
});

// Export the object
// Make sure to export static functions as well
module.exports = {
    majors,
    addMajors: majorSchema.statics.addMajors
};
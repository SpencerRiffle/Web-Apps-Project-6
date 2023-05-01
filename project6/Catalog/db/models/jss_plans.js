const mongoose = require('mongoose');
const db = require('../database.js');

// Set the parameters of what a queried model should have
const planSchema = new mongoose.Schema({
    catYear: {type: Number, required: true},
    default: {type: Number, required: true},
    major: [{type: mongoose.Schema.Types.ObjectId, required: true, ref: "majors"}],
    planName: {type: String, required: true},
    username: {type: String, required: true}
}, 
{
    collection: "jss_plan",
    versionKey: false
});

// Create a new plan
// Does NOT populate majors
planSchema.static('createPlan', async function(username, planName, catYear, isDefault) {
    // Validate input
    const existingPlan = await plans.findOne({planName: planName}).exec();
    if (existingPlan) {
        return null;
    } else {
        // Create object to insert
        const plan = new plans({
            catYear: catYear,
            default: isDefault,
            major: [],
            planName: planName,
            username: username
        });
        await plan.save();
        return plan._id;
    }
});

planSchema.method('linkMajors', async function(majorIds) {
    // Validate input
    const existingPlan = await plans.findOne({planName: this.planName}).exec();
    if (!existingPlan) {
        return null;
    } else {
        // Populate major array
        const majorsArray = Array.isArray(majorIds) ? majorIds : [majorIds];
        this.major = majorsArray;
        await this.save();
        return this;
    }
});

// Set the usable model for querying
const plans = db.model('plans', planSchema);

// Export the object
// Make sure to export static functions as well
module.exports = {
    plans,
    createPlan: planSchema.statics.createPlan,
    linkMajors: planSchema.methods.linkMajors
};
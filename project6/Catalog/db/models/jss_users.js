const mongoose = require('mongoose');
const db = require('../database.js');
const bcrypt = require('bcrypt');

// Set the parameters of what a queried model should have
const userSchema = new mongoose.Schema({
    UserName: {type: String, required: true},
    PasswordHash: {type: String, required: true}
}, {collection: "users"});

// Set the usable model for querying
const users = db.model('users', userSchema);

// Get an existing user by name
userSchema.static('validateUser', async function(username) {
    const user = await users.findOne({UserName: username}).exec();
    return user;
});

// Create a new user
userSchema.static('createUser', async function(username, password) {
    // Validate input
    const existingUser = await users.findOne({UserName: username}).exec();
    if (existingUser) {
        return existingUser;
    } else {
        // Create object to insert
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(password, salt);
        const user = new users({
            UserName: username,
            PasswordHash: hash
        });
        await user.save();
        return user;
    }
});

// Export the object
// Make sure to export static functions as well
module.exports = { 
    users, 
    validateUser: userSchema.statics.validateUser,
    createUser: userSchema.statics.createUser
};
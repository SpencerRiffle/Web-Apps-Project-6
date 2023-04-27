const mongoose = require('mongoose');

// Set the parameters of what a queried model should have
const userDataSchema = new mongoose.Schema({
    UserName: {type: String, required: true},
    PasswordHash: {type: String, required: true}
}, {collection: "users"})

// Set the usable model for querying
const UserData = mongoose.model('UserData', userDataSchema);

module.exports = UserData;
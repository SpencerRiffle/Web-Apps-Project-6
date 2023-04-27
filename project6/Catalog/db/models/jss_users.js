const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Set the parameters of what a queried model should have
const userDataSchema = new mongoose.Schema({
    UserName: {type: String, required: true},
    PasswordHash: {type: String, required: true}
}, {collection: "users"})

userDataSchema.methods.validatePassword = async function(password) {
    return bcrypt.compare(password, this.PasswordHash);
}

// Set the usable model for querying
const UserData = mongoose.model('UserData', userDataSchema);

module.exports = UserData;
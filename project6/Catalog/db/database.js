const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://163.11.238.215:27017/project6',
    {
        useNewUrlParser: true
    }
);

// Check connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function() {
    console.log("Connected successfully");
});

module.exports = db;
var express = require('express');
var router = express.Router();
var users = require('../db/models/jss_users.js')

/* GET login listing */
router.get('/', function(req, res, next) {
    res.render('register');
});

/* Register */
router.post('/validate', async function(req, res, next) {
    // Get data from body
    const {username, password, retypedPassword} = req.body;
    // Create user
    const user = await users.createUser(username, password);
    if (user) {
        res.render('register', {alert: "New user created!"});
    } else {
        res.render('register', {alert: user});
    }
});

module.exports = router;
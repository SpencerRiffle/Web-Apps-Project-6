var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var generator = require('crypto');

// NEW DIRECTORIES
// Make sure to add to APP.USE below
var indexRouter = require('./routes/index');
var facultyRouter = require('./routes/faculty');
var adminRouter = require('./routes/admin');
var loginRouter = require('./routes/login');
var registerRouter = require('./routes/register');
var manageRouter = require('./routes/manage');
var addRouter = require('./routes/add');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Generate session key
const key = generator.randomBytes(32).toString('hex');

// Set up session
app.use(session({
  secret: key,
  resave: false,
  saveUninitialized: true
}));

// Retrieve session variable (for client use)
app.get('/session', (req, res) => {
  res.json({ data: req.session });
});

// Remove session variable (for client use)
app.get('/session/remove', (req, res) => {
  const key = req.query.key;
  delete req.session[key]; 
  req.session.save();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Handle authentication
const auth = (req, res, next) => {
  const sessionUser = req.session.user;
  if (sessionUser || req.path.startsWith('/login') || req.path.startsWith('/register')) {
    next();
  } else {
    res.redirect('/login');
  }
};
app.use(auth);

// USE DIRECTORIES
// Make sure to add an entry in /routes
// index.js holds the default '/' directory, so include all other routes there
// If you're getting weird errors about the path, chances are it only works without adding it
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// THIS WON'T WORK UNLESS YOU EXPORT THE ROUTER IN YOUR .js FILE
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.use('/', indexRouter);
app.use('/faculty', facultyRouter);
app.use('/admin', adminRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/manage', manageRouter);
app.use('/add', addRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

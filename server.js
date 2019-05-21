// set up ======================================================================
// get all the tools needed
var express = require('express');
var app = express();
var port = process.env.PORT || 80;
var mongojs = require('mongojs');
var dbUsers = mongojs('workOrderApp', ['Users']);
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var path = require('path');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var configDB = require('./config/database.js');
var configJobsDB = require('./config/jobs_db.js');

// configuration ===============================================================
//mongoose.connect(dbUsers); // connect to our database
//mongoose.connect('mongodb://localhost/dbUseres');
require('./config/passport')(passport); // pass passport for configuration


// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({ extended: true })); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// Set Static path
app.use(express.static(path.join(__dirname, 'public')));

// Global vars
app.use(function(req,res,next){
	res.locals.errors = null;
	next();
});

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.') , root    = namespace.shift() , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// required for passport
//app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
// Changed to remove deprecated waring for not having 'resave: true, saveUninitialized: true' 
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch31',
    //name: cookie_name,
    //store: sessionStore, // connect-mongo session store
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('Listening on port ' + port);
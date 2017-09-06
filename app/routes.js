// Should probably be moved
// Needed for Jobs table in mongoDB
var mongojs = require('mongojs');
var db = mongojs('workOrderApp', ['Jobs']);
var rh = require('../config/rowHandler.json');
var testID = require('../config/test.js');
var ObjectId = require("mongodb").ObjectId;

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    console.log('signup');
    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            title : 'Profile',
            user : req.user // get the user out of session and pass to template
        });
    });

    // Add new job
    app.get('/createJob', isLoggedIn, function(req, res){
        db.Jobs.find(function (err, docs) {
        // docs is an array of all the documents in mycollection
            res.render('newJob', {
                title: 'Jobs',
                jobs: docs,
                user: req.user._id
            });
        });
        
    });

    // Table of jobs in workOrderApp collection
    app.get('/tables', isLoggedIn, function(req, res){
        db.Jobs.find({ user : req.user._id }).toArray(function(err, docs){ //Find all the jobs from the logged in user
            console.log(testID);
            res.render('tables', {
                title: 'Tables',
                jobs: docs,
            });
        });
    });

    //Edit Job 
    app.post('/tables/edit', isLoggedIn, function(req, res){
        db.Jobs.find({ _id : ObjectId(req.body.editID) }).toArray(function(err,docs){
            console.log(docs);
            res.render("editJob", {
                title : 'Edit',
                job: docs
            });
        });
    });

    // Filter based on selection
    app.post('/jobs/filter', function(req, res){
        if(req.body.sort_selection == 'All'){  //Reload the table with all the users jobs on empty filter sort_selection
            db.Jobs.find({ 'user' : req.user._id }).toArray(function(err,docs){
                res.render('tables', {
                    title : 'Tables',
                    jobs: docs
                });
            });
        } else{ //Get users filter selection from page body
            db.Jobs.find({ 'user' : req.user._id, 'job_location' : req.body.sort_selection }).toArray(function(err, docs){
                res.render('tables', {
                    title: 'Tables',
                    jobs: docs
                });
            });
        }
        
    });

    // Update Job
    app.post('/jobs/update', isLoggedIn, function(req, res){
        console.log(req.body.editID);

        var newJob = {
        job_id: req.body.job_id,
        job_location: req.body.job_location,
        job_description: req.body.job_description,
        job_notes: req.body.job_notes,
        job_date: new Date(), //Get the date on the fly
        user: req.user._id //Add user info to mongoDB for showing only data that this user has added in the table.ejs page
        };

        //Add job to MongoDB
        var myquery = { _id : ObjectId(req.body.editID) };
        var collection = db.collection('jobs');
        //var newInfo = { $set : {job_notes : req.body.job_notes} };
        collection.update(myquery, { $set: newJob }, function(err, result) {
            if (err) throw err;
            console.log(myquery);
            console.log(result);
        });
        res.redirect('/tables');
        console.log(newJob);
    });
    
    // Add new job
    app.post('/jobs/add', isLoggedIn, function(req, res){

        // Make sure fields are not empty
        req.checkBody('job_id', 'Job Id is required ').notEmpty();
        req.checkBody('job_location', 'Job Location is required ').notEmpty();
        req.checkBody('job_description', 'Job Description is required ').notEmpty();
        req.checkBody('job_notes', 'Job Notes is required ').notEmpty();

        // Check for errors
        var errors = req.validationErrors(); //errors made avaible in server.js 'gloabal variables'
        var user = req.user._id;
        var date = new Date();
        db.Jobs.find(function (err, docs) {
            if(errors){
                console.log('ERRORS');
                res.render('index', {
                    title: 'Jobs',
                    jobs: docs,
                    user: user,
                    errors: errors
            });
            // If no errors create new job
            } else {
                var newJob = {
                    job_id: req.body.job_id,
                    job_location: req.body.job_location,
                    job_description: req.body.job_description,
                    job_notes: req.body.job_notes,
                    job_date: date, //Get the date on the fly
                    user: user //Add user info to mongoDB for showing only data that this user has added in the table.ejs page
                };
                //Add job to MongoDB
                db.Jobs.insert(newJob, function(err, result){
                    if(err){
                        console.log(err);
                    }
                    res.redirect('/tables');
                });
            }
            console.log(newJob);
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
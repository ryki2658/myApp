// Should probably be moved
// Needed for mongoDB
var mongojs = require('mongojs');
var db = mongojs('workOrderApp', ['Jobs']);
var db1 = mongojs('workOrderApp', ['pickup']);
var db2 = mongojs('workOrderApp', ['equipLoc']);
var fDate = require('../config/formatDate.js');
var ObjectId = require("mongodb").ObjectId;
var favicon = require('express-favicon');

module.exports = function(app, passport) {

    //favicon
    app.use(favicon(__dirname + '/public/favicon.ico'));

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

    // =====================================
    // EQUIPMENT SECTION ===================
    // =====================================
    //Equipment location
    app.get('/equipLoc', isLoggedIn, function(req, res){
        db2.equipLoc.find(function(err, docs){
            res.render('equipLoc', {
                title: 'Location',
                equipment: docs,
                user: req.user
            });
        });
    });

    app.post('/equipLoc/edit', isLoggedIn, function(req, res){
        db2.equipLoc.find({ _id : ObjectId(req.body.editID) }).toArray(function(err,docs){
            res.render("editEquipmentLoc", {
                title : 'Edit',
                equipLoc: docs,
                user : req.user
            });
        });
    });

    // Update equipment
    app.post('/equipLoc/update', isLoggedIn, function(req, res){
        // Get formated date
        var date = fDate.formatDate();

        var newEquipLocDetails = {
            equipment: req.body.equipment,
            equipment_location: req.body.equipment_location,
            equipment_details: req.body.equipment_details,
            equipment_date: date
        };

        //Add newEquipLoc to MongoDB
        var myquery = { _id : ObjectId(req.body.editID) };
        var collection = db.collection('equipLoc');
        //var newInfo = { $set : {job_notes : req.body.job_notes} };
        collection.update(myquery, { $set: newEquipLocDetails }, { safe:true}, function(err, result) {
            if (err) throw err;
        });
        res.redirect('/equipLoc');
    });

    // Add new equipment input page
    app.get('/createEquipment', isLoggedIn, function(req, res){
        db2.equipLoc.find(function (err, docs) {
            if (err) {
                throw err;
            }
            res.render('newEquip', {
                title: 'New Equipment',
                equipment: docs,
                user: req.user
            });
        });        
    });

    // Add new equipment
    app.post('/equipment/add', isLoggedIn, function(req, res){

        // Check for errors
        var errors = req.validationErrors(); //errors made avaible in server.js 'gloabal variables'
        var user = req.user._id;
        var date = new Date();
        db.equipLoc.find(function (err, docs) {
            if(errors){
                console.log('ERRORS');
                res.render('index', {
                    title: 'Jobs',
                    equipment: docs,
                    user: user,
                    errors: errors
                });
            } else {
                // Get formated date
                var date = fDate.formatDate();
                var newEquip = {
                    equipment: req.body.equipment,
                    equipment_location: req.body.equipment_location,
                    equipment_details: req.body.equipment_details,
                    equipment_date: date, //Get the date on the fly
                    user: user //Add user info to mongoDB for showing only data that this user has added in the table.ejs page
                };
                //Add to MongoDB
                db2.equipLoc.insert(newEquip, function(err, result){
                    if(err){
                        console.log(err);
                    }
                    res.redirect('/equipLoc');
                });
            }
        });
    });
    // =====================================
    // PICKUP SECTION ======================
    // =====================================
    //Pickup
    app.get('/pickup', isLoggedIn, function(req, res){
        db1.pickup.find(function(err, docs){
            res.render('pickup', {
                title: 'Pickup',
                items: docs,
                user: req.user
            });
        });
    });

    app.post('/pickup/edit', isLoggedIn, function(req, res) {
        db1.pickup.find({ _id : ObjectId(req.body.editID) }).toArray(function(err, docs) {
            console.log(req.body.editID);
            res.render('editPickup', {
                title : 'Edit',
                items : docs,
                user : req.user
            });
        });
    });

    //Update pickup item
    app.post('/pickup/update', isLoggedIn, function(req, res) {

        var newPickup = {
            location : req.body.pickup_location,
            details : req.body.pickup_details,
            paid : req.body.pickup_paid
        };
        //Add new pickup item to DB
        var myquery = { _id : ObjectId(req.body.editID) };
        var collection = db.collection('pickup');
        collection.update(myquery, {$set: newPickup}, { safe:true}, function(err, result) {
            if (err) throw err;
        });
        res.redirect('/pickup');
    });

    //Add new pickup item input page
    app.get('/createPickup', isLoggedIn, function(req, res) {
        db1.pickup.find(function(err, docs) {
            res.render('newPickup', {
                title : 'New Item',
                items : docs,
                user : req.user
            });
        });
    });

    // Remove item
    app.post('/pickup/delete', isLoggedIn, function(req, res) {
            //remove from DB
            console.log('HI- ' +req.body.editID);
            var myquery = { _id : ObjectId(req.body.editID) };
            //var collection = db.collection('pickup');
            //db.pickup.remove({_id : ObjectId("5a0a116e669b710303f4d233")});
            db1.pickup.remove(myquery, { safe:true}, function(err, result) {
                if (err) throw err;
            });
            res.redirect('/pickup');
    });

    // Add new pickup item
    app.post('/pickup/add', isLoggedIn, function(req, res) {
        // Check for errors
        var errors = req.validationErrors();//errors made avaible in server.js 'gloabal variables'
        var user = req.user._id;
        db1.pickup.find(function(err, docs) {
            if(errors){
                console.log('ERRORS');
                res.render('index', {
                    title : 'oops',
                    user : user,
                    errors : errors
                });
            } else {
                var newPickup = {
                    location : req.body.pickup_location,
                    details : req.body.pickup_details,
                    paid : req.body.pickup_paid
                };
                //Add to DB
                db1.pickup.insert(newPickup, function(err, result) {
                    if (err){
                        console.log(err);
                    }
                    res.redirect('/pickup');
                });
            }
        });
    });

    // =====================================
    // JOBS SECTION ========================
    // =====================================
    // Table of jobs in workOrderApp collection
    app.get('/tables', isLoggedIn, function(req, res){
        db.Jobs.find({ user : req.user._id }).toArray(function(err, docs){ //Find all the jobs from the logged in user
            res.render('tables', {
                title: 'Tables',
                jobs: docs,
                user : req.user
            });
        });
    });

    //Edit Job 
    app.post('/tables/edit', isLoggedIn, function(req, res){
        db.Jobs.find({ _id : ObjectId(req.body.editID) }).toArray(function(err,docs){
            console.log(docs);
            res.render("editJob", {
                title : 'Edit',
                job: docs,
                user : req.user
            });
        });
    });

    // Filter based on selection
    app.post('/jobs/filter', function(req, res){
        if(req.body.sort_selection == 'All'){  //Reload the table with all the users jobs on empty filter sort_selection
            db.Jobs.find({ 'user' : req.user._id }).toArray(function(err,docs){
                res.render('tables', {
                    title : 'Tables',
                    jobs: docs,
                    user : req.user
                });
            });
        } else{ //Get users filter selection from page body
            db.Jobs.find({ 'user' : req.user._id, 'job_location' : req.body.sort_selection }).toArray(function(err, docs){
                res.render('tables', {
                    title: 'Tables',
                    jobs: docs,
                    user : req.user
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
        job_date: fDate.formatDate(), //Get the date on the fly
        user: req.user._id //Add user info to mongoDB for showing only data that this user has added in the table.ejs page
        };

        //Add job to MongoDB
        var myquery = { _id : ObjectId(req.body.editID) };
        var collection = db.collection('Jobs');
        //var newInfo = { $set : {job_notes : req.body.job_notes} };
        collection.update(myquery, { $set: newJob }, { safe:true}, function(err, result) {
            if (err) throw err;
            console.log(myquery);
            console.log(result);
        });
        res.redirect('/tables');
        console.log(newJob);
    });

    // Add new job input page
    app.get('/createJob', isLoggedIn, function(req, res){
        db.Jobs.find(function (err, docs) {
            res.render('newJob', {
                title: 'New Job',
                jobs: docs,
                user: req.user
            });
        });
        
    });

    // Add new job
    app.post('/jobs/add', isLoggedIn, function(req, res){

        // Make sure fields are not empty
        req.checkBody('job_id', 'Job Id is required ').notEmpty();
        req.checkBody('job_location', 'Job Location is required ').notEmpty();
        req.checkBody('job_description', 'Job Description is required ').notEmpty();
        //req.checkBody('job_notes', 'Job Notes is required ').notEmpty();

        // Check for errors
        var errors = req.validationErrors(); //errors made avaible in server.js 'gloabal variables'
        var user = req.user._id;
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
                    job_date: fDate.formatDate(), //Get the date on the fly
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
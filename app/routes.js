
var mongojs = require('mongojs');
var db = mongojs('workOrderApp', ['Jobs'], { useNewUrlParser: true });
var db1 = mongojs('workOrderApp', ['pickup'], { useNewUrlParser: true });
var db2 = mongojs('workOrderApp', ['equipLoc'], { useNewUrlParser: true });
var db4 = mongojs('workOrderApp', ['qr1'], { useNewUrlParser: true });
var fDate = require('../config/formatDate.js');
var ObjectId = require("mongodb").ObjectId;
var favicon = require('express-favicon');

module.exports = function(app, passport) {

    //favicon
    app.use(favicon(__dirname + '/public/favicon.ico'));

    //request, ip, and route console info
    app.use(function(req, res, next){
        req.time = new Date().toString();
        console.log('TIME: '+ req.time);
        console.log(req.method + ' ' + 'ASKING FOR: ' + req.path + ' - ' + 'FROM: ' + req.ip);
        next();
        });

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('overveiw.ejs', {
            title : 'EVO Maint'
        });
        
    });

    app.get('/index', function(req, res) {
        res.render('index.ejs', {
            title : 'EVO Maint'
        });
        
    });

    app.get('/landing', isLoggedIn, function(req, res) {
        res.render('Profile', {
            title : 'EVO Maint',
            user : req.user
        }); 
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { 
            message: req.flash('loginMessage'),
            urlStr: req.body.urlStr //pass origanal request URL
        });
    });

    // process the login form
    // traditional route handler, passed req/res
    app.post('/login', function(req, res, next) {
        // generate the authenticate method and pass the req/res
        passport.authenticate('local-login', {
            successRedirect : req.body.urlStr , // redirect to origanal requested page section
            failureRedirect : '/login', // redirect back to the login page if there is an error
            failureFlash : true // allow flash messages
        })(req, res, next);
    });
    // =====================================
    // SIGNUP ==============================
    // =====================================
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
    // you have to be logged in to visit
    // use route middleware to verify this (the isLoggedIn function)
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
    app.get('/equipLoc', function(req, res){
        db2.equipLoc.find(function(err, docs){
            res.render('equipLoc', {
                title: 'Location',
                equipment: docs,
            });
        });
    });
    //Edit euipment location
    app.post('/equipLoc/edit', function(req, res){
        db2.equipLoc.find({ _id : ObjectId(req.body.editID) }).toArray(function(err,docs){
            res.render("editEquipmentLoc", {
                title : 'Edit',
                equipLoc: docs,
            });
        });
    });

    // Update equipment
    app.post('/equipLoc/update', function(req, res){
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
        collection.update(myquery, { $set: newEquipLocDetails }, { safe:true}, function(err, result) {
            if (err) throw err;
        });
        res.redirect('/equipLoc');
    });

    // Remove item
    app.post('/equip/delete', function(req, res) {
            //remove from DB
            console.log('HI- ' +req.body.editID);
            var myquery = { _id : ObjectId(req.body.editID) };
            db2.equipLoc.remove(myquery, { safe:true}, function(err, result) {
                if (err) throw err;
            });
            res.redirect('/equipLoc');
    });

    // Add new equipment input page
    app.get('/createEquipment', function(req, res){
        db2.equipLoc.find(function (err, docs) {
            if (err) {
                throw err;
            }
            res.render('newEquip', {
                title: 'New Equipment',
                equipment: docs,
            });
        });        
    });

    // Add new equipment backend
    app.post('/equipment/add', function(req, res){

        // Check for errors
        var errors = req.validationErrors(); //errors made avaible in server.js 'gloabal variables'
        var date = new Date();
        db2.equipLoc.find(function (err, docs) {
            if(errors){
                console.log('ERRORS');
                res.render('index', {
                    title: 'Jobs',
                    equipment: docs,
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
    //Pickup page
    app.get('/pickup', function(req, res){
        db1.pickup.find(function(err, docs){
            res.render('pickup', {
                title: 'Pickup',
                items: docs,
            });
        });
    });
    //Pickup Edit
    app.post('/pickup/edit', function(req, res) {
        db1.pickup.find({ _id : ObjectId(req.body.editID) }).toArray(function(err, docs) {
            console.log(req.body.editID);
            res.render('editPickup', {
                title : 'Edit',
                items : docs,
            });
        });
    });

    //Update pickup item
    app.post('/pickup/update', function(req, res) {

        var newPickup = {
            location :req.body.pickup_location,
            details :req.body.pickup_details,
            paid :req.body.pickup_paid,
            po :req.body.pickup_po
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
    app.get('/createPickup', function(req, res) {
        db1.pickup.find(function(err, docs) {
            res.render('newPickup', {
                title : 'New Item',
                items : docs,
            });
        });
    });

    // Remove item
    app.post('/pickup/delete', function(req, res) {
            //remove from DB
            console.log('HI- ' +req.body.editID);
            var myquery = { _id : ObjectId(req.body.editID) };
            db1.pickup.remove(myquery, { safe:true}, function(err, result) {
                if (err) throw err;
            });
            res.redirect('/pickup');
    });

    // Add new pickup item
    app.post('/pickup/add', function(req, res) {
        // Check for errors
        var errors = req.validationErrors();//errors made avaible in server.js 'gloabal variables'
        db1.pickup.find(function(err, docs) {
            if(errors){
                console.log('ERRORS');
                res.render('index', {
                    title : 'oops',
                    errors : errors
                });
            } else {
                var newPickup = {
                    location :req.body.pickup_location,
                    details :req.body.pickup_details,
                    paid :req.body.pickup_paid,
                    po :req.body.pickup_po
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
        if(req.body.sort_selection == 'All' && req.body.job_status == undefined){  //Reload the table with all the users jobs on empty filter sort_selection
            db.Jobs.find({ 'user' : req.user._id}).toArray(function(err,docs){
                console.log(docs);                
                res.render('tables', {
                    title : 'Tables',
                    jobs: docs,
                    user : req.user
                });
            });
        } else if(req.body.sort_selection == 'All' && req.body.job_status != undefined){
            console.log('HI '+req.body.job_status);
            console.log('HI '+req.body.sort_selection);
            db.Jobs.find({ 'user' : req.user._id, 'job_status' : req.body.job_status }).toArray(function(err,docs){
                console.log(docs);                
                res.render('tables', {
                    title : 'Tables',
                    jobs: docs,
                    user : req.user
                });
            });


        } else{ //Get users filter selection from page body
            db.Jobs.find({ 'user' : req.user._id, 'job_status' : req.body.job_status, 'job_location' : req.body.sort_selection }).toArray(function(err, docs){
                console.log('HI '+req.body.job_status);
                console.log('HI '+req.body.sort_selection);
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
        job_status: req.body.job_status,
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
                    job_status: req.body.job_status,
                    job_date: fDate.formatDate(), //Get the date on the fly
                    user: user //Add user info to mongoDB for showing only data that this user has added in the table.ejs page
                };
                //Add job to MongoDB
                db.Jobs.insert(newJob, function(err, result){
                    if(err){
                        console.log(err);
                    }
                    res.redirect('/tables');
                    console.log(newJob);
                });
            }
        });
    });
    
    // =====================================
    // QR ==================================
    //======================================

    //QR Admin home page
    app.get('/qrAdmin', function(req, res){
        db4.qr1.find(function(req, docs){
            res.render('qr', {
                title: 'QR',
                qr: docs
            });
        });
    });
    // QR user specific home Page
    app.get('/qr1', isLoggedIn, function(req, res){
        db4.qr1.find({ user : req.user._id }).toArray(function(err, docs){ //Find all the records from the logged in user
            res.render('qr', {
                title: 'QR',
                qr: docs,
                user : req.user
            });
        });
    });

    //View QR details
    app.post('/qr/view', isLoggedIn, function(req, res){
        db4.qr1.find({ _id : ObjectId(req.body.editID) }).toArray(function(err,docs){
            var details_string = docs[0].qr1_details;
            var boilerRegex = new RegExp('Boiler', 'i');
            var genRegEx = new RegExp('Generator', 'i');
            var ahuRegEx = new RegExp('AHU', 'i');
            if (boilerRegex.test(details_string)) {
                res.render("boilerView", {
                    title: 'Details',
                    qr: docs,
                    user: req.user
                });
            } else if (genRegEx.test(details_string)) {
                res.render("genView", {
                    title: 'Details',
                    qr: docs,
                    user: req.user
                });
            } else if (ahuRegEx.test(details_string)) {
                res.render("ahuView", {
                    title: 'Details',
                    qr: docs,
                    user: req.user
                });
            } 
        });
    });
    // Update QR database==========================

    //Update Boiler record
    app.post('/qr/boiler/input', isLoggedIn, function(req, res){
        var newRecord = {
            qr1_location: req.body.qr1_location,
            qr1_details: req.body.qr1_details,
            qr1_B1preasure: req.body.qr1_B1preasure,
            qr1_B1temp: req.body.qr1_B1temp,
            qr1_B2preasure: req.body.qr1_B2preasure,
            qr1_B2temp: req.body.qr1_B2temp,
            qr1_glycolStatus: req.body.qr1_glycolStatus,
            qr1_brineTankStatus: req.body.qr1_brineTankStatus,
            qr1_saltAdded: req.body.qr1_saltAdded,
            qr1_pumpGreased: req.body.qr1_pumpGreased,
            qr1_compressorOil: req.body.qr1_compressorOil,
            qr1_compPreasure: req.body.qr1_compPreasure,
            qr1_notes: req.body.qr1_notes
        };
        //Add to database
        var myquery = {_id : ObjectId(req.body.editID) };
        var collection = db4.collection('qr1');
        collection.update(myquery, { $set: newRecord }, {safe : true}, function(err, result) {
            if (err) throw err;
        });
        res.redirect('/qr1');
        console.log(newRecord);
    });

    // Update generator record
    app.post('/qr/gen/input', isLoggedIn, function(req, res){
        var newRecord = {
            qr1_location: req.body.qr1_location,
            qr1_details: req.body.qr1_details,
            qr1_oil: req.body.qr1_oil,
            qr1_oilQ: req.body.qr1_oilQ,
            qr1_filter: req.body.qr1_filter,
            qr1_fuelStatus: req.body.qr1_fuelStatus,
            qr1_notes: req.body.qr1_notes
        };
        //Add record to MongoDB
        var myquery = { _id : ObjectId(req.body.editID) };
        var collection = db4.collection('qr1');
        collection.update(myquery, { $set: newRecord }, { safe:true}, function(err, result) {
            if (err) throw err;
        });
        res.redirect('/qr1');
        console.log(newRecord);
    });

    // Update record AHU record
    app.post('/qr/ahu/input', isLoggedIn, function(req, res){
        var newRecord = {
            qr1_location: req.body.qr1_location,
            qr1_details: req.body.qr1_details,
            qr1_beltSize: req.body.qr1_beltSize,
            qr1_beltStatus: req.body.qr1_beltStatus,
            qr1_filterSize: req.body.qr1_filterSize,
            qr1_filterQ:req.body.qr1_filterQ,
            qr1_filterStatus: req.body.qr1_filterStatus,
            qr1_motorGreased: req.body.qr1_motorGreased,
            qr1_notes: req.body.qr1_notes,
        };
        //Add record to MongoDB
        var myquery = { _id : ObjectId(req.body.editID) };
        var collection = db4.collection('qr1');
        collection.update(myquery, { $set: newRecord }, { safe:true}, function(err, result) {
            if (err) throw err;
            console.log(myquery);
            console.log(result);
        });
        res.redirect('/qr1');
        console.log(newRecord);
    });

    // Add new record
    //Boilers
    app.post('/qr/boiler/add', isLoggedIn, function(req, res){
        // Make sure fields are not empty
        //req.checkBody('qr1_preasure', 'Preasure is required ').notEmpty();
        //req.checkBody('qr1_temp', 'Temperature is required ').notEmpty();  
        // Check for errors
        var errors = req.validationErrors();
        var user = req.user._id;
        db4.qr1.find(function (err, docs) {
            if(errors){
                console.log('ERRORS');
                res.render('qr', {
                    title: 'qrAdmin',
                    qr: docs,
                    user: user,
                    errors: errors
            });
            // If no errors create record
            } else {
                var newBoiler = {
                    qr1_location: req.body.qr1_location,
                    qr1_details: req.body.qr1_details,
                    qr1_B1preasure: req.body.qr1_B1preasure,
                    qr1_B1temp: req.body.qr1_B1temp,
                    qr1_B2preasure: req.body.qr1_B2preasure,
                    qr1_B2temp: req.body.qr1_B2temp,
                    qr1_glycolStatus: req.body.qr1_glycolStatus,
                    qr1_brineTankStatus: req.body.qr1_brineTankStatus,
                    qr1_saltAdded: req.body.qr1_saltAdded,
                    qr1_pumpGreased: req.body.qr1_pumpGreased,
                    qr1_pumpPreasure: req.body.qr1_pumpPreasure,
                    qr1_compressorOil: req.body.qr1_compressorOil,
                    qr1_compPreasure: req.body.qr1_compPreasure,
                    qr1_notes: req.body.qr1_notes,
                    qr1_date: fDate.formatDate(),
                    user: user
                };
                //Add record to MongoDB
                db4.qr1.insert(newBoiler, function(err, result){
                    if(err){
                        console.log(err);
                    }
                    res.redirect('/qr1');
                    console.log(newBoiler);
                });
            }
        });
    });

    //Generators
    app.post('/qr/generator/add', isLoggedIn, function(req, res){
        // Make sure fields are not empty
        //req.checkBody('qr1_oil', 'oil is required ').notEmpty();
        //req.checkBody('qr1_filter', 'filter is required ').notEmpty();  
        // Check for errors
        var errors = req.validationErrors();
        var user = req.user._id;
        db4.qr1.find(function (err, docs) {
            if(errors){
                console.log('ERRORS');
                res.render('qr1', {
                    title: 'qrAdmin',
                    qr: docs,
                    user: user,
                    errors: errors
            });
            // If no errors create record
            } else {
                var newGen = {
                    qr1_location: req.body.qr1_location,
                    qr1_details: req.body.qr1_details,
                    qr1_oil: req.body.qr1_oil,
                    qr1_oilQ: req.body.qr1_oilQ,
                    qr1_filter: req.body.qr1_filter,
                    qr1_fuelFilter: req.body.qr1_fuelFilter,
                    qr1_coolantStatus: req.body.qr1_coolantStatus,
                    qr1_fuelStatus: req.body.qr1_fuelStatus,
                    qr1_notes: req.body.qr1_notes,
                    qr1_date: fDate.formatDate(),
                    user: user
                };
                //Add record to MongoDB
                db4.qr1.insert(newGen, function(err, result){
                    if(err){
                        console.log(err);
                    }
                    res.redirect('/qr1');
                    console.log(newGen);
                });
            }
        });
    });

    //AHU's
    app.post('/qr/ahu/add', isLoggedIn, function(req, res){
        // Make sure fields are not empty
        //req.checkBody('qr1_filterStatus', 'filter status is required ').notEmpty();  
        // Check for errors
        var errors = req.validationErrors();
        var user = req.user._id;
        db4.qr1.find(function (err, docs) {
            if(errors){
                console.log('ERRORS');
                res.render('qr1', {
                    title: 'qrAdmin',
                    qr: docs,
                    user: user,
                    errors: errors
            });
            // If no errors create record
            } else {
                var newAHU = {
                    qr1_location: req.body.qr1_location,
                    qr1_details: req.body.qr1_details,
                    qr1_beltSize: req.body.qr1_beltSize,
                    qr1_beltStatus: req.body.qr1_beltStatus,
                    qr1_filterSize: req.body.qr1_filterSize,
                    qr1_filterQ:req.body.qr1_filterQ,
                    qr1_filterStatus: req.body.qr1_filterStatus,
                    qr1_motorGreased: req.body.qr1_motorGreased,
                    qr1_notes: req.body.qr1_notes,
                    qr1_date: fDate.formatDate(),
                    user: user
                };
                //Add record to MongoDB
                db4.qr1.insert(newAHU, function(err, result){
                    if(err){
                        console.log(err);
                    }
                    res.redirect('/qr1');
                    console.log(newAHU);
                });
            }
        });
    });
    
    // SCHOOLS ROUTES ATTACHED TO ACTUAL QR CODES
    app.get('/qr/:school/boiler', isLoggedIn, function(req, res){
        var date = fDate.formatDate();
        var qr1Update = {
            qr1_location: req.params.school.toUpperCase(),
            qr1_details: 'BoilerRoom',
            qr1_date: date
        };
        res.render('boiler', {
            title: 'CLC Boiler Room',
            user: req.user,
            info: qr1Update
        });
    });

    app.get('/qr/:school/generator', isLoggedIn, function(req, res){
        var date = fDate.formatDate();
        var qr1Update = {
            qr1_location: req.params.school.toUpperCase(),
            qr1_details: 'Generator',
            qr1_date: date
        };
        res.render('generator', {
            title: 'CLC Generator',
            user: req.user,
            info: qr1Update
        });
    });

    app.get('/qr/:school/ahu/:number', isLoggedIn, function(req, res){
        var date = fDate.formatDate();
        var qr1Update = {
            qr1_location: req.params.school.toUpperCase(),
            qr1_details: 'AHU-'+ req.params.number,
            qr1_date: date
        };
        res.render('ahu', {
            title: 'CLC AHU1',
            user: req.user,
            info: qr1Update
        });
    });
    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    // =====================================
    // EVERYTHING ELSE =====================
    // =====================================
    // if page is not found send to root page
    app.all('*', function(req, res) {
        res.redirect('/');
    });
};

// =====================================
// CHECK LOGGED IN STATUS ==============
// =====================================
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        console.log(req.path);
        res.render('login.ejs', { 
            message: req.flash('loginMessage'),
            urlStr: req.path
        }); 
    } else {
        return next();
    }
}
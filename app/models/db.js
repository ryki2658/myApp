var mongojs = require('mongojs');
var db = mongojs('workOrderApp', ['Jobs'], { useNewUrlParser: true });
var db1 = mongojs('workOrderApp', ['pickup'], { useNewUrlParser: true });
var db2 = mongojs('workOrderApp', ['equipLoc'], { useNewUrlParser: true });
var db4 = mongojs('workOrderApp', ['qr1'], { useNewUrlParser: true });
//var fDate = require('.../config/formatDate.js');
var ObjectId = require("mongodb").ObjectId;

var req = {
    body: {
        qr1_location: 'HOME'
    }
};

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
console.log(newRecord);
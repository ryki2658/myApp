var Record = require('./QRdatabase');
var fDate = require('../../config/formatDate.js');

var newRecord = new Record({
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
});

newRecord.save(function(err, newRecord){
    if (err){
        console.error('***ERROR***: '+err);
    }
});
module.exports = newRecord;

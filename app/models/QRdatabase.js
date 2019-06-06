var mongoose = require('mongoose');
//var fDate = require('../config/formatDate.js');

mongoose.connect('mongodb://127.0.0.1:27017/QR');
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var QR1_Schema = new mongoose.Schema({
  qr1_location: String,
  qr1_details: String,
  qr1_B1preasure: String,
  qr1_B1temp: String,
  qr1_B2preasure: String,
  qr1_B2temp: String,
  qr1_glycolStatus: String,
  qr1_brineTankStatus: String,
  qr1_saltAdded: String,
  qr1_pumpGreased: String,
  qr1_pumpPreasure: String,
  qr1_compressorOil: String,
  qr1_compPreasure: String,
  qr1_notes: String,
  qr1_date: Date,
  user: String
    });
var NewQR = mongoose.model('qr1', QR1_Schema);

module.exports = NewQR;

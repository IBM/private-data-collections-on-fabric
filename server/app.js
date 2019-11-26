const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const log4js = require('log4js');
const uuid = require('uuid/v4');

let manufacturerNetwork = require('manufacturer_network.js');
let wholesaler1Network = require('w1_network.js');
let wholesaler2Network = require('w2_network.js');
let pharmacyNetwork = require('pharmacy_network.js');
let patientNetwork = require('patient_network.js');

var logger = log4js.getLogger();
logger.level = 'debug';
logger.debug("launching application backend");

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'POST, GET, PATCH');
  next();
});

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(bodyParser.json());

app.get('/getPills', (req, res) => {
  wholesaler1Network.queryAllPills()
      .then((response) => {
          let pillsRecord = JSON.parse(response);
          res.send(pillsRecord);
      });
});

app.get('/getPharmacyPills', (req, res) => {
  pharmacyNetwork.queryPharmacyPills()
      .then((response) => {
          let pillsRecord = JSON.parse(response);
          res.send(pillsRecord);
      });
});

app.get('/getPatientPills', (req, res) => {
  patientNetwork.queryPatientPills()
      .then((response) => {
          let pillsRecord = JSON.parse(response);
          res.send(pillsRecord);
      });
});

app.post('/buyPill', (req, res) => {
  if (req.body.wholesaler == "w1") {
    wholesaler1Network.buyPill(req.body.uuid, req.body.wholesaler)
      .then((response) => {
        res.send(response);
      });
  } else if (req.body.wholesaler == "w2") {
    wholesaler2Network.buyPill(req.body.uuid, req.body.wholesaler)
      .then((response) => {
        res.send(response);
      });
  }
});

app.post('/generatePill', (req, res) => {
  manufacturerNetwork.generatePill()
      .then((response) => {
          res.send(response);
      });
});

app.listen(8081, function() {
  console.log("Server is listening on port " + 8081);
});

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const util = require('util');
const path = require('path');
const fs = require('fs');

let network = require('./fabric/network.js');

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

//use this identity to query
const appAdmin = config.appAdmin;

//get all assets in world state
app.get('/queryAll', async (req, res) => {

  let networkObj = await network.connectToNetwork(appAdmin);
  let response = await network.invoke(networkObj, true, 'readMyDrugPublic', 'D1');
  console.log('before app.get /queryAll reponse')
  console.log(response);
  let parsedResponse = await JSON.parse(response);
  parsedResponse.currentUser = networkObj.currentUser;
  res.send(parsedResponse);

});

app.get('/getCurrentStanding', async (req, res) => {

  let networkObj = await network.connectToNetwork(appAdmin);
  let response = await network.invoke(networkObj, true, 'queryByObjectType', 'votableItem');
  let parsedResponse = await JSON.parse(response);
  console.log(parsedResponse);
  res.send(parsedResponse);

});

//vote for some candidates. This will increase the vote count for the votable objects
app.post('/castBallot', async (req, res) => {
  let networkObj = await network.connectToNetwork(req.body.voterId);
  console.log('util inspecting');
  console.log(util.inspect(networkObj));
  req.body = JSON.stringify(req.body);
  console.log('req.body');
  console.log(req.body);
  let args = [req.body];

  let response = await network.invoke(networkObj, false, 'castVote', args);
  if (response.error) {
    res.send(response.error);
  } else {
    console.log('response: ');
    console.log(response);
    // let parsedResponse = await JSON.parse(response);
    res.send(response);
  }
});

//query for certain objects within the world state
app.post('/queryWithQueryString', async (req, res) => {

  let networkObj = await network.connectToNetwork(appAdmin);
  let response = await network.invoke(networkObj, true, 'queryByObjectType', req.body.selected);
  let parsedResponse = await JSON.parse(response);
  res.send(parsedResponse);

});

//get voter info, create voter object, and update state with their voterId
app.post('/registerUser', async (req, res) => {
  console.log('req.body: ');
  console.log(req.body);

  //first create the identity for the voter and add to wallet
  let response = await network.registerUser(req.body.email, req.body.confirmPass, req.body.lastName, req.body.mspid);
  console.log('response from registerUser: ');
  console.log(response);
  if (response.error) {
    res.send(response.error);
  } else {
    console.log('response from registerUser in app.js: ');
    console.log(response);
    let networkObj = await network.connectToNetwork(req.body.email);

    if (networkObj.error) {
      res.send(networkObj.error);
    }
    // console.log('network obj');
    // console.log(util.inspect(networkObj));


    req.body = JSON.stringify(req.body);
    let args = [req.body];
    //connect to network and update the state with voterId  
    let invokeResponse = await network.invoke(networkObj, false, 'createUser', args);
    
    if (invokeResponse.error) {
      res.send(invokeResponse.error);
    } else {

      console.log('after network.invoke ');
      console.log(invokeResponse.toString());
      res.send(invokeResponse);

    }

  }


});

//used as a way to login the voter to the app and make sure they haven't voted before 
app.post('/validateUser', async (req, res) => {
  console.log('req.body: ');
  console.log(req.body);
  let networkObj = await network.connectToNetwork(req.body.email);
  console.log('networkobj: ');
  console.log(util.inspect(networkObj));

  if (networkObj.error) {
    res.send(networkObj);
  }

  let invokeResponse = await network.invoke(networkObj, true, 'readMyAsset', req.body.email);
  console.log(invokeResponse);
  if (invokeResponse.error) {
    res.send(invokeResponse);
  } else {
    console.log('after network.invoke ');
    let parsedResponse = await JSON.parse(invokeResponse);
    if (parsedResponse.ballotCast) {
      let response = {};
      response.error = 'This voter has already cast a ballot, we cannot allow double-voting!';
      res.send(response);
    }
    // let response = `Voter with voterId ${parsedResponse.voterId} is ready to cast a ballot.`  
    res.send(parsedResponse);
  }

});

app.post('/queryByKey', async (req, res) => {
  console.log('req.body: ');
  console.log(req.body);

  let networkObj = await network.connectToNetwork(appAdmin);
  console.log('after network OBj');
  let response = await network.invoke(networkObj, true, 'readMyAsset', req.body.key);
  response = JSON.parse(response);
  if (response.error) {
    console.log('inside eRRRRR');
    res.send(response.error);
  } else {
    console.log('inside ELSE');
    res.send(response);
  }
});


app.listen(process.env.PORT || 8081);
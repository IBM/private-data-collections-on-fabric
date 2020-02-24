//Import Hyperledger Fabric 1.4 programming model - fabric-network
'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');
const fs = require('fs');

//connect to the config file
const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
let connection_file = config.connection_file;
let configUserName = config.userName;
let gatewayDiscovery = config.gatewayDiscovery;
// connect to the connection file
const ccpPath = path.join(process.cwd(), connection_file);
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

const privateDataTransaction = 'createMyDrug';
const privateCollectionQuery = 'readMyDrugPrivate';
const publicCollectionQuery = 'readMyDrugPublic';


const util = require('util');

exports.connectToNetwork = async function (userName) {
  
  const gateway = new Gateway();

  try {

    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);
    console.log('userName: ');
    console.log(userName);
    const userExists = await wallet.exists(userName);

    if (!userExists) {
      let response = {};
      response.error = 'An identity for the user ' + userName + ' does not exist in the wallet. Register ' + userName + ' first';
      return response;
      // throw Error(`User ${userName} doesn't exist`);
    }

    console.log('before gateway.connect: ');

    await gateway.connect(ccp, { wallet, identity: userName, discovery: gatewayDiscovery });

    // Connect to our local fabric
    const network = await gateway.getNetwork('mychannel');

    let gatewayUser = await gateway.getCurrentIdentity();

    console.log('Connected to mychannel. ');
    // Get the contract we have installed on the peer
    const contract = await network.getContract('drugContract');


    let networkObj = {
      contract: contract,
      network: network,
      gateway: gateway,
      currentUser: userName, 
      mspid: gatewayUser._mspId
    };

    return networkObj;

  } catch (error) {
    throw Error (error)

  } finally {
    console.log('Done connecting to network.');
    // gateway.disconnect();
  }
};

exports.invoke = async function (networkObj, isQuery, func, args) {
  try {
    console.log('inside invoke');
    console.log(`isQuery: ${isQuery}, func: ${func}, args: ${args}`);
    console.log(privateDataTransaction)
    if (func === privateDataTransaction) {
      console.log('inside privDataTx')

      args = JSON.parse(args[0]);
      args = JSON.stringify(args);

      const transientDrugData = {

        drugNumber: args.drugNumber,
        drugName: args.drugName,
        activeIngredients: args.activeIngredients,
        dosableForm: args.dosableForm,
        owner: args.owner,
        price: args.price

      }
      let response = await networkObj.contract.submitTransaction(func, args);
      console.log(`Transaction ${func} with args ${args} has been submitted`);
      await networkObj.gateway.disconnect();
      return response;

    } else if (func === privateCollectionQuery || func === publicCollectionQuery){

      console.log('inside collections query')
      try {
        args = JSON.parse(args[0]);
        args = JSON.stringify(args);
        let response = await networkObj.contract.evaluateTransaction(func, args);
        console.log(`Transaction ${func} with args ${args} has been submitted`);
        await networkObj.gateway.disconnect();
        return response;
      } catch(error) {
        console.log('collection query err')
        throw Error (` : ${error}`)
      }


    } else {

      if (isQuery === true) {

        if (args) {
  
          let response = await networkObj.contract.evaluateTransaction(func, args);
          await networkObj.gateway.disconnect();
          return response.toString();
          
        } else {
  
          let response = await networkObj.contract.evaluateTransaction(func);
          console.log(`Transaction ${func} without args has been evaluated`);
          await networkObj.gateway.disconnect();
          return response;
  
        }
      } else {
        if (args) {
  
          args = JSON.parse(args[0]);
          args = JSON.stringify(args);
          let response = await networkObj.contract.submitTransaction(func, args);
          console.log(`Transaction ${func} with args ${args} has been submitted`);
          await networkObj.gateway.disconnect();
          return response;
  
        } else {
          console.log('notQuery no args');
          let response = await networkObj.contract.submitTransaction(func);
          console.log(`Transaction ${func} with args has been submitted`);
    
          await networkObj.gateway.disconnect();
    
          return response;
        }
      }

    }

  } catch (error) {
    throw Error(error)
  }
};

exports.RegisterUser = async function (email, pass, confirmPass, orgMSPID) {

  if (!email || !pass || !confirmPass || !orgMSPID) {
    throw Error('Error! You need to fill all fields before you can register!');
  }

  try {

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists(email);
    if (userExists) {
      throw Error(`Error! An identity for the user ${email} already exists. Please enter
      a different email.`)
    }

    console.log(configUserName)
    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: configUserName, discovery: gatewayDiscovery });

    // Get the CA client object from the gateway for interacting with the CA.
    const ca = gateway.getClient().getCertificateAuthority();
    const adminIdentity = gateway.getCurrentIdentity();
    console.log(`AdminIdentity: + ${adminIdentity}`);

    let user = {};
    user.email = email;
    user.pass = pass;
    user.confirmPass = confirmPass;
    user.orgMSPID = orgMSPID;

    // Register the user, enroll the user, and import the new identity into the wallet.
    const secret = await ca.register({ enrollmentID: email, role: 'client' }, adminIdentity);

    const enrollment = await ca.enroll({ enrollmentID: email, enrollmentSecret: secret });
    const userIdentity = await X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
    await wallet.import(email, userIdentity);
    console.log(`Successfully registered user ${email} from ${orgMSPID}. Use your email, ${email} and associated password to login above.`);
    let response = `Successfully registered user ${email} from ${orgMSPID}. Use your email, ${email} and associated password to login above.`;
    return response;
  } catch (error) {
    throw Error (`Failed to register user + ${email} + : ${error}`)
  }
};
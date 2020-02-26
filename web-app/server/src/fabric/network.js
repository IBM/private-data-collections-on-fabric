//Import Hyperledger Fabric 1.4 programming model - fabric-network
'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');
const fs = require('fs');
let ccpPath;
let configPath;

const privateDataTransaction = 'createMyDrug';
const privateCollectionQuery = 'readMyDrugPrivate';
const publicCollectionQuery = 'readMyDrugPublic';

exports.connectToNetwork = async function (userName, configObj) {

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
    console.log(configObj.ccp.peers)

    await gateway.connect(configObj.ccp, { wallet, identity: configObj.config.appAdmin, discovery: configObj.config.gatewayDiscovery });

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
    throw Error(error)

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

    } else if (func === privateCollectionQuery || func === publicCollectionQuery) {

      console.log('inside collections query')
      try {
        args = JSON.parse(args[0]);
        args = JSON.stringify(args);
        let response = await networkObj.contract.evaluateTransaction(func, args);
        console.log(`Transaction ${func} with args ${args} has been submitted`);
        await networkObj.gateway.disconnect();
        return response;
      } catch (error) {
        let response = {};
        response.error = error;
        return response;
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

exports.RegisterUser = async function (email, pass, confirmPass, orgMSPID, configObj) {

  if (!email || !pass || !confirmPass || !orgMSPID) {
    throw Error('Error! You need to fill all fields before you can register!');
  }

  try {

    console.log(orgMSPID)
    let configObj = await this.getFabricConnection(orgMSPID);
    console.log(configObj)

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    console.log('wallet path')
    console.log(walletPath)
    const wallet = new FileSystemWallet(walletPath);

    let appAdmin;

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists(email);
    if (userExists) {
      throw Error(`Error! An identity for the user ${email} already exists. Please enter
      a different email.`)
    }

    const appAdminExists = await wallet.exists(configObj.config.appAdmin);
    if (!appAdminExists) {
      throw Error(`Error! An identity for the user ${appAdmin} doesnt exists.`);
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(configObj.ccp, { wallet, identity: configObj.config.appAdmin, discovery: configObj.config.gatewayDiscovery });

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
    throw Error(`Failed to register user + ${email} + : ${error}`)
  }
};

//return parsed connection profile
exports.getFabricConnection = async function (mspid) {
  try {
    switch (mspid) {
      case 'patientmsp':
        ccpPath = path.join(process.cwd(), './connectionProfiles/patientConnection.json');
        configPath = path.join(process.cwd(), './config/configPatient.json');
        break;
      case 'w1msp':
        ccpPath = path.join(process.cwd(), './connectionProfiles/w1Connection.json');
        configPath = path.join(process.cwd(), './config/configW1.json');
        break;
      case 'w2msp':
        ccpPath = path.join(process.cwd(), './connectionProfiles/w2Connection.json');
        configPath = path.join(process.cwd(), './config/configW2.json');
        break;
      case 'manufacturermsp':
        ccpPath = path.join(process.cwd(), './connectionProfiles/manufacturerConnection.json');
        configPath = path.join(process.cwd(), './config/configManufacturer.json');
        break;
      case 'pharmacymsp':
        ccpPath = path.join(process.cwd(), './connectionProfiles/pharmacyConnection.json');
        configPath = path.join(process.cwd(), './config/configPharmacy.json');
        break;
      default:
        console.log('Sorry, there was an error');
    }

    const configJSON = await fs.readFileSync(configPath, 'utf8');
    const config = await JSON.parse(configJSON);
    const ccpJSON = await fs.readFileSync(ccpPath, 'utf8');
    const ccp = await JSON.parse(ccpJSON);
    let configObj = {};
    configObj.config = config;
    configObj.ccp = ccp;
    return configObj;
  } catch (error) {
    throw Error(`Failed to return cpp`)
  }
};
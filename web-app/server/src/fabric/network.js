
'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml')

// capture network variables from config.json
const configPath = path.join(process.cwd(), '/config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
var connection_file = config.connection_file;
var userName = config.userName;
var gatewayDiscovery = config.gatewayDiscovery;

// connect to the connection file
const ccpPath = path.join(process.cwd(), connection_file);
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const connectionFile = JSON.parse(ccpJSON);
// let fileContents = fs.readFileSync(filePath, 'utf8');
// let connectionFile = yaml.safeLoad(fileContents);

// create car transaction
exports.createCar = async function(key, make, model, color, owner) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(userName);
        if (!userExists) {
            console.log('An identity for the user ' + userName + ' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user ' + userName + ' does not exist in the wallet. Register ' + userName + ' first';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        console.log('we here in createCar')

        const gateway = new Gateway();
        await gateway.connect(connectionFile, { wallet, identity: userName, discovery: gatewayDiscovery });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('Jan21TestContract');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')

        await contract.submitTransaction('createCar', key, make, model, color, owner);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        response.msg = 'createCar Transaction has been submitted';
        return response;        

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response; 
    }
}

// change car owner transaction
exports.changeCarOwner = async function(key, newOwner) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(userName);
        if (!userExists) {
            console.log('An identity for the user ' + userName + ' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user ' + userName + ' does not exist in the wallet. Register ' + userName + ' first';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
   
        await gateway.connect(connectionFile, { wallet, identity: userName, discovery: gatewayDiscovery });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Submit the specified transaction.
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
        await contract.submitTransaction('changeCarOwner', key, newOwner);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        response.msg = 'changeCarOwner Transaction has been submitted';
        return response;        

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response; 
    }
}

// query all cars transaction
exports.queryAllCars = async function() {
    try {
        console.log('starting to queryAllCars')

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(userName);
        if (!userExists) {
            console.log('An identity for the user ' + userName + ' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user ' + userName + ' does not exist in the wallet. Register ' + userName + ' first';
            return response;            
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();

        await gateway.connect(connectionFile, { wallet, identity: userName, discovery: gatewayDiscovery });
        console.log('after gateway connect')
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');
        console.log('after network connect')

        // Get the contract from the network.
        const contract = network.getContract('drugContract');
        console.log('aftafter contrer gateway connect')

        // Evaluate the specified transaction.
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        let createPrivCarResponse = await contract.submitTransaction('createMyDrug', 'D1', 'adderall', 'somethingCrazy', 'pill', 'testCompany', '56');
        console.log('after createPrivCarResponse')
        let queryResponse = await contract.evaluateTransaction('readMyDrugPublic', 'D1');
        console.log('after readMyAssetPublic')
        let queryResponse2 = await contract.evaluateTransaction('readMyDrugPrivate', 'D1');
        console.log('this is the response from evaluate transaction, readMyAssetPrivate ')
        console.log(queryResponse2.toString());
        console.log('this is the response from evaluate transaction, readMyAssetPublic ')
        console.log(queryResponse.toString());
        return queryResponse2;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return error;
    }
}

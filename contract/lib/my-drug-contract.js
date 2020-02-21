/* eslint-disable indent */
/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MyDrugContract extends Contract {

  async myAssetExists(ctx, assetId) {
    console.info('============= START : myDrugExists ===========');
    const buffer = await ctx.stub.getState(assetId);
    console.info('============= END : myDrugExists ===========');
    return (!!buffer && buffer.length > 0);

  }

  async createUser(ctx, args) {
    console.info('============= START : createUser ===========');
    console.log(args);
    args = JSON.parse(args);

    const user = {
      email: args.email,
      confirmPass: args.confirmPass,
      lastName: args.lastName,
      mspid: args.mspid,
    };
    console.info('============= End : createUser ===========');
    const buffer = await ctx.stub.putState(user.email, Buffer.from(JSON.stringify(user)));
    let response = `successfully created user account for ${user.email}. Use your email 
    and password log in to the Healthcare Network above.`
    return response;
  }

  async createMyDrug(ctx, args) {
    console.info('============= START : createMyDrug ===========');
    args = JSON.parse(args);

    const drugPublic = {
      drugNumber: args.drugNumber,
      drugName: args.drugName,
      activeIngredients: args.activeIngredients,
      dosableForm: args.dosableForm,
      owner: args.owner,
    };

    const drugPrivate = {
      price: args.price
    };

    await ctx.stub.putPrivateData('collectionDrug', args.drugNumber, Buffer.from(JSON.stringify(drugPublic)));
    await ctx.stub.putPrivateData('collectionDrugPrivateDetails', args.drugNumber, Buffer.from(JSON.stringify(drugPrivate)));
    console.info('============= END : createMyDrug ===========');
    return drugPublic;

  }

  async readMyDrugPrivate(ctx, drugNumber) {
    console.info('============= START : readMyDrugPrivate ===========');
    let res = {};
    const buffer = await ctx.stub.getPrivateData('collectionDrugPrivateDetails', drugNumber);
    try {
      res = JSON.parse(buffer.toString());
    } catch (err) {
      res = err;
    }
    console.info('============= END : readMyDrugPrivate ===========');
    return res;
  }

  async readMyDrugPublic(ctx, drugNumber) {
    console.info('============= START : readMyDrugPublic ===========');
    let res = {};
    const buffer = await ctx.stub.getPrivateData('collectionDrug', drugNumber);
    try {
      res = JSON.parse(buffer.toString());
    } catch (err) {
      res = err;
    }
    console.info('============= END : readMyDrugPublic ===========');
    return res;
  }

  async deleteMyAsset(ctx, drugNumber) {
    console.info('============= START : deleteMyAsset ===========');
    const exists = await this.myAssetExists(ctx, drugNumber);
    if (!exists) {
      throw new Error(`The my asset ${drugNumber} does not exist`);
    }
    await ctx.stub.deleteState(drugNumber);
    console.info('============= END : deleteMyAsset ===========');
  }

  async changeDrugOwner(ctx, drugNumber, newOwner) {
    console.info('============= START : changeDrugOwner ===========');

    const drugAsBytes = await ctx.stub.getPrivateData('collectionDrug', drugNumber);
    if (!drugAsBytes || drugAsBytes.length === 0) {
      throw new Error(`${drugNumber} does not exist`);
    }
    const drug = JSON.parse(drugAsBytes.toString());
    drug.owner = newOwner;

    await ctx.stub.putState(drugNumber, Buffer.from(JSON.stringify(drug)));
    console.info('============= END : changeDrugOwner ===========');
  }

  /**
   *
   * readMyAsset
   *
   * Reads a key-value pair from the world state, based on the key given.
   *  
   * @param myAssetId - the key of the asset to read
   * @returns - nothing - but reads the value in the world state
   */
  async readMyAsset(ctx, myAssetId) {

    const exists = await this.myAssetExists(ctx, myAssetId);

    if (!exists) {
      // throw new Error(`The my asset ${myAssetId} does not exist`);
      let response = {};
      response.error = `The my asset ${myAssetId} does not exist`;
      return response;
    }

    const buffer = await ctx.stub.getState(myAssetId);
    const asset = JSON.parse(buffer.toString());
    return asset;
  }

    /**
   * Query and return all key value pairs in the world state.
   *
   * @param {Context} ctx the transaction context
   * @returns - all key-value pairs in the world state
  */
 async queryAll(ctx) {

  let queryString = {
    selector: {}
  };

  let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
  return queryResults;

}

/**
   * Evaluate a queryString
   *
   * @param {Context} ctx the transaction context
   * @param {String} queryString the query string to be evaluated
  */
async queryWithQueryString(ctx, queryString) {

  console.log('query String');
  console.log(JSON.stringify(queryString));

  let resultsIterator = await ctx.stub.getQueryResult(queryString);

  let allResults = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let res = await resultsIterator.next();

    if (res.value && res.value.value.toString()) {
      let jsonRes = {};

      console.log(res.value.value.toString('utf8'));

      jsonRes.Key = res.value.key;

      try {
        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
      } catch (err) {
        console.log(err);
        jsonRes.Record = res.value.value.toString('utf8');
      }

      allResults.push(jsonRes);
    }
    if (res.done) {
      console.log('end of data');
      await resultsIterator.close();
      console.info(allResults);
      console.log(JSON.stringify(allResults));
      return JSON.stringify(allResults);
    }
  }
}

/**
* Query by the main objects in this app: ballot, election, votableItem, and Voter. 
* Return all key-value pairs of a given type. 
*
* @param {Context} ctx the transaction context
* @param {String} objectType the type of the object - should be either ballot, election, votableItem, or Voter
*/
async queryByObjectType(ctx, objectType) {

  let queryString = {
    selector: {
      type: objectType
    }
  };

  let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
  return queryResults;

}
}

module.exports = MyDrugContract;

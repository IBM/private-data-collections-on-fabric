/* eslint-disable indent */
/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MyDrugContract extends Contract {

  async myDrugExists(ctx, drugNumber) {
    console.info('============= START : myDrugExists ===========');
    const buffer = await ctx.stub.getState(drugNumber);
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

  async createMyDrug(ctx, drugNumber, drugName, activeIngredients, dosableForm, owner, price) {
    console.info('============= START : createMyDrug ===========');

    const drugPublic = {
      drugName,
      activeIngredients,
      dosableForm,
      owner,
    };

    const drugPrivate = {
      price
    };

    await ctx.stub.putPrivateData('collectionDrug', drugNumber, Buffer.from(JSON.stringify(drugPublic)));
    await ctx.stub.putPrivateData('collectionDrugPrivateDetails', drugNumber, Buffer.from(JSON.stringify(drugPrivate)));
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
}

module.exports = MyDrugContract;

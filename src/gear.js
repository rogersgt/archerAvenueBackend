'use strict';
import 'babel-polyfill';
import * as auth from './toolbox/auth';
import { handleBody } from './toolbox/validator';
import { DynamoDB } from 'aws-sdk';

const ddb = new DynamoDB({ apiVersion: '2012-08-10' });

module.exports.updateGear = async (event, context, callback) => {
  const token = context.token['Cookie'];

  if (!auth.tokenIsValid(token)) {
    callback(null, {
      statusCode: 403,
      body: JSON.stringify({ errorMessage: 'Unauthorized.' })
    });
  } else {
    try {
      const params = {
        TableName: process.env.GEAR_TABLE,
        
      };
    } catch (err) {
      console.log(err);
      callback('There was an error updating the Gear table');
    }
  }
};
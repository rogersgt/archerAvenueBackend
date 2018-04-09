'use strict';
import 'babel-polyfill';
import * as auth from './toolbox/auth';
import { DynamoDB } from 'aws-sdk';

const ddb = new DynamoDB({ apiVersion: '2012-08-10' });

module.exports.getEngineers = async (event, context, callback) => {
  try {
    const params = {
      TableName: `${process.env.ENGINEER_TABLE}`
    };
    const res = await ddb.scan(params).promise();
    console.log(res);
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({})
    })
  } catch (err) {
    console.log(err);
    callback('There was an error retrieving engineer data');
  }
};
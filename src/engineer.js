'use strict';
import 'babel-polyfill';
import * as auth from './toolbox/auth';
import { handleBody } from './toolbox/validator';
import { DynamoDB } from 'aws-sdk';

const ddb = new DynamoDB({ apiVersion: '2012-08-10' });

module.exports.getEngineers = async (event, context, callback) => {
  try {
    const params = {
      TableName: `${process.env.ENGINEER_TABLE}`
    };
    const res = await ddb.scan(params).promise();
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(res)
    })
  } catch (err) {
    console.log(err);
    callback('There was an error retrieving engineer data');
  }
};

module.exports.updateEngineer = async (event, context, callback) => {
  const token = event.headers['Cookie'];
  if (!auth.tokenIsValid(token)) {
    callback(null, {
      statusCode: 403,
      body: JSON.stringify({ errorMessage: 'Unauthorized.' })
    });
  } else {
    try {
      const body = handleBody(event.body);
      if (!body.firstName || !body.LastName) {
        callback(null, {
          statusCode: 400,
          body: JSON.stringify({ errorMessage: 'Must include firstName and LastName' })
        });
      } else {
        const params = {
          TableName: process.env.ENGINEER_TABLE,
          Key: {
            'firstName': {
              'S': body.firstName
            },
            'lastName': {
              'S': body.LastName
            }
          },
          ExpressionAttributeNames: {
            '#B': 'bio'
          },
          ExpressionAttributeValues: {
            ':b': {
              'SS': !!body.bio ? body.bio : ['']
            }
          },
          UpdateExpression: 'SET #B = :b',
          ReturnValues: 'ALL_NEW'
        };
        const res = await ddb.updateItem(params).promise();
        callback(null, {
          statusCode: 200,
          body: JSON.stringify({})
        })
      }
    } catch (err) {
      console.log(err);
      callback('There was an error updating Engineer table');
    }
  }
};

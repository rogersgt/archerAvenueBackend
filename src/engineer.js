'use strict';
import 'babel-polyfill';
import * as auth from './toolbox/auth';
import { handleBody } from './toolbox/validator';
import { DynamoDB } from 'aws-sdk';
import { getTokenFromEvent } from './toolbox/shaper';
import success from './responses/success';
import unauthorized from './responses/unauthorized';
import badRequest from './responses/badRequest';

const ddb = new DynamoDB({ apiVersion: '2012-08-10' });

module.exports.getEngineers = async (event, context, callback) => {
  try {
    const params = {
      TableName: `${process.env.ENGINEER_TABLE}`
    };
    const res = await ddb.scan(params).promise();

    callback(null, success(res));
  } catch (err) {
    console.log(err);
    callback('There was an error retrieving engineer data');
  }
};

module.exports.getEngineer = async (event, context, callback) => {
  try {
    console.log(event);
    if (event.pathParameters && event.pathParameters.lastName) {
      const params = {
        Key: {
          'lastName': {
            'S': event.pathParameters.lastName
          }
        },
        TableName: `${process.env.ENGINEER_TABLE}`
      };
      const res = await ddb.getItem(params).promise();
      console.log(res);
  
      callback(null, success(res));
    } else {
      callback(null, badRequest('Bad Request.'));
    }
  } catch (error) {
    callback(error);
  }
};

module.exports.updateEngineer = async (event, context, callback) => {
  const token = getTokenFromEvent(event);
  if (!auth.tokenIsValid(token)) {
    callback(null, unauthorized());
  } else {
    try {
      const body = handleBody(event.body);
      if (!body.firstName || !body.lastName) {
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
              'S': body.lastName
            }
          },
          ExpressionAttributeNames: {
            '#B': 'bio'
          },
          ExpressionAttributeValues: {
            ':b': {
              'SS': !!body.bio ? body.bio : []
            }
          },
          UpdateExpression: 'SET #B = :b',
          ReturnValues: 'ALL_NEW'
        };
        const res = await ddb.updateItem(params).promise();
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(res),
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        })
      }
    } catch (err) {
      console.log(err);
      callback('There was an error updating Engineer table');
    }
  }
};

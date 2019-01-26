'use strict';
import 'babel-polyfill';
import * as auth from './toolbox/auth';
import { handleBody } from './toolbox/validator';
import { DynamoDB } from 'aws-sdk';
import {
  getTokenFromEvent,
  shapeDynamoResponseForEngineers,
  shapeDynamoResponseForEngineer
} from './toolbox/shaper';
import success from './responses/success';
import unauthorized from './responses/unauthorized';
import badRequest from './responses/badRequest';

const ddb = new DynamoDB({ apiVersion: '2012-08-10' });

module.exports.getEngineers = async (event, context, callback) => {
  try {
    const params = {
      TableName: `${process.env.ENGINEER_TABLE}`
    };
    const { Items:engineers = [] } = await ddb.scan(params).promise();
    const shapedEngineers = shapeDynamoResponseForEngineers(engineers);
    callback(null, success(shapedEngineers));
  } catch (err) {
    console.log(err);
    callback('There was an error retrieving engineer data');
  }
};

module.exports.getEngineer = async (event, context, callback) => {
  try {
    const { pathParameters } = event;
    if (pathParameters && pathParameters.lastname && pathParameters.firstname) {
      const { firstname, lastname } = pathParameters;
      const params = {
        Key: {
          'lastName': {
            'S': lastname
          },
          'firstName': {
            'S': firstname
          }
        },
        TableName: `${process.env.ENGINEER_TABLE}`
      };
      const { Item:engineer = {} } = await ddb.getItem(params).promise();  
      const shapedEng = shapeDynamoResponseForEngineer(engineer);
      callback(null, success(shapedEng));
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

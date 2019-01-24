'use strict';
import 'babel-polyfill';
import { handleBody } from './toolbox/validator';
import * as auth from './toolbox/auth';
import { DynamoDB } from 'aws-sdk';
import { getTokenFromEvent } from './toolbox/shaper';
import badRequest from './responses/badRequest';
import success from './responses/success';
import unauthorized from './responses/unauthorized';

const ddb = new DynamoDB({ apiVersion: '2012-08-10' });

// ------------- lambda export ---------------- //
module.exports.login = async function(event, context, callback) {
  const body = handleBody(event.body);

  if (!body || !body.username || !body.password) {
    callback(null, badRequest('Bad Request. Include username and password.'));
  }

  const params = {
    Key: {
      'username': {
        S: body.username
      }
    },
    TableName: process.env.LOGIN_TABLE
  };
  try {
    const dynamoRes = await ddb.getItem(params).promise();
    if (!dynamoRes || !dynamoRes.Item) {
      callback(null, {
        body: JSON.stringify({ errorMessage: 'Username or password is incorrect' }),
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
    });
    } else {
      const hashedPasswordAttempt = auth.hashPassword(body.password);
      if (hashedPasswordAttempt === dynamoRes.Item.password.S) {
        const token = auth.genToken(body.username);
        /* Return request body { token: 'ajwttoken' } */
        callback(null, success());
      } else {
        callback(null, {
          statusCode: 403,
          body: JSON.stringify({ errorMessage: 'Username or password is incorrect' }),
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }
  } catch(err) {
    console.log(err);
    callback(err);
  }
};


module.exports.changePassword = async (event, context, callback) => {
  try {
    const body = handleBody(event.body);
    const token = getTokenFromEvent(event);
    if (!auth.tokenIsValid(token)) {
      callback(null, unauthorized());
    } else if (!body.username || !body.oldPassword || !body.newPassword) {
      callback(null, badRequest())
    } else {
      const searchParams = {
        Key: {
          'username': {
            S: body.username
          }
        },
        TableName: process.env.LOGIN_TABLE
      };
      const res = await ddb.getItem(searchParams).promise();
      if (!res || !res.Item || !res.Item.username) {
        callback(null, unauthorized('User not found.'));
      }
      const hashedOldPassword = auth.hashPassword(body.oldPassword);
      if (hashedOldPassword !== res.Item.password['S']) {
        callback(null, unauthorized());
      } else {
        const updateParams = {
          ExpressionAttributeNames: {
            '#P': 'password'
          },
          ExpressionAttributeValues: {
            ':npw': {
              S: auth.hashPassword(body.newPassword)
            }
          },
          UpdateExpression: 'SET #P = :npw',
          Key: {
            'username': {
              S: body.username
            }
          },
          TableName: process.env.LOGIN_TABLE
        }
        await ddb.updateItem(updateParams).promise();
        callback(null, success());
      }
    }
  } catch (err) {
    console.log(err);
    callback(err);
  }
};
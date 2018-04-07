'use strict';
import 'babel-polyfill';
import { handleBody } from './toolbox/validator';
import * as auth from './toolbox/auth';
import { DynamoDB } from 'aws-sdk';

const ddb = new DynamoDB({ apiVersion: '2012-08-10' });

// ------------- lambda export ---------------- //
module.exports.login = async function(event, context, callback) {
  const body = handleBody(event.body);

  if (!body || !body.username || !body.password) {
    callback('Must include a username and password', { eventStatus: 400 });
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
      callback('No user found');
    }

    const hashedPasswordAttempt = auth.hashPassword(body.password);
    if (hashedPasswordAttempt === dynamoRes.Item.password.S) {
      const token = auth.genToken(body.username);

      callback(null, {
        statusCode: 204,
        headers: {
          'Set-Cookie': `${process.env.TOKEN_NAME}=${token}`
        }
      });
    } else {
      callback(null, {
        statusCode: 403,
        body: JSON.stringify({ errorMessage: 'Username or password is incorrect' })
      });
    }
  } catch(err) {
    console.log(err);
    callback(err);
  }
};


module.exports.changePassword = async (event, context, callback) => {
  try {
    if (!auth.tokenIsValid(event.headers[process.env.TOKEN_NAME])) {
      callback(null, {
        statusCode: 403,
        body: JSON.stringify({ errorMessage: 'Unauthorized' })
      });
    }
    
    callback(null, { statusCode: 204 });
  } catch (err) {
    console.log(err);
    callback(err);
  }
};
'use strict';
import 'babel-polyfill';
import crypto from 'crypto';
import { DynamoDB } from 'aws-sdk';

const ddb = new DynamoDB({ apiVersion: '2012-08-10' });

function handleBody(body) {
  if (typeof body === 'string') {
    return JSON.parse(body);
  }
  return body;
}

function hashPassword(password){
  const hash = crypto.createHmac('sha512', process.env.HASH_STRING);
  hash.update(password);
  return hash.digest('hex');
}

module.exports.login = async function(event, context, callback) {
  const body = handleBody(event.body);

  if (!body || !body.username || !body.password) {
    callback('Must include a username and password');
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

    const hashedPasswordAttempt = hashPassword(body.password);
    if (hashedPasswordAttempt === dynamoRes.Item.password.S) {
      callback(null, {
        statusCode: 204,
        body: JSON.stringify(dynamoRes),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': '*'
        }
      });
    } else {
      callback('Username or password is incorrect');
    }
  } catch(err) {
    console.log(err);
    callback(err);
  }
};

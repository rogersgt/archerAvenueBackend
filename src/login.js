'use strict';
import 'babel-polyfill';
import { handleBody } from './toolbox/validator';
import * as auth from './toolbox/auth';
import { DynamoDB } from 'aws-sdk';
import { getTokenFromEvent } from './toolbox/shaper';

const ddb = new DynamoDB({ apiVersion: '2012-08-10' });

// ------------- lambda export ---------------- //
module.exports.login = async function(event, context, callback) {
  const body = handleBody(event.body);

  if (!body || !body.username || !body.password) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ errorMessage: 'Bad Request. Include username and password.' }),
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
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
    } else {
      const hashedPasswordAttempt = auth.hashPassword(body.password);
      console.log(dynamoRes);
      if (hashedPasswordAttempt === dynamoRes.Item.password.S) {
        const token = auth.genToken(body.username);

        callback(null, {
          statusCode: 200,
          body: JSON.stringify({
            token
          }),
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        });
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
      callback(null, {
        statusCode: 403,
        body: JSON.stringify({ errorMessage: 'Unauthorized' })
      });
    } else if (!body.username || !body.oldPassword || !body.newPassword) {
      callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          errorMessage: 'Bad request. Must include: [username, oldPassword, newPassword]'
        })
      })
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
        callback(null, {
          statusCode: 403,
          body: JSON.stringify({ errorMessage: 'User not found.' })
        });
      }
      const hashedOldPassword = auth.hashPassword(body.oldPassword);
      if (hashedOldPassword !== res.Item.password['S']) {
        callback(null, {
          statusCode: 403,
          body: JSON.stringify({
            errorMessage: 'Unauthorized.'
          })
        });
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
        callback(null, { statusCode: 204 });
      }
    }
  } catch (err) {
    console.log(err);
    callback(err);
  }
};
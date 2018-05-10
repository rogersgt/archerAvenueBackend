'use strict';
import 'babel-polyfill';
import * as auth from './toolbox/auth';
import { handleBody } from './toolbox/validator';
import { DynamoDB } from 'aws-sdk';
import { getTokenFromEvent } from './toolbox/shaper';

const ddb = new DynamoDB({ apiVersion: '2012-08-10' });

module.exports.updateGear = async (event, context, callback) => {
  const token = getTokenFromEvent(event);

  if (!auth.tokenIsValid(token)) {
    callback(null, {
      statusCode: 403,
      body: JSON.stringify({ errorMessage: 'Unauthorized.' })
    });
  } else {
    try {
      const body = handleBody(event.body);
      if (!body.name || !body.type) {
        callback(null, {
          statusCode: 400,
          body: JSON.stringify({
            errorMessage: 'Request body must contain name and type'
          })
        });
      } else {
        if (!body.name || !body.type) {
          callback(null, {
            statusCode: 400,
            body: JSON.stringify({
              errorMessage: 'Request body must contain body and type.'
            })
          });
        } else {
          const params = {
            TableName: process.env.GEAR_TABLE,
            Key: {
              'name': {
                'S': body.name
              },
              'type': {
                'S': body.type
              }
            },
            ExpressionAttributeNames: {
              '#I': 'image'
            },
            ExpressionAttributeValues: {
              ':i': {
                'S': !!body.image ? body.image : ''
              }
            },
            UpdateExpression: 'SET #I = :i',
            ReturnValues: 'ALL_NEW'
          };
          const res = await ddb.updateItem(params).promise();
          callback(null, {
            statusCode: 200,
            body: JSON.stringify(res)
          });
        }
      }
    } catch (err) {
      console.log(err);
      callback('There was an error updating the Gear table');
    }
  }
};

module.exports.getGear = async (event, context, callback) => {
  try {
    const params = {
      TableName: `${process.env.GEAR_TABLE}`
    };
    const res = await ddb.scan(params).promise();
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(res)
    });
  } catch (error) {
    console.log(error);
    callback('There was an error getting data from the Gear table');
  }
};


module.exports.addGear = async (event, context, callback) => {
  const token = getTokenFromEvent(event);

  if (!auth.tokenIsValid(token)) {
    callback(null, {
      statusCode: 403,
      body: JSON.stringify({
        errorMessage: 'Unauthorized.'
      })
    });
  } else {
    try {
      const body = handleBody(event.body);
      if (!body.name || !body.type) {
        callback(null, {
          statusCode: 400,
          body: JSON.stringify({
            errorMessage: 'Request body must contain name and type'
          })
        });
      } else {
        const params = {
          TableName: `${process.env.GEAR_TABLE}`,
          Item: {
            'name': {
              'S': body.name
            },
            'type': {
              'S': body.type
            }
          },
          ReturnConsumedCapacity: 'TOTAL'
        };
        const res = await ddb.putItem(params).promise();
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(res)
        });
      }
    } catch (error) {
      console.log(error);
      callback('There was an error adding gear to the Gear table.');
    }
  }
};

module.exports.deleteGear = async (event, context, callback) => {
  const token = getTokenFromEvent(event);

  if (!auth.tokenIsValid(token)) {
    callback(null, {
      statusCode: 403,
      body: JSON.stringify({
        errorMessage: 'Unauthorized.'
      })
    });
  } else {
    const body = handleBody(event.body);
      if (!body.name || !body.type) {
        callback(null, {
          statusCode: 400,
          body: JSON.stringify({
            errorMessage: 'Request body must contain name and type'
          })
        });
      } else {
        try {
          const params = {
            TableName: `${process.env.GEAR_TABLE}`,
            Key: {
              'name': {
                S: body.name
              },
              'type': {
                S: body.type
              }
            }
          };
          await ddb.deleteItem(params).promise();
          callback(null, {
            statusCode: 200
          });
        } catch (error) {
          console.log(error);
          callback('There was an error deleting item from Gear Table.');
        }
      }
  }
};

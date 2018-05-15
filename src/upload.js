'use strict';
import 'babel-polyfill';
import { S3 } from 'aws-sdk';
import * as auth from './toolbox/auth';
import { getTokenFromEvent } from './toolbox/shaper';

module.exports.uploadFile = (event, context, callback) => {
  try {
    const token = getTokenFromEvent(event);
    const validToken = auth.tokenIsValid(token);

    if (!validToken) {
      callback(null, {
        statusCode: 403
      });
    } else {
      console.log(event.body);
      callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  } catch (e) {
    console.log(e);
    callback(e);
  }
};

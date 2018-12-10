'use strict';
import 'babel-polyfill';
import { SES } from 'aws-sdk';

const ses = new SES({ apiVersion: '2010-12-01' });

function messageIsGood(body) {
  if (!!body && !!body.subject && !!body.message && !!body.email) {
    return true;
  }
  return false;
}

function handleBody(body) {
  return typeof body === 'string' ? JSON.parse(body) : body;
}

module.exports.mail = async function(event, context, callback) {
  const data = handleBody(event.body);
  const goodRequest = messageIsGood(data);

  if (goodRequest) {
    const emailParams = {
      Source: `Archer Avenue Studio <${process.env.FROM_EMAIL}>`,
      Message: {
        Body: {
          Text: {
            Data: `${data.message}` + `\nReply To: ${data.email}`,
            Charset: 'UTF-8'
          }
        },
        Subject: {
          Data: `From Contact Form: ${data.subject}`,
          Charset: 'UTF-8'
        }
      },
      Destination: {
        ToAddresses: [process.env.TO_EMAIL]
      },
      ReplyToAddresses: [data.email]
    };

    await ses.sendEmail(emailParams).promise();

    callback(null, {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }
    });

  } else {
    callback('Invalid request body');
  }
};



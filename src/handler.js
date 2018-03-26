'use strict';
import 'babel-polyfill';
import AWS from 'aws-sdk';

const ses = new AWS.SES({
  apiVersion: '2010-12-01',
  region: process.env.AWS_REGION || 'us-east-1'
});

const ddb = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION || 'us-east-1'
});

function messageIsGood(body) {
  if (!!body && !!body.subject && !!body.message && !!body.email) {
    return true;
  }
  return false;
}

module.exports.mail = async function(event, context, callback) {
  const data = JSON.parse(event.body);
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

    const sesResponse = await ses.sendEmail(emailParams).promise();

    callback(null, {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': '*'
      }
    });

  } else {
    callback('Invalid request body');
  }
};

module.exports.login = async function(event, context, callback) {
  const params = {
    Key: {
      'username': {
        S: event.body.username
      }
    },
    TableName: 'Logins'
  };
  const dynamoRes = await ddb.getItem(params).promise();
  console.log(dynamoRes);
};

import { SES } from 'aws-sdk';

const ses = new AWS.SES({
  apiVersion: '2010-12-01',
  region: process.env.AWS_REGION || 'us-east-1'
});

function messageIsGood(body) {
  if (!!body && !!body.subject && !!body.message && !!body.email) {
    return true;
  }
  return false;
}

export default async function mail(event, context, callback) {
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
}
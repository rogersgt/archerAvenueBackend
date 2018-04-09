import crypto from 'crypto';
import { DynamoDB } from 'aws-sdk';

const env = require(`${__dirname}/env.json`);

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.log('ERROR: Pass username and password as arguments');
  process.exit(1);
}

for (const prop in env) {
  process.env[prop] = env[prop];
}

const ddb = new DynamoDB({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION || 'us-east-1'
});

function hashPassword(password){
  const hash = crypto.createHmac('sha512', process.env.HASH_STRING);
  hash.update(password);
  return hash.digest('hex');
}

(async function addUser() {
  const parameters = {
    Item: {
      'username': {
        'S': username
      },
      'password': {
        'S': hashPassword(password)
      }
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: process.env.LOGIN_TABLE
  };
  const res = await ddb.putItem(parameters).promise();
  console.log(res);
})();
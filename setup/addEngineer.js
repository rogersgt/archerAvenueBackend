import { DynamoDB } from 'aws-sdk';

const firstName = process.argv[2];
const lastName = process.argv[3];

const ddb = new DynamoDB({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION || 'us-east-1'
});

if (!firstName || ! lastName) {
  console.log(`Invalid values for firstName: ${firstName}, lastName: ${lastName}`);
  process.exit(1);
}

(async function addEngineer() {
  const params = {
    Item: {
      'firstName': {
        'S': firstName
      },
      'lastName': {
        'S': lastName
      }
    },
    TableName: process.env.ENGINEER_TABLE,
    ReturnConsumedCapacity: 'TOTAL'
  };

  try {
    const res = await ddb.putItem(params).promise();
    console.log(res);
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
})();
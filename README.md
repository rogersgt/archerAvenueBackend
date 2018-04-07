# Archer Avenue Studio API
The Backend for https://github.com/rogersgt/archeravenuestudio
### Tests
Use `yarn test` to invoke mochai/chai tests. Create a `.env` for tests with the following:
* FROM_EMAIL='some email address'
* TO_EMAIL='some email address'
* AWS_REGION='some region like us-east-1'
* AWS_ACCESS_KEY_ID='your access key'
* AWS_SECRET_ACCESS_KEY='your secret key'
* HASH_STRING='somerandomstring
* LOGIN_TABLE='DynamoDBTableName'

### Deploy
Create a `env.json` file with at least the following:
```bash
{
  "FROM_EMAIL": "someVerifiedEmail@address.com",
  "TO_EMAIL": "someVerifiedEmail@address.com",
  "NODE_ENV": "development",
  "HASH_STRING": "anyStringForHashingPasswords",
  "LOGIN_TABLE": "nameOfADynamoDBtableToCreate",
  "AWS_REGION": "us-east-1",
  "JWT_SECRET": "anyStringForSigningTokens",
  "TOKEN_NAME": "anyStringToNameJWTCookies"
}
```

Use `yarn deploy:dev` or `yarn deploy:prod`.

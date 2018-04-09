# Archer Avenue Studio API
The Backend for https://github.com/rogersgt/archeravenuestudio
### Unit Tests
Use `yarn test` to invoke mochai/chai tests. Create a `unit.env` for tests with the following:
* FROM_EMAIL='some email address'
* TO_EMAIL='some email address'
* AWS_REGION='some region like us-east-1'
* AWS_ACCESS_KEY_ID='your access key'
* AWS_SECRET_ACCESS_KEY='your secret key'
* HASH_STRING='somerandomstring

### Local e2e Tests
* In order to have AWS permissions locally, create a `e2e.env` file with the following:
```bash
export AWS_ACCESS_KEY_ID=<public access key>
export AWS_SECRET_ACCESS_KEY=<secret access key>
export AWS_REGION=<aws region>
```
* Use `yarn test:<functionName>` to invoke local, e2e tests. 

### Deploy
Create a `env.json` file with at least the following:
```bash
{
  "FROM_EMAIL": "someVerifiedEmail@address.com",
  "TO_EMAIL": "someVerifiedEmail@address.com",
  "NODE_ENV": "development",
  "HASH_STRING": "anyStringForHashingPasswords",
  "AWS_REGION": "us-east-1",
  "JWT_SECRET": "anyStringForSigningTokens",
  "TOKEN_NAME": "anyStringToNameJWTCookies"
}
```

Use `yarn deploy:dev` or `yarn deploy:prod`.


#### Set up
Use the tools in `setup/` to create logins and setup a fresh deployment.
```bash
# this adds a username "grady" to the Logins table with a password of "bacon123"
babel-node setup/addUser.js grady bacon123
```
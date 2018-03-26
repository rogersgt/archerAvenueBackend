import 'babel-polyfill';
import dotenv from 'dotenv';
import chai from 'chai';
import spies from 'chai-spies';
import sut from '../dist/handler';

chai.use(spies);
const expect = chai.expect;
const should = chai.should;

dotenv.config({ path: `${__dirname}/../.env` });

describe('e2e: sendEmail', () => {
  it('Should invoke the callback function', async () => {
    const emailMessage = {
      email: 'test@email.com',
      subject: 'Test',
      message: 'This is the email body.'
    };
    const eventStub = {
      body: JSON.stringify(emailMessage)
    };
    const contextStub = {};
    const callBackStub = chai.spy();
    await sut.mail(eventStub, contextStub, callBackStub);
    expect(callBackStub).called();
  });
});



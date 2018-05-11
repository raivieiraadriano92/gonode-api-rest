const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const nodemailer = require('nodemailer');

const transport = {
  sendMail: sinon.spy(),
};

sinon.stub(nodemailer, 'createTransport').returns(transport);

const { expect } = chai;

chai.use(chaiHttp);

const app = require('../../index');
const factory = require('../factories');

const User = mongoose.model('User');

describe('Authentication', () => {
  beforeEach(async () => {
    await User.remove();
  });

  describe('Sing up', () => {
    it('it should be able to sing up', async () => {
      const user = await factory.attrs('User');

      const response = await chai.request(app)
        .post('/api/singup')
        .send(user);

      expect(response.body).to.have.property('user');
      expect(response.body).to.have.property('token');
      expect(transport.sendMail.calledOnce).to.be.true;
    });

    it('it should not be able to sing up with duplicates', async () => {
      const user = await factory.create('User');
      const user2 = await factory.attrs('User', { email: user.email });

      const response = await chai.request(app)
        .post('/api/singup')
        .send(user2);

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('error');
    });
  });

  describe('Sing in', () => {
    it('it should be able to authenticate with valid credentials', async () => {
      const user = await factory.create('User', { password: '123' });

      const response = await chai.request(app)
        .post('/api/singin')
        .send({ email: user.email, password: '123' });

      expect(response.body).to.have.property('user');
      expect(response.body).to.have.property('token');
    });

    it('it should not be able to singin with nonexistent user', async () => {
      const response = await chai.request(app)
        .post('/api/singin')
        .send({ email: 'a@a', password: '123' });

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('error');
    });

    it('it should not be able to singin with invalid password', async () => {
      const user = await factory.create('User', { password: '1234' });

      const response = await chai.request(app)
        .post('/api/singin')
        .send({ email: user.email, password: '123' });

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('error');
    });
  });
});

const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { expect } = chai;

chai.use(chaiHttp);

const app = require('../../index');
const factory = require('../factories');

const User = mongoose.model('User');
const Tweet = mongoose.model('Tweet');

describe('User', () => {
  beforeEach(async () => {
    await User.remove();
  });

  it('it should be able get informations the user logged', async () => {
    const user = await factory.create('User');
    const jwtToken = user.generateToken();

    await factory.create('Tweet', { user: user.id });

    const response = await chai.request(app)
      .get('/api/feed')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send();

    expect(response.body).to.have.length.above(0);
  });

  it('it should be able get feed the user logged', async () => {
    const user = await factory.create('User');
    const jwtToken = user.generateToken();

    const response = await chai.request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send();

    expect(response.body).to.have.property('user');
    expect(response.body).to.have.property('tweetCount');
    expect(response.body).to.have.property('followersCount');
    expect(response.body).to.have.property('followingCount');
  });

  it('it should be able update informations of the user logged', async () => {
    const user = await factory.create('User');
    const jwtToken = user.generateToken();

    const user2 = await factory.attrs('User');
    user2.confirmPassword = user2.password;

    const response = await chai.request(app)
      .put('/api/users')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(user2);

    expect(response.body).to.have.property('_id');
  });

  it('should not be able to update password without confirming password', async () => {
    const user = await factory.create('User');
    const jwtToken = user.generateToken();

    const user2 = await factory.attrs('User');

    const response = await chai.request(app)
      .put('/api/users')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(user2);

    expect(response).to.have.status(400);
    expect(response.body).to.have.property('error');
  });
});

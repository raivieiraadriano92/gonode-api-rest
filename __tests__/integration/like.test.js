const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { expect } = chai;

chai.use(chaiHttp);

const app = require('../../index');
const factory = require('../factories');

const User = mongoose.model('User');
const Tweet = mongoose.model('Tweet');

describe('Like', () => {
  beforeEach(async () => {
    await User.remove();
    await Tweet.remove();
  });

  it('it should be able to like an tweet', async () => {
    const tweet = await factory.create('Tweet');

    const user = await factory.create('User');
    const jwtToken = user.generateToken();

    const response = await chai.request(app)
      .post(`/api/like/${tweet.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send();

    expect(response.body.likes).to.include(user.id);
  });

  it('it should validate if tweet not exist', async () => {
    const user = await factory.create('User');
    const jwtToken = user.generateToken();

    const response = await chai.request(app)
      .post(`/api/like/${user.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send();

    expect(response).to.have.status(400);
    expect(response.body).to.have.property('error');
  });

  it('it should be able to disgust an tweet', async () => {
    const user = await factory.create('User');
    const jwtToken = user.generateToken();

    const tweet = await factory.create('Tweet', { likes: [user.id] });

    const response = await chai.request(app)
      .post(`/api/like/${tweet.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send();

    expect(response.body.likes).to.be.an('array').that.does.not.include(user.id);
  });
});

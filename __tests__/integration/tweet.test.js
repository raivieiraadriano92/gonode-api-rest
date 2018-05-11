const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { expect } = chai;

chai.use(chaiHttp);

const app = require('../../index');
const factory = require('../factories');

const User = mongoose.model('User');
const Tweet = mongoose.model('Tweet');

describe('Tweet', () => {
  beforeEach(async () => {
    await User.remove();
    await Tweet.remove();
  });

  it('it should be able to created an tweet', async () => {
    const tweet = await factory.attrs('Tweet');

    const user = await factory.create('User');
    const jwtToken = user.generateToken();

    const response = await chai.request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(tweet);

    expect(response.body).to.have.property('_id');
  });

  it('it should be able destroy an tweet', async () => {
    const tweet = await factory.create('Tweet');

    const user = await factory.create('User');
    const jwtToken = user.generateToken();

    const response = await chai.request(app)
      .delete(`/api/tweets/${tweet.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send();

    expect(response).to.have.status(200);
  });
});

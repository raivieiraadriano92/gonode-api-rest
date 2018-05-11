const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { expect } = chai;

chai.use(chaiHttp);

const app = require('../../index');
const factory = require('../factories');

const User = mongoose.model('User');

describe('Followers', () => {
  beforeEach(async () => {
    await User.remove();
  });

  describe('Follow', () => {
    it('should not be able to follow a non-existent user', async () => {
      const user = await factory.create('User');
      const jwtToken = user.generateToken();

      const user2 = await factory.create('User');
      await User.findByIdAndRemove(user2.id);

      const response = await chai.request(app)
        .post(`/api/follow/${user2.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send();

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('error');
    });

    it('should not be able to follow a user who is already following', async () => {
      const user = await factory.create('User');
      const jwtToken = user.generateToken();

      const userFollow = await factory.create('User', { followers: [user.id] });

      const response = await chai.request(app)
        .post(`/api/follow/${userFollow.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send();

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('error');
    });

    it('should be able to follow a user', async () => {
      const user = await factory.create('User');
      const jwtToken = user.generateToken();

      const userFollow = await factory.create('User');

      const response = await chai.request(app)
        .post(`/api/follow/${userFollow.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send();

      expect(response.body).to.have.property('_id');
    });
  });

  describe('Follow', () => {
    it('should not be able to unfollow a non-existent user', async () => {
      const user = await factory.create('User');
      const jwtToken = user.generateToken();

      const user2 = await factory.create('User');
      await User.findByIdAndRemove(user2.id);

      const response = await chai.request(app)
        .delete(`/api/unfollow/${user2.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send();

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('error');
    });

    it('should not be able to stop following a user who is not following', async () => {
      const user = await factory.create('User');
      const jwtToken = user.generateToken();

      const user2 = await factory.create('User');

      const response = await chai.request(app)
        .delete(`/api/unfollow/${user2.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send();

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('error');
    });

    it('should be able to unfollow a user', async () => {
      const user = await factory.create('User');
      const jwtToken = user.generateToken();

      const userFollow = await factory.create('User', { followers: [user.id] });

      const response = await chai.request(app)
        .delete(`/api/unfollow/${userFollow.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send();

      expect(response.body).to.have.property('_id');
    });
  });
});

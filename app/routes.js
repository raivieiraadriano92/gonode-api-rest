const express = require('express');
const requireDir = require('require-dir');

const routes = express.Router();

const controllers = requireDir('./controllers');

const authMiddleware = require('./middlewares/auth');

/**
 * Auth
 */
routes.post('/singin', controllers.authController.singin);
routes.post('/singup', controllers.authController.singup);

/**
 * Auth routes
 */
routes.use(authMiddleware);

/**
 * Tweets
 */
routes.post('/tweets', controllers.tweetController.create);
routes.delete('/tweets/:id', controllers.tweetController.destroy);

/**
 * Users
 */
routes.put('/users', controllers.userController.update);

module.exports = routes;

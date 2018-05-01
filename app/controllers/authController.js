const mongoose = require('mongoose');
const sendMail = require('../services/mailer');

const User = mongoose.model('User');

module.exports = {
  async singin(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ erro: 'User not found' });
      }

      if (!await user.compareHash(password)) {
        return res.status(400).json({ erro: 'Invalid password' });
      }

      return res.json({
        user,
        token: user.generateToken(),
      });
    } catch (err) {
      return next(err);
    }
  },
  async singup(req, res, next) {
    try {
      const { email, username } = req.body;

      if (await User.findOne({ $or: [{ email }, { username }] })) {
        return res.status(400).json({ error: 'User already exist' });
      }

      const user = await User.create(req.body);

      sendMail({
        from: 'Raí Vieira Adriano <raivieiraadriano92@gmail.com>',
        to: user.email,
        subject: 'Bem-vindo ao RocketTwitter',
        template: 'auth/register',
        context: {
          name: user.name,
          username: user.username,
        },
      });

      return res.json({
        user,
        token: user.generateToken(),
      });
    } catch (err) {
      return next(err);
    }
  },
};

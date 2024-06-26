const bcrypt = require('bcrypt');
const { User } = require('../db/models');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
  try {
    const { name, lastName, email, password } = req.body.data;
    if (!name) {
      res
        .status(400)
        .json('/////////////////asdfsfsdfsdf')
        .send({ error: 'Password is required' });
    }
    const hash = await bcrypt.hash(password, 10);
    const data = {
      name,
      lastName,
      email,
      password: hash,
    };

    const user = await User.create(data);

    if (user) {
      let token = jwt.sign({ id: user.id }, process.env.secretKey, {
        expiresIn: 1 * 24 * 60 * 60 * 1000,
      });
      res.cookie('jwt', token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
      console.log('user', JSON.stringify(user, null, 2));
      console.log('token', token);
      return res.status(201).send(user);
    } else {
      return res.status(409).send('Details are not correct');
    }
  } catch (e) {
    console.log(e);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body.data;
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (user) {
      const isSame = await bcrypt.compare(password, user.password);
      if (isSame) {
        let token = jwt.sign({ id: user.id }, process.env.secretKey, {
          expiresIn: 1 * 24 * 60 * 60 * 1000,
        });
        res.cookie('jwt', token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
        console.log('user', JSON.stringify(user, null, 2));
        console.log(token);
        return res.status(201).send(user);
      } else {
        return res.status(401).send('Authentication failed');
      }
    } else {
      return res.status(401).send('Authentication failed');
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  signup,
  login,
};

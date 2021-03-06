'use strict';
const User = require('../models/user');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

async function createUser(req, res) {
    const { user: userBody } = req.body;

    if (!userBody) {
        res.json({
            error: ['Userbody is undefined!']
        });
        return;
    }

    const user = new User(
      _.pick(userBody, ['email', 'name', 'lastName', 'password', 'company']));

    await user.hashPassword();

    await user.save();

    res.json(user);
}

async function updateUser(req, res) {
    const { user: userBody, userId } = req.body;

    const user = await User.findById(userId);

    const userProperties
    = _.pick(userBody, ['email', 'name', 'lastName', 'password', 'company']);

    _.mapKeys(userProperties, (value, key) => user[key] = value);

    await user.save();
}

async function deleteUser({ email }) {
    const user = await User.findOne({ email });

    if (!user) {
    throw new Error('There is no user with such email');
    }

    await user.remove();
}

async function authenticateUser(req, res) {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);

    console.log(user);

    if (!user) {
        return res.json({
            error: 'User with such email not found!',
            success: false
        });
    }

    const validPassword = await user.isValidPassword(password);

    if (!validPassword) {
        return res.json({
            error: 'Password or email is not valid!',
            success: false
        });
    }

    const token = jwt.sign(user, process.env.SECRET, {
        expiresIn: 604800
    });

    res.json({
        success: true,
        token: 'JWT ' + token,
        user: {
            id: user._id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            company: user.company
        }
    })
}

module.exports.createUser = createUser;
module.exports.updateUser = updateUser;
module.exports.deleteUser = deleteUser;
module.exports.authenticateUser = authenticateUser;

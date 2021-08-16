const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = new express.Router();

router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save(user);
    const token = await user.generateAuthToken();
    return res.status(201).send({ user, token });
  } catch (err) {
    return res.send(err);
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (err) {
    res.status(400).send();
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
    await req.user.save();

    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

router.post('/users/logoutall', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (err) {
    return res.status(500).send();
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).send();

    return res.send(user);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.patch('/users/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  try {
    const user = await User.findById(req.params.id);

    updates.forEach((update) => { user[update] = req.body[update]; });

    await user.save();

    if (!isValidOperation) return res.status(400).send({ error: 'invalid update' });
    if (!user) return res.status(404).send();

    return res.send(user);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.status(404).send();

    return res.send(user);
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = router;

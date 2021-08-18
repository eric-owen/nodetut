/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
const express = require('express');
const multer = require('multer');
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

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) return res.status(400).send({ error: 'invalid update' });

  try {
    updates.forEach((update) => { req.user[update] = req.body[update]; });
    await req.user.save();
    return res.send(req.user);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    return res.send(req.user);
  } catch (err) {
    return res.status(500).send(err);
  }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('please upload an image'));
    }
    cb(undefined, true);
  },
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  req.user.avater = req.file.buffer;
  await req.user.save();
  res.send(req.user);
  console.log(req.file);
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message });
});

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) throw new Error();

    res.set('Content-Type', 'image/jpg');
    res.send(user.avatar);
  } catch (err) {
    res.status(404).send({ err });
  }
});

module.exports = router;

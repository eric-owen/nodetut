const express = require('express');
const Task = require('../models/task');

const router = new express.Router();

router.post('/tasks', async (req, res) => {
  const task = new Task(req.body);
  try {
    await task.save();
    return res.status(201).send(task);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({});
    return res.send(tasks);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).send();
    return res.send(task);
  } catch (err) {
    return res.status(404).send(err);
  }
});

router.patch('/tasks/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['completed', 'descritpion'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  try {
    const task = await Task.findByIdAndUpdate(req.params.id);

    updates.forEach((update) => { task[update] = req.body[update]; });

    if (!task) return res.status(404).send({ error: 'no task found', task: res.send(task) });
    if (!isValidOperation) return res.status(400).send({ error: 'invalid update' });

    return res.send(task);
  } catch (err) {
    return res.status(404).send();
  }
});

router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).send();
    return res.send(task);
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = router;

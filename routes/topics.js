const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');

// GET all topics, grouped is done client-side
router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find().sort({ section: 1, order: 1, createdAt: 1 });
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new topic
router.post('/', async (req, res) => {
  try {
    const { section, name, order } = req.body;
    if (!section || !name) {
      return res.status(400).json({ error: 'section and name are required' });
    }
    const topic = await Topic.create({ section, name, order: order || 0 });
    res.status(201).json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a topic (status and/or notes)
router.put('/:id', async (req, res) => {
  try {
    const { status, notes, name } = req.body;
    const update = {};
    if (status !== undefined) update.status = status;
    if (notes !== undefined) update.notes = notes;
    if (name !== undefined) update.name = name;

    const topic = await Topic.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a topic
router.delete('/:id', async (req, res) => {
  try {
    const topic = await Topic.findByIdAndDelete(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

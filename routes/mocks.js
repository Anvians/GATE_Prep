const express = require('express');
const router = express.Router();
const Mock = require('../models/Mock');

// GET all mocks, most recent first
router.get('/', async (req, res) => {
  try {
    const mocks = await Mock.find().sort({ date: 1 });
    res.json(mocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new mock entry
router.post('/', async (req, res) => {
  try {
    const mock = await Mock.create(req.body);
    res.status(201).json(mock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a mock entry
router.put('/:id', async (req, res) => {
  try {
    const mock = await Mock.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!mock) return res.status(404).json({ error: 'Mock not found' });
    res.json(mock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a mock entry
router.delete('/:id', async (req, res) => {
  try {
    const mock = await Mock.findByIdAndDelete(req.params.id);
    if (!mock) return res.status(404).json({ error: 'Mock not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

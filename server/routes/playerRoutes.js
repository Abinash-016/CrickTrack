const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// Get all players
router.get('/', async (req, res) => {
  try {
    const players = await Player.find().sort({ name: 1 });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new player (NO DUPLICATES)
router.post('/create', async (req, res) => {
  try {
    let { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Player name is required' });
    }

    // normalize input
    name = name.trim().toLowerCase();

    const newPlayer = new Player({ name });
    await newPlayer.save();

    res.status(201).json(newPlayer);

  } catch (error) {
    // duplicate key error (MongoDB)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Player already exists' });
    }

    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
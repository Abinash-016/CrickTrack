const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Player', PlayerSchema);

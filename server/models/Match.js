const mongoose = require('mongoose');

const BallSchema = new mongoose.Schema({
  innings: { type: Number, required: true },
  overNumber: { type: Number, required: true }, // e.g., 0 for 1st over
  ballNumber: { type: Number, required: true }, // 1, 2, 3...
  runs: { type: Number, default: 0 }, // runs off the bat
  extras: {
    type: { type: String, enum: ['none', 'wide', 'noBall', 'bye', 'legBye'], default: 'none' },
    runs: { type: Number, default: 0 }
  },
  isLegalDelivery: { type: Boolean, default: true },
  wicket: {
    isWicket: { type: Boolean, default: false },
    type: { type: String, enum: ['bowled', 'caught', 'runOut', 'stumped', 'lbw', 'hitWicket', 'none'], default: 'none' }
  }
}, { timestamps: true });

const InningsSchema = new mongoose.Schema({
  battingTeam: { type: String },
  bowlingTeam: { type: String },
  totalRuns: { type: Number, default: 0 },
  totalWickets: { type: Number, default: 0 },
  completedOvers: { type: Number, default: 0 },
  ballsInCurrentOver: { type: Number, default: 0 }, // Legal deliveries in current over
  isCompleted: { type: Boolean, default: false },
  balls: [BallSchema]
});

const MatchSchema = new mongoose.Schema({
  matchName: { type: String, required: true },
  teams: {
    teamA: { type: String, required: true },
    teamB: { type: String, required: true }
  },
  toss: {
    winner: { type: String }, // team name
    decision: { type: String, enum: ['bat', 'bowl'] }
  },
  overs: { type: Number, required: true },
  ballsPerOver: { type: Number, default: 6 },
  currentInnings: { type: Number, default: 1 }, // 1 or 2
  status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  innings: [InningsSchema], // Array to hold 1st and 2nd innings
  winner: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Match', MatchSchema);

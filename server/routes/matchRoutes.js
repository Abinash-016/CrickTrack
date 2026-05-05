const express = require('express');
const router = express.Router();
const Match = require('../models/Match');

// Create a new match
router.post('/create', async (req, res) => {
  try {
    const { matchName, teamA, teamB, teamAPlayers, teamBPlayers, overs, ballsPerOver, tossWinner, tossDecision } = req.body;
    
    // Determine batting/bowling team based on toss
    let battingTeam = teamA;
    let bowlingTeam = teamB;
    if (tossWinner) {
      if (tossDecision === 'bat') {
        battingTeam = tossWinner;
        bowlingTeam = tossWinner === teamA ? teamB : teamA;
      } else {
        bowlingTeam = tossWinner;
        battingTeam = tossWinner === teamA ? teamB : teamA;
      }
    }

    const newMatch = new Match({
      matchName,
      teams: { teamA, teamB, teamAPlayers: teamAPlayers || [], teamBPlayers: teamBPlayers || [] },
      toss: { winner: tossWinner, decision: tossDecision },
      overs,
      ballsPerOver: ballsPerOver || 6,
      status: 'in_progress',
      currentInnings: 1,
      innings: [
        {
          battingTeam,
          bowlingTeam,
          balls: []
        },
        {
          battingTeam: bowlingTeam,
          bowlingTeam: battingTeam,
          balls: []
        }
      ]
    });

    await newMatch.save();
    res.status(201).json(newMatch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all matches
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find().sort({ createdAt: -1 });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a match by ID
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a ball to a match
router.post('/:id/ball', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    
    if (match.status === 'completed') {
      return res.status(400).json({ message: 'Match is already completed' });
    }

    const { runs, extras, isLegalDelivery, wicket } = req.body;
    
    const currentInningsIndex = match.currentInnings - 1;
    const innings = match.innings[currentInningsIndex];
    
    // Determine over and ball number
    const overNumber = innings.completedOvers;
    const ballNumber = innings.ballsInCurrentOver + 1;

    const newBall = {
      innings: match.currentInnings,
      overNumber,
      ballNumber,
      runs: runs || 0,
      extras: extras || { type: 'none', runs: 0 },
      isLegalDelivery: isLegalDelivery !== undefined ? isLegalDelivery : true,
      wicket: wicket || { isWicket: false, type: 'none' }
    };

    innings.balls.push(newBall);

    // Update Innings Stats
    innings.totalRuns += (newBall.runs + newBall.extras.runs);
    if (newBall.wicket.isWicket) {
      innings.totalWickets += 1;
    }

    if (newBall.isLegalDelivery) {
      innings.ballsInCurrentOver += 1;
      
      // Check for over completion
      if (innings.ballsInCurrentOver >= match.ballsPerOver) {
        innings.completedOvers += 1;
        innings.ballsInCurrentOver = 0;
      }
    }

    // Check innings completion
    let switchInnings = false;
    let matchComplete = false;

    // All out (assuming 10 wickets) or overs completed
    if (innings.totalWickets >= 10 || innings.completedOvers >= match.overs) {
      innings.isCompleted = true;
      if (match.currentInnings === 1) {
        switchInnings = true;
      } else {
        matchComplete = true;
      }
    }
    
    // Team 2 chases down target
    if (match.currentInnings === 2) {
      const firstInningsRuns = match.innings[0].totalRuns;
      if (innings.totalRuns > firstInningsRuns) {
        innings.isCompleted = true;
        matchComplete = true;
      }
    }

    if (switchInnings) {
      match.currentInnings = 2;
    } else if (matchComplete) {
      match.status = 'completed';
      // Determine winner
      const score1 = match.innings[0].totalRuns;
      const score2 = match.innings[1].totalRuns;
      if (score1 > score2) {
         match.winner = match.innings[0].battingTeam;
      } else if (score2 > score1) {
         match.winner = match.innings[1].battingTeam;
      } else {
         match.winner = 'Tie';
      }
    }

    await match.save();
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Undo the last ball
router.post('/:id/undo', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    
    if (match.status === 'not_started') {
       return res.status(400).json({ message: 'No balls to undo' });
    }

    let currentInningsIndex = match.currentInnings - 1;
    let innings = match.innings[currentInningsIndex];
    
    if (innings.balls.length === 0 && match.currentInnings === 2) {
      match.currentInnings = 1;
      currentInningsIndex = 0;
      innings = match.innings[0];
      innings.isCompleted = false;
      match.status = 'in_progress';
      match.winner = null;
    }

    if (innings.balls.length === 0) {
      return res.status(400).json({ message: 'No balls to undo in this match' });
    }

    const lastBall = innings.balls.pop();

    // Revert innings stats
    innings.totalRuns -= (lastBall.runs + lastBall.extras.runs);
    if (lastBall.wicket.isWicket) {
      innings.totalWickets -= 1;
    }

    if (lastBall.isLegalDelivery) {
      if (innings.ballsInCurrentOver === 0) {
        innings.completedOvers -= 1;
        innings.ballsInCurrentOver = match.ballsPerOver - 1;
      } else {
        innings.ballsInCurrentOver -= 1;
      }
    }

    innings.isCompleted = false;
    match.status = 'in_progress';
    match.winner = null;

    await match.save();
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Upload winners photo
router.post('/:id/photo', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    
    if (match.status !== 'completed') {
       return res.status(400).json({ message: 'Match is not completed yet' });
    }

    if (!req.body.photo) {
       return res.status(400).json({ message: 'No photo provided' });
    }

    match.winnersPhoto = req.body.photo;
    await match.save();
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

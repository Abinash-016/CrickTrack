const STORAGE_KEY = 'crictrack_matches';

const getMatches = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveMatches = (matches) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
};

const generateId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Mock Axios API
const api = {
  get: async (url) => {
    const matches = getMatches();
    
    if (url === '/matches') {
      return { data: matches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) };
    }
    
    if (url.startsWith('/matches/')) {
      const id = url.split('/')[2];
      const match = matches.find(m => m._id === id);
      if (!match) throw { response: { data: { message: 'Match not found' } } };
      return { data: match };
    }

    throw new Error('Route not found');
  },

  post: async (url, data) => {
    let matches = getMatches();

    if (url === '/matches/create') {
      const { matchName, teamA, teamB, overs, ballsPerOver, tossWinner, tossDecision } = data;
      
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

      const newMatch = {
        _id: generateId(),
        createdAt: new Date().toISOString(),
        matchName,
        teams: { teamA, teamB },
        toss: { winner: tossWinner, decision: tossDecision },
        overs: parseInt(overs),
        ballsPerOver: parseInt(ballsPerOver) || 6,
        status: 'in_progress',
        currentInnings: 1,
        innings: [
          { battingTeam, bowlingTeam, balls: [], totalRuns: 0, totalWickets: 0, completedOvers: 0, ballsInCurrentOver: 0, isCompleted: false },
          { battingTeam: bowlingTeam, bowlingTeam: battingTeam, balls: [], totalRuns: 0, totalWickets: 0, completedOvers: 0, ballsInCurrentOver: 0, isCompleted: false }
        ]
      };

      matches.push(newMatch);
      saveMatches(matches);
      return { data: newMatch };
    }

    if (url.startsWith('/matches/') && url.endsWith('/ball')) {
      const id = url.split('/')[2];
      const matchIndex = matches.findIndex(m => m._id === id);
      if (matchIndex === -1) throw { response: { data: { message: 'Match not found' } } };
      
      let match = matches[matchIndex];
      if (match.status === 'completed') throw { response: { data: { message: 'Match is already completed' } } };

      const { runs, extras, isLegalDelivery, wicket } = data;
      const currentInningsIndex = match.currentInnings - 1;
      const innings = match.innings[currentInningsIndex];
      
      const overNumber = innings.completedOvers;
      const ballNumber = innings.ballsInCurrentOver + 1;

      const newBall = {
        _id: generateId(),
        innings: match.currentInnings,
        overNumber,
        ballNumber,
        runs: runs || 0,
        extras: extras || { type: 'none', runs: 0 },
        isLegalDelivery: isLegalDelivery !== undefined ? isLegalDelivery : true,
        wicket: wicket || { isWicket: false, type: 'none' }
      };

      innings.balls.push(newBall);

      innings.totalRuns += (newBall.runs + newBall.extras.runs);
      if (newBall.wicket.isWicket) innings.totalWickets += 1;

      if (newBall.isLegalDelivery) {
        innings.ballsInCurrentOver += 1;
        if (innings.ballsInCurrentOver >= match.ballsPerOver) {
          innings.completedOvers += 1;
          innings.ballsInCurrentOver = 0;
        }
      }

      let switchInnings = false;
      let matchComplete = false;

      if (innings.totalWickets >= 10 || innings.completedOvers >= match.overs) {
        innings.isCompleted = true;
        if (match.currentInnings === 1) switchInnings = true;
        else matchComplete = true;
      }
      
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
        const score1 = match.innings[0].totalRuns;
        const score2 = match.innings[1].totalRuns;
        if (score1 > score2) match.winner = match.innings[0].battingTeam;
        else if (score2 > score1) match.winner = match.innings[1].battingTeam;
        else match.winner = 'Tie';
      }

      matches[matchIndex] = match;
      saveMatches(matches);
      return { data: match };
    }

    if (url.startsWith('/matches/') && url.endsWith('/undo')) {
      const id = url.split('/')[2];
      const matchIndex = matches.findIndex(m => m._id === id);
      if (matchIndex === -1) throw { response: { data: { message: 'Match not found' } } };
      
      let match = matches[matchIndex];
      if (match.status === 'not_started') throw { response: { data: { message: 'No balls to undo' } } };

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
        throw { response: { data: { message: 'No balls to undo in this match' } } };
      }

      const lastBall = innings.balls.pop();

      innings.totalRuns -= (lastBall.runs + lastBall.extras.runs);
      if (lastBall.wicket.isWicket) innings.totalWickets -= 1;

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

      matches[matchIndex] = match;
      saveMatches(matches);
      return { data: match };
    }

    throw new Error('Route not found');
  }
};

export default api;

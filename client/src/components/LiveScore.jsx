import { motion } from 'framer-motion';

export default function LiveScore({ match, currentInnings }) {
  // Calculate Run Rate
  const totalBalls = (currentInnings.completedOvers * match.ballsPerOver) + currentInnings.ballsInCurrentOver;
  const currentRR = totalBalls === 0 ? 0 : (currentInnings.totalRuns / (totalBalls / 6)).toFixed(2);

  // Required Run Rate (if 2nd innings)
  let requiredRR = null;
  let targetRuns = null;
  if (match.currentInnings === 2) {
    targetRuns = match.innings[0].totalRuns + 1;
    const runsNeeded = targetRuns - currentInnings.totalRuns;
    const ballsRemaining = (match.overs * match.ballsPerOver) - totalBalls;
    requiredRR = ballsRemaining === 0 ? 0 : (runsNeeded / (ballsRemaining / 6)).toFixed(2);
  }

  // Get last 18 balls
  const allBalls = currentInnings.balls || [];
  const uniqueBalls = [];

  const seen = new Set();

  allBalls.forEach((ball) => {

    const key =
      `${ball.overNumber}-${ball.ballNumber}`;

    if (!seen.has(key)) {

      seen.add(key);

      uniqueBalls.push(ball);

    }

  });

  const recentBalls = uniqueBalls.slice(-18);

  const recentOvers = {};
  recentBalls.forEach(ball => {
    if (!recentOvers[ball.overNumber]) {
      recentOvers[ball.overNumber] = [];
    }
    recentOvers[ball.overNumber].push(ball);
  });

  const getBallBadgeColor = (ball) => {
    if (ball.wicket.isWicket) return 'bg-red-500 text-white';
    if (ball.runs === 4) return 'bg-blue-500 text-white';
    if (ball.runs === 6) return 'bg-purple-600 text-white';
    if (ball.runs === 0 && ball.extras.type === 'none') return 'bg-slate-700 text-slate-300';
    return 'bg-slate-800 border border-slate-600 text-white';
  };

  const formatBallLabel = (ball) => {
    if (ball.wicket.isWicket) return 'W';
    if (ball.extras.type !== 'none') {
      let ext = ball.extras.type === 'wide' ? 'Wd' : ball.extras.type === 'noBall' ? 'Nb' : ball.extras.type === 'bye' ? 'B' : 'Lb';
      return `${ball.runs + ball.extras.runs}${ext}`;
    }
    return ball.runs;
  };

  return (
    <div className="space-y-6">
      {/* Target info if 2nd innings */}
      {match.currentInnings === 2 && match.status !== 'completed' && (
        <div className="bg-slate-800/80 rounded-xl p-3 text-center text-sm border border-slate-700">
          <span className="text-slate-400">Target: </span>
          <span className="font-bold text-white">{targetRuns}</span>
          <span className="mx-2 text-slate-600">|</span>
          <span className="text-slate-400">Need </span>
          <span className="font-bold text-emerald-400">{targetRuns - currentInnings.totalRuns}</span>
          <span className="text-slate-400"> runs in </span>
          <span className="font-bold text-white">{(match.overs * match.ballsPerOver) - totalBalls}</span>
          <span className="text-slate-400"> balls</span>
        </div>
      )}

      {/* Main Score Board */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        <div className="text-center mb-6">
          <h3 className="text-slate-400 font-medium uppercase tracking-widest text-xs mb-1">
            {currentInnings.battingTeam} Batting
          </h3>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-6xl font-black tracking-tighter text-white">
              {currentInnings.totalRuns}
            </span>
            <span className="text-3xl text-slate-400 font-light">/</span>
            <span className="text-4xl font-bold text-red-400">
              {currentInnings.totalWickets}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-700/50 pt-4">
          <div className="text-center">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Overs</div>
            <div className="text-2xl font-bold text-white">
              {currentInnings.completedOvers}.{currentInnings.ballsInCurrentOver}
              <span className="text-sm font-normal text-slate-500 ml-1">/ {match.overs}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Run Rate</div>
            <div className="text-2xl font-bold text-white">
              {currentRR}
            </div>
          </div>
        </div>

        {match.currentInnings === 2 && requiredRR && (
          <div className="mt-4 text-center border-t border-slate-700/50 pt-3">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Required RR</div>
            <div className="text-lg font-semibold text-emerald-400">{requiredRR}</div>
          </div>
        )}
      </div>

      {/* Recent Balls */}
      <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
        <h4 className="text-xs uppercase tracking-wider text-slate-400 mb-3 font-semibold">Recent Balls</h4>
        <div className="space-y-4">
          {Object.keys(recentOvers).length === 0 ? (
            <span className="text-slate-500 text-sm">No balls bowled yet.</span>
          ) : (
            Object.keys(recentOvers).sort((a, b) => a - b).map(overNum => (
              <div key={overNum} className="flex items-center gap-3 bg-slate-800/40 p-2 rounded-xl border border-slate-700/50">
                <span className="text-xs text-slate-400 font-bold w-10 shrink-0 text-center">Ov {parseInt(overNum) + 1}</span>
                <div className="flex flex-wrap gap-2 border-l border-slate-700 pl-3">
                  {recentOvers[overNum].map((ball, idx) => (
                    <motion.div
                      key={ball._id || idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <span className="text-[10px] text-slate-400 font-medium leading-none">
                        {ball.overNumber}.{ball.ballNumber}
                      </span>
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${getBallBadgeColor(ball)}`}
                      >
                        {formatBallLabel(ball)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

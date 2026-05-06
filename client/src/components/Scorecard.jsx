import { useState, useEffect } from 'react';
import api from '../api';

export default function Scorecard({ match }) {
  const [activeInnings, setActiveInnings] = useState(match.currentInnings - 1);
  const [showPlayers, setShowPlayers] = useState(false);
  const [allPlayers, setAllPlayers] = useState([]);
  const getBallLabel = (ball) => {
    if (ball.wicket.isWicket) return 'W';
    if (ball.extras.type !== 'none') {
      let ext = ball.extras.type === 'wide' ? 'Wd' : ball.extras.type === 'noBall' ? 'Nb' : ball.extras.type === 'bye' ? 'B' : 'Lb';
      return `${ball.runs + ball.extras.runs}${ext}`;
    }
    return ball.runs;
  };

  const getBallClass = (ball) => {
    if (ball.wicket.isWicket) return 'bg-red-500 text-white border-red-600';
    if (ball.runs === 4) return 'bg-blue-500 text-white border-blue-600';
    if (ball.runs === 6) return 'bg-purple-600 text-white border-purple-700';
    if (ball.extras.type !== 'none') return 'bg-slate-700 text-slate-200 border-slate-600';
    if (ball.runs === 0) return 'bg-slate-800 text-slate-400 border-slate-700';
    return 'bg-slate-800 text-slate-200 border-slate-600';
  };

  const formatName = (name) => {
    return name
      ?.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    api.get('/players')
      .then(res => setAllPlayers(res.data))
      .catch(console.error);
  }, []);

  const addPlayerToTeam = async (playerId, team) => {
    try {

      await api.post(`/matches/${match._id}/add-player`, {
        playerId,
        team
      });

      window.location.reload();

    } catch (error) {
      console.error(error);
      alert('Failed to add player');
    }
  };

  const formatOverTracker = (balls) => {
    // Group balls by overNumber
    const overs = {};
    balls.forEach(ball => {
      if (!overs[ball.overNumber]) {
        overs[ball.overNumber] = { balls: [], runs: 0, wickets: 0, extras: 0 };
      }
      overs[ball.overNumber].balls.push(ball);
      overs[ball.overNumber].runs += (ball.runs + ball.extras.runs);
      if (ball.wicket.isWicket) overs[ball.overNumber].wickets += 1;
      if (ball.extras.type !== 'none') overs[ball.overNumber].extras += ball.extras.runs;
    });

    // Sort by over number descending (most recent first)
    return Object.keys(overs).sort((a, b) => b - a).map(overNum => {
      const overData = overs[overNum];
      return (
        <div key={overNum} className="mb-4 bg-slate-800/40 rounded-xl overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-4 py-2 flex justify-between items-center border-b border-slate-700">
            <span className="font-bold">Over {parseInt(overNum) + 1}</span>
            <div className="text-sm">
              <span className="font-semibold text-white">{overData.runs} Runs</span>
              {overData.wickets > 0 && <span className="ml-2 text-red-400">| {overData.wickets} Wkts</span>}
            </div>
          </div>
          <div className="p-4 flex flex-wrap gap-2 items-center">
            {overData.balls.map((ball, idx) => (
              <div
                key={ball._id || idx}
                className={`w-10 h-10 rounded-full flex flex-col items-center justify-center text-sm font-bold border ${getBallClass(ball)}`}
              >
                {getBallLabel(ball)}
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* Innings Tabs */}
      <div className="flex bg-slate-800 rounded-xl p-1 mb-6">
        {match.innings.map((inn, idx) => {
          if (idx > match.currentInnings - 1 && match.status !== 'completed') return null; // Don't show 2nd innings if not started yet
          return (
            <button
              key={idx}
              onClick={() => setActiveInnings(idx)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeInnings === idx ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              {inn.battingTeam} Innings
            </button>
          )
        })}
      </div>

      <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-6 shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400 text-sm">Total Score</span>
          <span className="text-2xl font-bold">{match.innings[activeInnings].totalRuns}/{match.innings[activeInnings].totalWickets}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Overs</span>
          <span className="text-lg font-semibold">{match.innings[activeInnings].completedOvers}.{match.innings[activeInnings].ballsInCurrentOver}</span>
        </div>
      </div>

      <h3 className="text-lg font-bold mb-4 ml-1">Over-by-Over Tracker</h3>
      <div className="flex justify-end">
        <button
          onClick={() => setShowPlayers(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg text-sm"
        >
          View Players
        </button>
      </div>
      <div className="space-y-4">
        {match.innings[activeInnings].balls.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-800/30 rounded-xl border border-slate-700/50">
            No balls bowled in this innings yet.
          </div>
        ) : (
          formatOverTracker(match.innings[activeInnings].balls)
        )}
      </div>
      {showPlayers && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl p-6 shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-black text-white">
                Match Players
              </h2>

              <button
                onClick={() => setShowPlayers(false)}
                className="bg-slate-800 hover:bg-slate-700 transition-colors px-4 py-2 rounded-xl text-sm font-semibold"
              >
                Close
              </button>

            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* TEAM A */}
              <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4">

                <h3 className="text-lg font-bold text-blue-400 mb-4">
                  {match.teams.teamA}
                </h3>

                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">

                  {match.teams.teamAPlayers.map((p) => (

                    <div
                      key={p._id}
                      className="flex items-center gap-3 bg-slate-900/70 hover:bg-slate-900 transition-all p-3 rounded-xl"
                    >

                      <img
                        src={p.avatar || 'https://via.placeholder.com/40'}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
                      />

                      <span className="text-white font-medium text-base">
                        {formatName(p.name)}
                      </span>

                    </div>

                  ))}
                  <select
                    onChange={(e) => addPlayerToTeam(e.target.value, 'A')}
                    className="w-full mt-3 bg-slate-900 border border-slate-700 rounded-xl p-2 text-sm"
                  >
                    <option value="">+ Add Player</option>

                    {allPlayers.map((p) => (
                      <option key={p._id} value={p._id}>
                        {formatName(p.name)}
                      </option>
                    ))}
                  </select>

                </div>
              </div>

              {/* TEAM B */}
              <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4">

                <h3 className="text-lg font-bold text-pink-400 mb-4">
                  {match.teams.teamB}
                </h3>

                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">

                  {match.teams.teamBPlayers.map((p) => (



                    <div
                      key={p._id}
                      className="flex items-center gap-3 bg-slate-900/70 hover:bg-slate-900 transition-all p-3 rounded-xl"
                    >

                      <img
                        src={p.avatar || 'https://via.placeholder.com/40'}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
                      />

                      <span className="text-white font-medium text-base">
                        {formatName(p.name)}
                      </span>

                    </div>

                  ))}
                  <select
                    onChange={(e) => addPlayerToTeam(e.target.value, 'B')}
                    className="w-full mt-3 bg-slate-900 border border-slate-700 rounded-xl p-2 text-sm"
                  >
                    <option value="">+ Add Player</option>

                    {allPlayers.map((p) => (
                      <option key={p._id} value={p._id}>
                        {formatName(p.name)}
                      </option>
                    ))}
                  </select>

                </div>
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { PlusCircle, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/matches').then(res => setMatches(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recent Matches</h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)]"
        >
          <PlusCircle size={20} /> New Match
        </button>
      </div>

      <div className="grid gap-4">
        {matches.map(match => (
          <motion.div 
            key={match._id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition-all cursor-pointer"
            onClick={() => navigate(`/match/${match._id}`)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-900 px-2 py-1 rounded-md">{match.status.replace('_', ' ')}</span>
                <h3 className="text-lg font-bold mt-2">{match.matchName}</h3>
              </div>
              <div className="text-right">
                <span className="text-sm text-slate-400">{match.overs} Overs</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center bg-slate-900/50 rounded-xl p-4 mt-4">
              <div className="text-center flex-1">
                <div className="font-bold text-lg">{match.teams.teamA}</div>
                <div className="text-sm text-slate-400 mt-1">
                  {match.innings[0] ? `${match.innings[0].totalRuns}/${match.innings[0].totalWickets}` : '0/0'}
                </div>
              </div>
              <div className="px-4 font-black text-slate-600 italic">VS</div>
              <div className="text-center flex-1">
                <div className="font-bold text-lg">{match.teams.teamB}</div>
                <div className="text-sm text-slate-400 mt-1">
                  {match.innings[1] && match.status !== 'not_started' ? `${match.innings[1].totalRuns}/${match.innings[1].totalWickets}` : 'Yet to bat'}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {matches.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlayCircle size={32} className="text-slate-600" />
            </div>
            <p>No matches found. Create one to start scoring!</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateMatchModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

function CreateMatchModal({ onClose }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    matchName: '', teamA: '', teamB: '', overs: 10, ballsPerOver: 6, tossWinner: '', tossDecision: 'bat'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/matches/create', formData);
      navigate(`/match/${res.data._id}`);
    } catch (error) {
      console.error(error);
      alert('Failed to create match');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-xl font-bold mb-4">Create New Match</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Match Name</label>
            <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Final Cup 2026" value={formData.matchName} onChange={e => setFormData({...formData, matchName: e.target.value})} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-1">Team A</label>
              <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" value={formData.teamA} onChange={e => setFormData({...formData, teamA: e.target.value})} />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-1">Team B</label>
              <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" value={formData.teamB} onChange={e => setFormData({...formData, teamB: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-1">Total Overs</label>
              <input required type="number" min="1" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" value={formData.overs} onChange={e => setFormData({...formData, overs: parseInt(e.target.value)})} />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-1">Balls per Over</label>
              <input required type="number" min="1" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" value={formData.ballsPerOver} onChange={e => setFormData({...formData, ballsPerOver: parseInt(e.target.value)})} />
            </div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 mt-2">
            <label className="block text-sm font-semibold mb-3">Toss Details (Optional)</label>
            <div className="flex gap-2 mb-3">
              {['', formData.teamA, formData.teamB].map(team => {
                if(!team && (formData.teamA || formData.teamB)) return null;
                const label = team || 'Not decided';
                return (
                  <button 
                    key={label} type="button"
                    onClick={() => setFormData({...formData, tossWinner: team})}
                    className={`flex-1 py-2 text-sm rounded-lg border ${formData.tossWinner === team ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            {formData.tossWinner && (
              <div className="flex gap-2">
                {['bat', 'bowl'].map(dec => (
                  <button 
                    key={dec} type="button"
                    onClick={() => setFormData({...formData, tossDecision: dec})}
                    className={`flex-1 py-2 text-sm rounded-lg border capitalize ${formData.tossDecision === dec ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                  >
                    {dec}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-colors">Start Match</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

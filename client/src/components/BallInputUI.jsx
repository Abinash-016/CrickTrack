import { useState } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, X } from 'lucide-react';

export default function BallInputUI({ matchId, onBallAdded }) {
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  // Advanced Modal State
  const [advancedType, setAdvancedType] = useState('runs'); // runs, extras, wicket
  const [advRuns, setAdvRuns] = useState(0);
  const [advExtra, setAdvExtra] = useState('none'); // wide, noBall, bye, legBye
  const [advWicket, setAdvWicket] = useState('none');

  const addBall = async (ballData) => {
    setLoading(true);
    try {
      await api.post(`/matches/${matchId}/ball`, ballData);
      onBallAdded();
      setShowOptions(false);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error adding ball');
    } finally {
      setLoading(false);
    }
  };

  const quickAdd = (runs) => {
    addBall({ runs, extras: { type: 'none', runs: 0 }, isLegalDelivery: true, wicket: { isWicket: false, type: 'none' } });
  };

  const quickExtra = (type) => {
    let ballData = { runs: 0, extras: { type: 'none', runs: 0 }, isLegalDelivery: true, wicket: { isWicket: false, type: 'none' } };
    ballData.extras = { type, runs: type === 'wide' || type === 'noBall' ? 1 : 0 };
    if (type === 'wide' || type === 'noBall') {
      ballData.isLegalDelivery = false;
    }
    addBall(ballData);
  };

  const quickWicket = () => {
    addBall({ runs: 0, extras: { type: 'none', runs: 0 }, isLegalDelivery: true, wicket: { isWicket: true, type: 'bowled' } });
  };

  const handleAdvancedSubmit = () => {
    let ballData = { runs: 0, extras: { type: 'none', runs: 0 }, isLegalDelivery: true, wicket: { isWicket: false, type: 'none' } };
    
    if (advancedType === 'runs') {
      ballData.runs = advRuns;
    } else if (advancedType === 'extras') {
      ballData.extras = { type: advExtra, runs: advExtra === 'wide' || advExtra === 'noBall' ? 1 + advRuns : advRuns };
      if (advExtra === 'wide' || advExtra === 'noBall') {
        ballData.isLegalDelivery = false;
      }
      if (advExtra === 'bye' || advExtra === 'legBye') {
         ballData.runs = 0; // The runs scored are extras, not off the bat
      }
    } else if (advancedType === 'wicket') {
      ballData.wicket = { isWicket: true, type: advWicket };
      ballData.runs = advRuns; // Can still run on a wicket (e.g. run out)
    }

    addBall(ballData);
  };

  return (
    <>
      <div className="grid grid-cols-6 gap-2 mb-2">
        {[0, 1, 2, 3, 4, 6].map(r => (
          <button 
            key={r} 
            disabled={loading}
            onClick={() => quickAdd(r)}
            className={`aspect-square rounded-xl font-black text-xl transition-all shadow-lg active:scale-95 flex items-center justify-center ${r === 4 ? 'bg-blue-600 text-white' : r === 6 ? 'bg-purple-600 text-white' : r === 0 ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-900'}`}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-2 mb-2">
        <button 
          disabled={loading}
          onClick={() => quickExtra('wide')}
          className="aspect-square rounded-xl font-bold bg-orange-500/20 text-orange-400 border border-orange-500/50 hover:bg-orange-500/30 active:scale-95 shadow-lg flex items-center justify-center text-sm"
        >
          Wd
        </button>
        <button 
          disabled={loading}
          onClick={() => quickExtra('noBall')}
          className="aspect-square rounded-xl font-bold bg-orange-500/20 text-orange-400 border border-orange-500/50 hover:bg-orange-500/30 active:scale-95 shadow-lg flex items-center justify-center text-sm"
        >
          Nb
        </button>
        <button 
          disabled={loading}
          onClick={() => quickExtra('bye')}
          className="aspect-square rounded-xl font-bold bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600 active:scale-95 shadow-lg flex items-center justify-center text-sm"
        >
          B
        </button>
        <button 
          disabled={loading}
          onClick={() => quickExtra('legBye')}
          className="aspect-square rounded-xl font-bold bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600 active:scale-95 shadow-lg flex items-center justify-center text-sm"
        >
          Lb
        </button>
        <button 
          disabled={loading}
          onClick={quickWicket}
          className="aspect-square rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-lg flex items-center justify-center text-sm"
        >
          W
        </button>
        <button 
          disabled={loading}
          onClick={() => {
            setAdvancedType('extras');
            setAdvExtra('wide');
            setAdvRuns(0);
            setShowOptions(true);
          }}
          className="aspect-square rounded-xl font-bold bg-slate-800 text-white border-2 border-slate-700 hover:bg-slate-700 active:scale-95 shadow-lg flex flex-col items-center justify-center text-xs"
        >
          <ChevronUp size={16} />
          More
        </button>
      </div>

      <AnimatePresence>
        {showOptions && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-2xl border-t border-x border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <h3 className="font-bold text-lg">Advanced Scoring</h3>
                <button onClick={() => setShowOptions(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                {/* Type Selection */}
                <div className="flex bg-slate-800 p-1 rounded-xl mb-6">
                  {['runs', 'extras', 'wicket'].map(type => (
                    <button 
                      key={type}
                      onClick={() => {
                        setAdvancedType(type);
                        setAdvRuns(0);
                        if (type === 'extras') setAdvExtra('wide');
                        if (type === 'wicket') setAdvWicket('bowled');
                      }}
                      className={`flex-1 py-2 text-sm font-bold capitalize rounded-lg transition-all ${advancedType === type ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Content based on type */}
                {advancedType === 'extras' && (
                  <div className="mb-6 space-y-3">
                    <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider block">Extra Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'wide', label: 'Wide (Wd)' },
                        { id: 'noBall', label: 'No Ball (Nb)' },
                        { id: 'bye', label: 'Bye (B)' },
                        { id: 'legBye', label: 'Leg Bye (Lb)' }
                      ].map(ext => (
                        <button 
                          key={ext.id}
                          onClick={() => setAdvExtra(ext.id)}
                          className={`py-3 rounded-xl font-bold border-2 transition-all ${advExtra === ext.id ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                        >
                          {ext.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {advancedType === 'wicket' && (
                  <div className="mb-6 space-y-3">
                    <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider block">Wicket Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['bowled', 'caught', 'runOut', 'stumped', 'lbw', 'hitWicket'].map(wt => (
                        <button 
                          key={wt}
                          onClick={() => setAdvWicket(wt)}
                          className={`py-2 text-sm rounded-xl font-bold border-2 transition-all capitalize ${advWicket === wt ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                        >
                          {wt.replace(/([A-Z])/g, ' $1').trim()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Runs Modifier */}
                <div className="mb-6 space-y-3">
                  <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider block">
                    {advancedType === 'extras' ? 'Additional Runs (e.g. Overthrows)' : advancedType === 'wicket' && advWicket === 'runOut' ? 'Runs Completed Before Wicket' : 'Runs'}
                  </label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4, 6].map(r => (
                      <button 
                        key={r}
                        onClick={() => setAdvRuns(r)}
                        className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${advRuns === r ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-900">
                <button 
                  onClick={handleAdvancedSubmit}
                  disabled={loading || (advancedType === 'extras' && advExtra === 'none') || (advancedType === 'wicket' && advWicket === 'none')}
                  className="w-full py-4 rounded-xl font-black text-lg bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)] disabled:opacity-50 transition-all hover:bg-emerald-500 active:scale-95"
                >
                  {loading ? 'Submitting...' : 'Confirm Ball'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

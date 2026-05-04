import { useState } from 'react';
import api from '../api';

export default function BallInputUI({ matchId, onBallAdded }) {
  const addBall = async (ballData) => {
    // Optimistically fire and forget to prevent blocking the UI
    try {
      await api.post(`/matches/${matchId}/ball`, ballData);
      onBallAdded();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error adding ball');
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



  return (
    <>
      <div className="grid grid-cols-6 gap-2 mb-2">
        {[0, 1, 2, 3, 4, 6].map(r => (
          <button 
            key={r} 
            onClick={() => quickAdd(r)}
            className={`h-10 rounded-xl font-black text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center ${r === 4 ? 'bg-blue-600 text-white' : r === 6 ? 'bg-purple-600 text-white' : r === 0 ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-900'}`}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2 mb-2">
        <button 
          onClick={() => quickExtra('wide')}
          className="h-10 rounded-xl font-bold bg-orange-500/20 text-orange-400 border border-orange-500/50 hover:bg-orange-500/30 active:scale-95 shadow-lg flex items-center justify-center text-sm"
        >
          Wd
        </button>
        <button 
          onClick={() => quickExtra('noBall')}
          className="h-10 rounded-xl font-bold bg-orange-500/20 text-orange-400 border border-orange-500/50 hover:bg-orange-500/30 active:scale-95 shadow-lg flex items-center justify-center text-sm"
        >
          Nb
        </button>
        <button 
          onClick={() => quickExtra('bye')}
          className="h-10 rounded-xl font-bold bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600 active:scale-95 shadow-lg flex items-center justify-center text-sm"
        >
          B
        </button>
        <button 
          onClick={() => quickExtra('legBye')}
          className="h-10 rounded-xl font-bold bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600 active:scale-95 shadow-lg flex items-center justify-center text-sm"
        >
          Lb
        </button>
        <button 
          onClick={quickWicket}
          className="h-10 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-lg flex items-center justify-center text-sm"
        >
          W
        </button>
      </div>

    </>
  );
}

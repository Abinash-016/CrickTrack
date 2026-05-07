import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [showExtraPopup, setShowExtraPopup] = useState(null);

  const quickAdd = (runs) => {
    addBall({ runs, extras: { type: 'none', runs: 0 }, isLegalDelivery: true, wicket: { isWicket: false, type: 'none' } });
  };

  const handleExtraBall = (type, batRuns, isWicket = false) => {

    addBall({
      runs: batRuns,
      extras: {
        type,
        runs: 1
      },
      isLegalDelivery: false,
      wicket: {
        isWicket,
        type: isWicket ? 'runOut' : 'none'
      }
    });

    setShowExtraPopup(null);
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
      <div className="grid grid-cols-3 gap-2 mb-2">
        <button
          onClick={() => quickExtra('wide')}
          className="h-10 rounded-xl font-bold bg-orange-500/20 text-orange-400 border border-orange-500/50 hover:bg-orange-500/30 active:scale-95 shadow-lg flex items-center justify-center text-sm"
        >
          Wd
        </button>
        <div className="relative flex justify-center">

          <button
            onClick={() =>
              setShowExtraPopup(
                showExtraPopup === 'noBall' ? null : 'noBall'
              )
            }
            className="h-10 w-full rounded-xl font-bold bg-orange-500/20 text-orange-400 border border-orange-500/50 hover:bg-orange-500/30 active:scale-95 shadow-lg flex items-center justify-center text-sm"
          >
            Nb
          </button>

          <AnimatePresence>

            {showExtraPopup === 'noBall' && (

              <>

                {[
                  { label: '0', x: -70, y: -10, runs: 0 },
                  { label: '1', x: -45, y: -60, runs: 1 },
                  { label: '2', x: 0, y: -85, runs: 2 },
                  { label: '3', x: 45, y: -60, runs: 3 },
                  { label: '4', x: 70, y: -10, runs: 4 },
                  { label: '6', x: 0, y: -140, runs: 6 },
                ].map((item, index) => (

                  <motion.button
                    key={item.label}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      x: item.x,
                      y: item.y
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 18,
                      delay: index * 0.03
                    }}
                    onClick={() =>
                      handleExtraBall('noBall', item.runs)
                    }
                    className="absolute w-12 h-12 rounded-full bg-orange-500 text-white font-black shadow-2xl"
                  >
                    {item.label}
                  </motion.button>

                ))}

                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: 0,
                    y: -200
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 18
                  }}
                  onClick={() =>
                    handleExtraBall('noBall', 0, true)
                  }
                  className="absolute px-4 h-11 rounded-full bg-red-600 text-white font-bold shadow-2xl text-sm"
                >
                  OUT
                </motion.button>

              </>

            )}

          </AnimatePresence>

        </div>

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

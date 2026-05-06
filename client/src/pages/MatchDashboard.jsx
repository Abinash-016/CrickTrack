import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Undo2, Camera } from 'lucide-react';
import LiveScore from '../components/LiveScore';
import Scorecard from '../components/Scorecard';
import BallInputUI from '../components/BallInputUI';
import { motion } from 'framer-motion';

export default function MatchDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'scorecard'
  const [showBottomNav, setShowBottomNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > 1280) {
          height = Math.round(height * (1280 / width));
          width = 1280;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

        api.post(`/matches/${id}/photo`, { photo: dataUrl })
          .then(() => fetchMatch())
          .catch(err => {
            console.error(err);
            alert('Failed to upload photo');
          })
          .finally(() => setUploadingPhoto(false));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowBottomNav(false);
      } else {
        setShowBottomNav(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const fetchMatch = async () => {
    try {

      const res = await api.get(`/matches/${id}`);

      setMatch(res.data);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMatch();
    const interval = setInterval(fetchMatch, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handleUndo = async () => {
    if (window.confirm("Are you sure you want to undo the last ball?")) {
      try {
        await api.post(`/matches/${id}/undo`);
        fetchMatch();
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || "Failed to undo");
      }
    }
  };

  if (!match) return null;

  const currentInnings = match.innings[match.currentInnings - 1];
  const isMatchComplete = match.status === 'completed';

  return (
    <div className="space-y-4 pb-36">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex bg-slate-800 rounded-lg p-1">
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'live' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setActiveTab('live')}
          >
            Live Score
          </button>
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'scorecard' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setActiveTab('scorecard')}
          >
            Scorecard
          </button>
        </div>
      </div>

      {isMatchComplete && (
        <div className="bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex flex-col items-center text-center font-bold gap-4">
          <span>Match Completed! Winner: {match.winner}</span>

          {match.winnersPhoto ? (
            <div className="w-full max-w-sm rounded-lg overflow-hidden border-2 border-emerald-500/50 shadow-xl">
              <img src={match.winnersPhoto} alt="Winners" className="w-full h-auto object-cover" />
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                id="cameraInput"
                className="hidden"
                onChange={handlePhotoCapture}
                disabled={uploadingPhoto}
              />
              <label
                htmlFor="cameraInput"
                className={`flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-lg ${uploadingPhoto ? 'opacity-50 pointer-events-none' : 'active:scale-95'}`}
              >
                <Camera size={20} />
                {uploadingPhoto ? 'Processing Photo...' : 'Capture Winners Photo'}
              </label>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: activeTab === 'live' ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'live' ? (
          <LiveScore match={match} currentInnings={currentInnings} />
        ) : (
          <Scorecard match={match} />
        )}
      </motion.div>

      {/* Fixed Bottom UI for Scoring Actions */}
      {activeTab === 'live' && !isMatchComplete && (
        <div className={`fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 ${showBottomNav ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="container mx-auto max-w-lg md:max-w-3xl relative">
            <div className="flex justify-between items-center mb-3 px-2">
              <span className="text-sm font-semibold text-slate-300 tracking-wide uppercase">Scoring Actions</span>
              <button onClick={handleUndo} className="text-sm text-red-400 flex items-center gap-1 hover:text-red-300 transition-colors font-medium">
                <Undo2 size={16} /> Undo Last Ball
              </button>
            </div>
            <BallInputUI matchId={id} onBallAdded={fetchMatch} />
          </div>
        </div>
      )}
    </div>
  );
}

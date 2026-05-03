import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MatchDashboard from './pages/MatchDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 py-4 sticky top-0 z-50">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
              CricTrack<span className="text-white">Live</span>
            </h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6 max-w-lg md:max-w-3xl">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/match/:id" element={<MatchDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

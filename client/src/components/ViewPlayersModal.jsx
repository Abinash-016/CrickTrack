import { useEffect, useState } from 'react';
import api from '../api';

export default function ViewPlayersModal({ onClose }) {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        api.get('/players')
            .then(res => setPlayers(res.data))
            .catch(console.error);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-900 p-6 rounded-xl w-full max-w-md">

                <h3 className="text-lg font-bold mb-4">All Players</h3>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {players.map(p => (
                        <div key={p._id} className="bg-slate-800 px-3 py-2 rounded">
                            {p.name}
                        </div>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="mt-4 w-full bg-slate-700 py-2 rounded"
                >
                    Close
                </button>

            </div>
        </div>
    );
}
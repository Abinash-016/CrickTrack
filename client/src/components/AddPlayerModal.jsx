import { useState } from 'react';
import api from '../api';

export default function AddPlayerModal({ onClose }) {
    const [name, setName] = useState('');

    const handleAdd = async () => {
        if (!name) return alert('Enter player name');
        try {
            await api.post('/players/create', { name });
            onClose();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to add player. May be player name Already exists😂');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-900 p-6 rounded-xl w-full max-w-sm">
                <h3 className="text-lg font-bold mb-4">Add Player</h3>

                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Player name"
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded mb-4"
                />

                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 bg-slate-700 py-2 rounded">
                        Cancel
                    </button>
                    <button onClick={handleAdd} className="flex-1 bg-green-600 py-2 rounded text-white">
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}